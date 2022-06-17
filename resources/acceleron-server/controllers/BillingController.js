"use strict";
let BaseController = ACCELERONCORE._controllers.BaseController;
let BillingService = require("../services/BillingService");

var _ = require("underscore");

class BillingController extends BaseController {
  constructor(request) {
    super(request);
    this.BillingService = new BillingService(request);
  }

  async generateBill() {
    let kotNumber = this.request.query.kotnumber;

    return await this.BillingService.generateBill(kotNumber).catch((error) => {
      throw error;
    });
  }
  async settleBill() {
    let billNumber = this.request.query.billno;
    // totalSplitSum,splitPayHoldList,comments
    const { splitPayHoldList } = this.request.body;
    const billingDetails = { splitPayHoldList };
    return await this.BillingService.settleBill(
      billNumber,
      billingDetails
    ).catch((error) => {
      throw error;
    });
  }

  async unsettleBill() {
    let billNumber = this.request.query.billno;
    return await this.BillingService.unsettleBill(
      billNumber,
    ).catch((error) => {
      throw error;
    });
  }

  // async cancelBill() {
  //   var filter = {};
  //   if (this.request.body && this.request.query.bill_id) {
  //     filter.file = this.request.body;
  //     filter.bill_id = this.request.query.bill_id;
  //   }

  //   return await this.BillingService.cancelBill(filter).catch((error) => {
  //     throw error;
  //   });
  // }
}

module.exports = BillingController;
