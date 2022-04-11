'use strict';
let SettledBillModel = require('../models/SettledBillModel');
let BaseService = ACCELERONCORE._services.BaseService;
class SettledBillService extends BaseService {
  constructor(request) {
    super(request);
    this.request = request;
    this.SettledBillModel = new SettledBillModel(request);
  }

  async search(filter) {
    switch (filter.key.toUpperCase()) {
      case 'CUSTOMER': {
        return this.SettledBillModel.getSettledBillByMobile(filter).catch(
          (error) => {
            throw error;
          },
        );
      }
      case 'AMOUNT': {
        return this.SettledBillModel.getSettledBillByAmount(filter).catch(
          (error) => {
            throw error;
          },
        );
      }
      case 'STEWARD': {
        return this.SettledBillModel.getSettledBillBySteward(filter).catch(
          (error) => {
            throw error;
          },
        );
      }
      case 'PAYMENT': {
        return this.SettledBillModel.getSettledBillByPayment(filter).catch(
          (error) => {
            throw error;
          },
        );
      }

      case 'MACHINE': {
        return this.SettledBillModel.getSettledBillByMachine(filter).catch(
          (error) => {
            throw error;
          },
        );
      }

      case 'SESSION': {
        return this.SettledBillModel.getSettledBillBySession(filter).catch(
          (error) => {
            throw error;
          },
        );
      }
      case 'DISCOUNT': {
        return this.SettledBillModel.getSettledBillByDiscount(filter).catch(
          (error) => {
            throw error;
          },
        );
      }
      case 'REFUND': {
        return this.SettledBillModel.getSettledBillByRefund(filter).catch(
          (error) => {
            throw error;
          },
        );
      }
      case 'TABLE': {
        return this.SettledBillModel.getSettledBillByTable(filter).catch(
          (error) => {
            throw error;
          },
        );
      }

      case 'TYPE': {
        return this.SettledBillModel.getSettledBillByBillingMode(filter).catch(
          (error) => {
            throw error;
          },
        );
      }

      default: {
        throw new ErrorResponse(
          ResponseType.ERROR,
          "Filter method doesn't exist",
        );
      }
    }
  }

  async searchBill(filter) {
    return this.SettledBillModel.getSettledBillByBillNumber(filter).catch(
      (error) => {
        throw error;
      },
    );
  }

  async searchDefault(filter) {
    return this.SettledBillModel.getSettledBillByDefault(filter).catch(
      (error) => {
        throw error;
      },
    );
  }

  async searchAll(filter) {
    return this.SettledBillModel.getSettledBillByAll(filter).catch((error) => {
      throw error;
    });
  }
}
module.exports = SettledBillService;
