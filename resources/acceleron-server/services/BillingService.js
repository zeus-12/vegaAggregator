"use strict";
let BaseService = ACCELERONCORE._services.BaseService;
let BillingModel = require("../models/BillingModel");
let KOTService = require("./KOTService");
let SettingsService = require("./SettingsService");
let TableService = require("./TableService");
let KOTUtils = require("../utils/KOTUtils");

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
    let billNumber = await this.SettingsService.generateNextIndex(
      "ACCELERATE_BILL_INDEX"
    );

    if (data._id != "") {
      var kotfile = data;

      var raw_cart = kotfile.cart;

      kotfile.cart = KOTUtils.reduceCart(raw_cart);

      var memory_id = kotfile._id;
      var memory_rev = kotfile._rev;

      (kotfile.billNumber = billNumber), (kotfile.paymentMode = "");
      kotfile.totalAmountPaid = "";
      kotfile.paymentReference = "";

      // var branch_code = window.localStorage.accelerate_licence_branch
      //   ? window.localStorage.accelerate_licence_branch
      //   : "";
      // todo
      // kotfile.outletCode = branch_code != "" ? branch_code : "UNKNOWN";
      kotfile.outletCode = "ADYAR";

      /* BILL SUM CALCULATION */

      //Calculate Sum to be paid
      var grandPayableBill = 0;

      var totalCartAmount = 0;
      var totalPackagedAmount = 0;

      var n = 0;
      while (kotfile.cart[n]) {
        totalCartAmount += kotfile.cart[n].price * kotfile.cart[n].qty;

        if (kotfile.cart[n].isPackaged) {
          totalPackagedAmount += kotfile.cart[n].qty * kotfile.cart[n].price;
        }

        n++;
      }

      grandPayableBill += totalCartAmount;

      //add extras
      // if (!jQuery.isEmptyObject(kotfile.extras)) {
      if (!(Object.keys(kotfile.extras).length === 0)) {
        var m = 0;
        while (kotfile.extras[m]) {
          grandPayableBill += kotfile.extras[m].amount;
          m++;
        }
      }

      //add custom extras if any
      // if (!jQuery.isEmptyObject(kotfile.customExtras)) {
      if (!(Object.keys(kotfile.customExtras).length === 0)) {
        grandPayableBill += kotfile.customExtras.amount;
      }

      //substract discounts if any
      // if (!jQuery.isEmptyObject(kotfile.discount)) {
      if (!(Object.keys(kotfile.discount).length === 0)) {
        grandPayableBill -= kotfile.discount.amount;

        if (kotfile.discount.type == "NOCOSTBILL") {
          //Remove all the charges (Special Case)
          grandPayableBill = 0;

          kotfile.customExtras = {};
          kotfile.extras = [];
        }
      }
      function properRoundOff(amount) {
        return Math.round(amount);
      }

      grandPayableBill = parseFloat(grandPayableBill).toFixed(2);
      // grandPayableBillRounded = properRoundOff(grandPayableBill);
      var grandPayableBillRounded = Math.round(grandPayableBill);

      kotfile.payableAmount = grandPayableBillRounded;
      kotfile.grossCartAmount = totalCartAmount;
      kotfile.grossPackagedAmount = totalPackagedAmount;

      kotfile.calculatedRoundOff =
        Math.round((grandPayableBillRounded - grandPayableBill) * 100) / 100;

      function getCurrentTime(type) {
        var today = new Date();
        var time;
        var dd = today.getDate();
        var mm = today.getMonth() + 1; //January is 0!
        var yyyy = today.getFullYear();
        var hour = today.getHours();
        var mins = today.getMinutes();

        if (dd < 10) {
          dd = "0" + dd;
        }

        if (mm < 10) {
          mm = "0" + mm;
        }

        if (hour < 10) {
          hour = "0" + hour;
        }

        if (mins < 10) {
          mins = "0" + mins;
        }

        today = dd + "-" + mm + "-" + yyyy;
        time = hour + "" + mins;

        if (type == "TIME") {
          return time;
        }

        if (type == "DATE") return today;

        if (type == "DATE_DDMMYY") return dd + "" + mm + "" + yyyy;

        if (type == "DATE_DD-MM-YY") return dd + "-" + mm + "-" + yyyy;

        if (type == "DATE_YYYY-MM-DD") return yyyy + "-" + mm + "-" + dd;

        if (type == "DATE_STAMP") return yyyy + "" + mm + "" + dd;
      }
      kotfile.timeBill = getCurrentTime("TIME");

      //Remove Unwanted Stuff
      KOTUtils.cleanUpComments(kotfile);

      /*Save NEW BILL*/

      //Remove _rev and _id (KOT File Scraps!)
      var newBillFile = kotfile;

      await this.KOTService.deleteKOTById(kot_id).catch((error) => {
        throw error;
      });

      delete newBillFile._id;
      delete newBillFile._rev;
      newBillFile._id = "ADYAR_BILL_" + billNumber;
      //Set _id from Branch mentioned in Licence

      return await this.BillingModel.generateBill(
        newBillFile,
        kot_id,
        kot_rev
      ).catch((error) => {
        throw error;
      });
    }
  }
}

module.exports = BillingService;
