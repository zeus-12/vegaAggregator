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
    switch (filter.key) {
      case 'customer': {
        return this.SettledBillModel.getSettledBillByMobile(filter).catch(
          (error) => {
            throw error;
          },
        );
      }
      case 'amount': {
        return this.SettledBillModel.getSettledBillByAmount(filter).catch(
          (error) => {
            throw error;
          },
        );
      }
      case 'steward': {
        return this.SettledBillModel.getSettledBillBySteward(filter).catch(
          (error) => {
            throw error;
          },
        );
      }
      case 'payment': {
        return this.SettledBillModel.getSettledBillByPayment(filter).catch(
          (error) => {
            throw error;
          },
        );
      }

      case 'machine': {
        return this.SettledBillModel.getSettledBillByMachine(filter).catch(
          (error) => {
            throw error;
          },
        );
      }

      case 'session': {
        return this.SettledBillModel.getSettledBillBySession(filter).catch(
          (error) => {
            throw error;
          },
        );
      }
      case 'discount': {
        return this.SettledBillModel.getSettledBillByDiscount(filter).catch(
          (error) => {
            throw error;
          },
        );
      }
      case 'refund': {
        return this.SettledBillModel.getSettledBillByRefund(filter).catch(
          (error) => {
            throw error;
          },
        );
      }
      case 'table': {
        return this.SettledBillModel.getSettledBillByTable(filter).catch(
          (error) => {
            throw error;
          },
        );
      }

      case 'type': {
        return this.SettledBillModel.getSettledBillByBillingMode(filter).catch(
          (error) => {
            throw error;
          },
        );
      }

      default: {
        throw new ErrorResponse(
          ResponseType.ERROR,
          ErrorType.server_cannot_handle_request,
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
