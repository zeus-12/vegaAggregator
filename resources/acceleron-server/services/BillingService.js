"use strict";
let BaseService = ACCELERONCORE._services.BaseService;
let BillingModel = require("../models/BillingModel");
let KOTService = require("./KOTService");
let SettingsService = require("./SettingsService");
let TableService = require("./TableService");
let KOTUtils = require("../utils/KOTUtils");
let TimeUtils = require("../utils/TimeUtils");

var _ = require("underscore");
var async = require("async");

class BillingService extends BaseService {
  constructor(request) {
    super(request);
    this.request = request;
    this.BillingModel = new BillingModel(request);
    this.KOTService = new KOTService(request);
    this.SettingsService = new SettingsService(request);
  }

  async generateBill(kotnumber) {
    //todo
    var kot_id = "ADYAR_KOT_" + kotnumber;
    var data = await this.KOTService.getKOTById(kot_id).catch((error) => {
      throw error;
    });
    var kot_rev = data._rev;
    let billNumber = await this.SettingsService.generateNextIndex("BILL");

    if (data._id != "") {
      var kotfile = data;
      var raw_cart = kotfile.cart;

      kotfile.cart = KOTUtils.reduceCart(raw_cart);

      // var memory_id = kotfile._id;
      // var memory_rev = kotfile._rev;

      kotfile.billNumber = billNumber;
      kotfile = KOTUtils.initialisePaymentDetails(kotfile);

      // var branch_code = window.localStorage.accelerate_licence_branch
      //   ? window.localStorage.accelerate_licence_branch
      //   : "";
      // todo
      // kotfile.outletCode = branch_code != "" ? branch_code : "UNKNOWN";
      kotfile.outletCode = "ADYAR";

      /* BILL SUM CALCULATION */

      //Calculate Sum to be paid
      var { grandPayableBill, totalPackagedAmount, totalCartAmount } =
        KOTUtils.billSumCalculation(kotfile.cart);
      console.log(kotfile);

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
      newBillFile._id = "ADYAR_BILL_" + billNumber;
      //Set _id from Branch mentioned in Licence

      return await this.BillingModel.generateBill(newBillFile, kot_id, kot_rev)
        .then(
          await this.KOTService.deleteKOTById(kot_id).catch((error) => {
            throw error;
          })
        )
        .catch((error) => {
          throw error;
        });
    }
  }
}

module.exports = BillingService;