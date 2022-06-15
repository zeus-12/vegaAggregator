"use strict";
let BaseService = ACCELERONCORE._services.BaseService;
let BillingModel = require("../models/BillingModel");
let KOTService = require("./KOTService");
let SettingsService = require("./SettingsService");
let TableService = require("./TableService");
let KOTUtils = require("../utils/KOTUtils");
let BillUtils = require("../utils/BillUtils");
let TimeUtils = require("../utils/TimeUtils");
let MessagingService = require("./common/MessagingService");
var moment = require("moment");

var _ = require("underscore");
var async = require("async");

class BillingService extends BaseService {
  constructor(request) {
    super(request);
    this.request = request;
    this.BillingModel = new BillingModel(request);
    this.KOTService = new KOTService(request);
    this.TableService = new TableService(request);
    this.SettingsService = new SettingsService(request);
    this.MessagingService = new MessagingService(request);
  }

  async generateBill(kotnumber) {
    var kot_id = KOTUtils.frameKotNumber(
      this.request.loggedInUser.branch,
      kotnumber
    );
    var data = await this.KOTService.getKOTById(kot_id).catch((error) => {
      throw error;
    });
    var kot_rev = data._rev;
    let billNumber = await this.SettingsService.generateNextIndex("BILL");

    if (data._id != "") {
      var kotfile = data;
      var raw_cart = kotfile.cart;

      kotfile.cart = KOTUtils.reduceCart(raw_cart);
      kotfile.billNumber = billNumber;
      kotfile = KOTUtils.initialisePaymentDetails(kotfile);

      kotfile.outletCode = this.request.loggedInUser.branch;

      /* BILL SUM CALCULATION */

      //Calculate Sum to be paid
      var { grandPayableBill, totalPackagedAmount, totalCartAmount } =
        KOTUtils.billSumCalculation(kotfile.cart);

      var { kotfile, grandPayableBill } = KOTUtils.addExtras(
        grandPayableBill,
        kotfile
      );

      grandPayableBill = parseFloat(grandPayableBill).toFixed(2);
      var grandPayableBillRounded = Math.round(grandPayableBill);

      kotfile = KOTUtils.roundOffFigures(
        kotfile,
        grandPayableBillRounded,
        totalPackagedAmount,
        totalCartAmount,
        grandPayableBill
      );

      kotfile.timeBill = TimeUtils.getCurrentTimestamp();

      //Remove Unwanted Stuff
      kotfile = KOTUtils.cleanUpComments(kotfile);

      /*Save NEW BILL*/

      //Remove _rev and _id (KOT File Scraps!)
      var newBillFile = kotfile;
      delete newBillFile._id;
      delete newBillFile._rev;
      newBillFile._id = BillUtils.frameBillNumber(
        this.request.loggedInUser.branch,
        billNumber
      );

      var systemOptions = await this.SettingsService.getSettingsById(
        "ACCELERATE_SYSTEM_OPTIONS"
      );
      var preferenceData = systemOptions.value.find(
        (option) => option.systemName === "Z500"
      );
      var billSettleLater = preferenceData.data.find(
        (item) => item.name === "billSettleLater"
      ).value;

      let tableData = await this.TableService.fetchTablesByFilter(
        "name",
        kotfile.table
      );
      const modeType = kotfile.orderDetails.modeType;

      var isTableStatusUpdated, smsSent, isTableSetFree;

      await this.BillingModel.generateBill(newBillFile)
        .then(
          await this.KOTService.deleteKOTById(kot_id)
            .then(async () => {
              if (modeType == "DINE" && billSettleLater == "YES") {
                await this.TableService.resetTable(kotfile.table)
                  .then((isTableSetFree = true))
                  .catch((err) => (isTableSetFree = false));
              } else if (modeType == "DINE" && billSettleLater !== "YES") {
                tableData = KOTUtils.updateTableForBilling(
                  tableData,
                  kotfile,
                  billNumber
                );

                await this.TableService.updateTableByFilter(
                  "name",
                  kotfile.table,
                  tableData
                )
                  .then((isTableStatusUpdated = true))
                  .catch((err) => (isTableStatusUpdated = false));
              }

              if (modeType == "DELIVERY") {
                var messageData = {
                  customerName: newBillFile.customerName,
                  customerMobile: newBillFile.customerMobile,
                  totalBillAmount: newBillFile.payableAmount,
                  accelerateLicence: this.request.loggedInUser.machineId,
                  accelerateClient: this.request.loggedInUser.client,
                };
                await this.MessagingService.postMessageRequest(
                  kotfile.customerMobile,
                  messageData,
                  "DELIVERY_CONFIRMATION"
                )
                  .then((smsSent = true))
                  .catch((err) => (smsSent = false));
              }
            })
            .catch((error) => {
              throw error;
            })
        )

        .catch((error) => {
          throw error;
        });

      var response = {
        newBillFile,
        billingMode: modeType,
        isTableSetFree,
        isTableStatusUpdated,
        smsSent,
      };

      return response;
    }
  }

  async settleBill(billNumber, billingDetails) {
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

    billData.outletCode = this.request.loggedInUser.branch;

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
    var billRev = billData._rev;

    //Clean _rev and _id (billData Scraps)
    delete billData._id;
    delete billData._rev;

    billData._id = this.request.loggedInUser.branch + "_INVOICE_" + billNumber;
    var pointer = this;
    await this.BillingModel.generateInvoice(billData, billNumber)
      .then(async () => {
        await pointer.deleteBillById(billNumber, billRev);
      })
      .then(async () => {
        if (billData.orderDetails.modeType == "DINE")
          await pointer.TableService.resetTable(billData.table);
      })
      .catch((error) => {
        throw error;
      });

    return { totalSplitSum, billNumber };
  }

  async unsettleBill(billNumber) {
    let invoiceData = await this.getInvoiceById(billNumber).catch((error) => {
      throw error;
    });


    //refunded orders cannot be settled
    if (invoiceData.refundDetails && invoiceData.refundDetails.amount != 0) {
      throw new ErrorResponse(
        BaseResponse.ResponseType.BAD_REQUEST,
        ErrorType.unsettle_refunded_orders,
      );
    }

    //deleting invoice-related metadata
    invoiceData._id = invoiceData._id.replace("INVOICE", "BILL");
    delete invoiceData._rev;
    delete invoiceData.dateStamp;
    delete invoiceData.paymentMode;
    delete invoiceData.totalAmountPaid;
    delete invoiceData.timeSettle;
    delete invoiceData.paymentReference;
    delete invoiceData.paymentSplits;

    delete invoiceData.roundOffAmount;
    delete invoiceData.tipsAmount;


    //sending to accelerate-bills
    const billData = await this.BillingModel.generateBill(invoiceData).then(
      async () => await this.deleteInvoiceById(billNumber).catch((error) => {
        throw error;
      })
    ).catch((error) => {
      throw error;
    });

    return {billData};
  }

  async deleteInvoiceById(billNumber) {
    var invoiceId = this.request.loggedInUser.branch + "_INVOICE_" + billNumber;
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
    var invoiceId = this.request.loggedInUser.branch + "_INVOICE_" + billNumber;
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
