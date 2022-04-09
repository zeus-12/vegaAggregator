'use strict';
let PendingBillModel = require('../models/PendingBillModel');
let BaseService = ACCELERONCORE._services.BaseService;
class PendingBillService extends BaseService {
  constructor(request) {
    super(request);
    this.request = request;
    this.PendingBillModel = new PendingBillModel(request);
  }

  async search(filter) {
    switch (filter.key) {
      case 'customer': {
        return this.PendingBillModel.getPendingBillByMobile(filter).catch(
          (error) => {
            throw error;
          },
        );
      }
      case 'amount': {
        return this.PendingBillModel.getPendingBillByAmount(filter).catch(
          (error) => {
            throw error;
          },
        );
      }
      case 'steward': {
        return this.PendingBillModel.getPendingBillBySteward(filter).catch(
          (error) => {
            throw error;
          },
        );
      }
      case 'machine': {
        return this.PendingBillModel.getPendingBillByMachine(filter).catch(
          (error) => {
            throw error;
          },
        );
      }

      case 'session': {
        return this.PendingBillModel.getPendingBillBySession(filter).catch(
          (error) => {
            throw error;
          },
        );
      }
      case 'discount': {
        return this.PendingBillModel.getPendingBillByDiscount(filter).catch(
          (error) => {
            throw error;
          },
        );
      }
      case 'refund': {
        return this.PendingBillModel.getPendingBillByDiscount(filter).catch(
          (error) => {
            throw error;
          },
        );
      }
      case 'table': {
        return this.PendingBillModel.getPendingBillByTable(filter).catch(
          (error) => {
            throw error;
          },
        );
      }

      case 'type': {
        return this.PendingBillModel.getPendingBillByBillingMode(filter).catch(
          (error) => {
            throw error;
          },
        );
      }

      case 'payment': {
        return this.PendingBillModel.getPendingBillByPayment(filter).catch(
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
    return this.PendingBillModel.getPendingBillByBillNumber(filter).catch(
      (error) => {
        throw error;
      },
    );
  }

  async searchDefault(filter) {
    return this.PendingBillModel.getPendingBillByDefault(filter).catch(
      (error) => {
        throw error;
      },
    );
  }

  async searchAll(filter) {
    return this.PendingBillModel.getPendingBillByAll(filter).catch((error) => {
      throw error;
    });
  }

  async updateBill(filter) {
    return this.PendingBillModel.updateBill(filter).catch((error) => {
      throw error;
    });
  }
}

module.exports = PendingBillService;
