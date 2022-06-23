"use strict";
let BaseService = ACCELERONCORE._services.BaseService;
let BillingModel = require("../models/BillingModel");
let KOTService = require("./KOTService");
let MenuService = require("./MenuService");
let BillingHelperService = require("./helpers/BillingHelperService");
let PreferenceHelperService = require("./helpers/PreferenceHelperService");
let TableService = require("./TableService");
let MessagingService = require("./common/MessagingService");
let BillingCore = require("../billing-core/BillingCore");
let KOTUtils = require("../utils/KOTUtils");
let BillingUtils = require("../utils/BillingUtils");
let TimeUtils = require("../utils/TimeUtils");
let MessagingTypes = require("../constants/MessagingTypes");
let SystemOptions = require("../constants/SystemOptions");

var moment = require("moment");
var _ = require("underscore");


class BillingService extends BaseService {
  constructor(request) {
    super(request);
    this.request = request;
    this.BillingModel = new BillingModel(request);
    this.KOTService = new KOTService(request);
    this.MenuService = new MenuService(request);
    this.TableService = new TableService(request);
    this.MessagingService = new MessagingService(request);
    this.BillingHelperService = new BillingHelperService(request);
    this.PreferenceHelperService = new PreferenceHelperService(request);
    this.BillingCore = new BillingCore();
  }

  async generateBill(kotNumber) {

    const branchName = this.request.loggedInUser.branch;
    const systemId = this.request.loggedInUser.machineId;
    const clientName = this.request.loggedInUser.client;

    var kot_id = KOTUtils.frameKotNumber(branchName, kotNumber);
    var kotData = await this.KOTService.getKOTById(kot_id);
    const reducedCart = KOTUtils.reduceCart(kotData.cart);

    var masterMenu = await this.MenuService.getFullMenu();
    var detailedBillingMode = await this.BillingHelperService.getDetailedBillingModeByName(kotData.orderDetails.mode);

    var generatedBill = this.BillingCore.generateBill(masterMenu, reducedCart, detailedBillingMode, kotData.customExtras, kotData.discount);

    const billNumber = await this.BillingHelperService.acquireBillNumber();
    BillingUtils.propagateKOTDataAndAssignBillNumber(generatedBill, billNumber, branchName, kotData);

    await this.BillingModel.postBill(generatedBill);
    await this.KOTService.deleteKOTById(kot_id);

    var isTableStatusUpdated, isSMSSent, isTableSetFree;
    const modeType = generatedBill.orderDetails.modeType;
    switch (modeType) {
      case "DINE": {
          var billSettleLaterPreference = this.PreferenceHelperService.getPreference(systemId, SystemOptions.SETTLE_BILL_LATER);
          if(billSettleLaterPreference == "YES") {
            isTableSetFree = await this.TableService.setTableFree(kotData.table);
          }
          else {
            var tableDataUpdateRequest = {
              "payableAmount" : generatedBill.payableAmount,
              "billNumber" : generatedBill.billNumber
            }
            isTableStatusUpdated = await this.TableService.updateTableAsBilled(generatedBill.table, tableDataUpdateRequest);
          }
          break;
      }
      case "DELIVERY": {
          var messageData = {
            customerName: generatedBill.customerName,
            customerMobile: generatedBill.customerMobile,
            totalBillAmount: generatedBill.payableAmount,
            accelerateLicence: systemId,
            accelerateClient: clientName,
          };
          isSMSSent = await this.MessagingService.sendConfirmationSMS(generatedBill.customerMobile, messageData, MessagingTypes.DELIVERY_CONFIRMATION);
          break;
      }
    }

    return {
      newBillFile: generatedBill,
      billingMode: modeType,
      isTableSetFree,
      isTableStatusUpdated,
      smsSent : isSMSSent,
    };
  }


  async settleBill(billNumber, billingDetails) {
    if (this.request.loggedInUser.role != 'ADMIN') {
      throw new ErrorResponse(
        ResponseType.BAD_REQUEST,
        ErrorType.admin_access_required
      );
    }
    const { splitPayHoldList } = billingDetails;
    //get bill data
    let billData = await this.getBillById(billNumber).catch((error) => {
      throw error;
    });
    let fullAmount = billData.payableAmount;

    var paymentModeSelected = "";
    if (splitPayHoldList.length > 1) {
      paymentModeSelected = "MULTIPLE";
    } else {
      paymentModeSelected = splitPayHoldList[0].code;

      var comments = splitPayHoldList[0].reference;
      if (comments && comments != "") {
        billData.paymentReference = comments;
      }
    }

    var splitObj = [];

    var totalSplitSum = 0;
    var n = 0;
    var actualNoZeroSplits = 0;
    while (splitPayHoldList[n]) {
      if (splitPayHoldList[n].amount > 0) {
        //Skip Zeros
        totalSplitSum += parseFloat(splitPayHoldList[n].amount);
        splitObj.push(splitPayHoldList[n]);
        actualNoZeroSplits++;
      }

      n++;
    }

    totalSplitSum = parseFloat(totalSplitSum).toFixed(2);
    totalSplitSum = parseFloat(totalSplitSum);

    //In case multiple selected but value added only for one, all others kept empty
    if (splitPayHoldList.length > 1 && actualNoZeroSplits == 1) {
      paymentModeSelected = splitObj[0].code;

      var comments = splitObj[0].reference;
      if (comments && comments != "") {
        billData.paymentReference = comments;
      }
    }

    billData.timeSettle = TimeUtils.getCurrentTimestamp();
    billData.totalAmountPaid = parseFloat(totalSplitSum).toFixed(2);
    billData.totalAmountPaid = parseFloat(billData.totalAmountPaid);

    billData.paymentMode = paymentModeSelected;
    billData.dateStamp = moment(billData.date, "DD-MM-YYYY").format("YYYYMMDD");

    billData.outletCode = this.request.loggedInUser.branch ? this.request.loggedInUser.branch : "UNKNOWN";;

    // Split Payment details
    if (paymentModeSelected == "MULTIPLE") {
      billData.paymentSplits = splitObj;
    }

    //Round Off or Tips calculation - auto
    if (totalSplitSum < fullAmount) {
      billData.roundOffAmount = parseFloat(fullAmount - totalSplitSum).toFixed(
        2
      );
      billData.roundOffAmount = parseFloat(billData.roundOffAmount);
    }

    if (totalSplitSum > fullAmount) {
      billData.tipsAmount = parseFloat(totalSplitSum - fullAmount).toFixed(2);
      billData.tipsAmount = parseFloat(billData.tipsAmount);
    }
    var maxTolerance = fullAmount*0.05;
    if(maxTolerance < 10){
      maxTolerance = 10;
    }

    if(totalSplitSum < fullAmount && fullAmount-totalSplitSum > maxTolerance){
      throw new ErrorResponse(
        BaseResponse.ResponseType.BAD_REQUEST,
        ErrorType.maxTolerance_error
      );
    }
    var billRev = billData._rev;

    //Clean _rev and _id (billData Scraps)
    delete billData._id;
    delete billData._rev;
    var branch = this.request.loggedInUser.branch;
    billData._id = BillingUtils.frameInvoiceNumber(branch, billNumber);
    var pointer = this;
    await this.BillingModel.generateInvoice(billData, billNumber)
      .then(async () => {
        await pointer.deleteBillById(billNumber, billRev).catch((error) => {
          throw error;
        });
        if (billData.orderDetails.modeType == "DINE")
          await pointer.TableService.resetTable(billData.table).catch(
            (error) => {
              throw error;
            }
          );
      })
      .catch((error) => {
        throw error;
      });

    return { totalSplitSum, billNumber };
  }

  async unsettleBill(billNumber) {
    let reversed_bill = await this.getInvoiceById(billNumber).catch((error) => {
      throw error;
    });

    //refunded orders cannot be settled
    if (reversed_bill.refundDetails && reversed_bill.refundDetails.amount != 0) {
      throw new ErrorResponse(
        BaseResponse.ResponseType.BAD_REQUEST,
        ErrorType.unsettle_refunded_orders
      );
    }

    //deleting invoice-related metadata
    reversed_bill._id = BillingUtils.frameInvoiceNumberFromBillNumber(reversed_bill._id);
    delete reversed_bill._rev;
    delete reversed_bill.dateStamp;
    delete reversed_bill.paymentMode;
    delete reversed_bill.totalAmountPaid;
    delete reversed_bill.timeSettle;
    delete reversed_bill.paymentReference;
    delete reversed_bill.paymentSplits;

    delete reversed_bill.roundOffAmount;
    delete reversed_bill.tipsAmount;

    //sending to accelerate-bills
    const billData = await this.BillingModel.postBill(reversed_bill)
      .then(
        async () =>
          await this.deleteInvoiceById(billNumber).catch((error) => {
            throw error;
          })
      )
      .catch((error) => {
        throw error;
      });

    return { billData };
  }

  async deleteInvoiceById(billNumber) {
    const branch = this.request.loggedInUser.branch
    var invoiceId = BillingUtils.frameInvoiceNumber(branch,billNumber)
    const invoiceData = await this.getInvoiceById(billNumber);
    const invoiceRev = invoiceData._rev;

    return await this.BillingModel.deleteInvoiceById(
      invoiceId,
      invoiceRev
    ).catch((error) => {
      throw error;
    });
  }

  async getInvoiceById(billNumber) {
    const branch = this.request.loggedInUser.branch
    var invoiceId = BillingUtils.frameInvoiceNumber(branch,billNumber)
    const invoiceData = await this.BillingModel.getInvoiceById(invoiceId).catch(
      (error) => {
        throw error;
      }
    );
    if (_.isEmpty(invoiceData)) {
      throw new ErrorResponse(
        ResponseType.NO_RECORD_FOUND,
        ErrorType.no_matching_results
      );
    }
    return invoiceData;
  }

  async getBillById(billNumber) {
    var billId = this.request.loggedInUser.branch + "_BILL_" + billNumber;
    const billData = await this.BillingModel.getBillById(billId).catch(
      (error) => {
        throw error;
      }
    );
    if (_.isEmpty(billData)) {
      throw new ErrorResponse(
        ResponseType.NO_RECORD_FOUND,
        ErrorType.no_matching_results
      );
    }
    return billData;
  }

  async deleteBillById(billNumber) {
    const billData = await this.getBillById(billNumber);
    const billRev = billData._rev;
    var billId = this.request.loggedInUser.branch + "_BILL_" + billNumber;
    return await this.BillingModel.deleteBillById(billId, billRev).catch(
      (error) => {
        throw error;
      }
    );
  }

  // async cancelBill(filter) {
  //   return this.BillingService.cancelBill(filter).catch((error) => {
  //     throw error;
  //   });
  // }
}

module.exports = BillingService;
