'use strict';
let BillingModuleModel = require('../models/BillingModuleModel');
let BaseService = ACCELERONCORE._services.BaseService;
class BillingModuleService extends BaseService {
  constructor(request) {
    super(request);
    this.request = request;
    this.BillingModuleModel = new BillingModuleModel(request);
  }
  async cancelBill(filter) {
    return this.PendingModuleService.cancelBill(filter).catch((error) => {
      throw error;
    });
  }
}
module.exports = BillingModuleService;
