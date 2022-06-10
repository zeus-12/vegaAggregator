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
    //todo

    var kot_id = KOTUtils.frameKotNumber(this.request.loggedInUser.branch, kotnumber)
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

      // todo

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
      newBillFile._id = BillUtils.frameBillNumber(this.request.loggedInUser.branch, billNumber)
    


      var systemOptions = await this.SettingsService.getSettingsById(
        "ACCELERATE_SYSTEM_OPTIONS"
      );
      var preferenceData = systemOptions.value.find(
        (option) => option.systemName === "Z500"
      );
      var billSettleLater = preferenceData.data.find(
        (item) => item.name === "billSettleLater"
      ).value;

      var optionalPageRef = this.request.body.optionalPageRef;
      let tableData = await this.TableService.fetchTablesByFilter(
        "name",
        kotfile.table
      );
      const modeType = kotfile.orderDetails.modeType;
        


        var isTableStatusUpdated, smsSent,isTableSetFree ;


       await this.BillingModel.generateBill(newBillFile, kot_id, kot_rev)
        .then(
          await this.KOTService.deleteKOTById(kot_id)
            .then(async() => {
              if (modeType == "DINE" && billSettleLater == "YES") {
                  await this.TableService.resetTableToFree(kotfile.table).then(isTableSetFree = true).catch(err=> isTableSetFree=false);
              }
              else if(modeType == "DINE" && billSettleLater !== "YES") {
                  tableData = KOTUtils.updateTableForBilling(
                    tableData,
                    kotfile,
                    billNumber
                  );

                  await this.TableService.updateTableByFilter(
                    "name",
                    kotfile.table,
                    tableData
                  ).then(isTableStatusUpdated = true).catch(err => isTableStatusUpdated=false);
                }

              if (optionalPageRef == "ORDER_PUNCHING") {
                //todo
                // await this.KOTService.renderCustomerInfo();
                var messageData = {
                  customerName: newBillFile.customerName,
                  customerMobile: newBillFile.customerMobile,
                  totalBillAmount: newBillFile.payableAmount,
                  accelerateLicence: this.request.loggedInUser.machineId,
                  accelerateClient: this.request.loggedInUser.client,
                };
                if (modeType == "DELIVERY") {
                  await this.MessagingService.postMessageRequest(
                    kotfile.customerMobile,
                    messageData,
                    "DELIVERY_CONFIRMATION"
                  ).then(smsSent=true).catch(err=>smsSent=false);
                }
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
        data: newBillFile,
        billingMode: newBillFile.orderDetails.modeType,
        isTableSetFree,
        isTableStatusUpdated,
        smsSent
      }
      
      return response
    }
  }

  // async cancelBill(filter) {
  //   return this.BillingService.cancelBill(filter).catch((error) => {
  //     throw error;
  //   });
  // }
}

module.exports = BillingService;
