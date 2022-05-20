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
}

module.exports = BillingController;
