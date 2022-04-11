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
    switch (filter.key.toUpperCase()) {
      case 'CUSTOMER': {
        return this.PendingBillModel.getPendingBillByMobile(filter).catch(
          (error) => {
            throw error;
          },
        );
      }
      case 'AMOUNT': {
        return this.PendingBillModel.getPendingBillByAmount(filter).catch(
          (error) => {
            throw error;
          },
        );
      }
      case 'STEWARD': {
        return this.PendingBillModel.getPendingBillBySteward(filter).catch(
          (error) => {
            throw error;
          },
        );
      }
      case 'MACHINE': {
        return this.PendingBillModel.getPendingBillByMachine(filter).catch(
          (error) => {
            throw error;
          },
        );
      }

      case 'SESSION': {
        return this.PendingBillModel.getPendingBillBySession(filter).catch(
          (error) => {
            throw error;
          },
        );
      }
      case 'DISCOUNT': {
        return this.PendingBillModel.getPendingBillByDiscount(filter).catch(
          (error) => {
            throw error;
          },
        );
      }
      case 'REFUND': {
        return this.PendingBillModel.getPendingBillByDiscount(filter).catch(
          (error) => {
            throw error;
          },
        );
      }
      case 'TABLE': {
        return this.PendingBillModel.getPendingBillByTable(filter).catch(
          (error) => {
            throw error;
          },
        );
      }

      case 'TYPE': {
        return this.PendingBillModel.getPendingBillByBillingMode(filter).catch(
          (error) => {
            throw error;
          },
        );
      }

      case 'PAYMENT': {
        return this.PendingBillModel.getPendingBillByPayment(filter).catch(
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

  async updateBill(filter) {
    return this.PendingBillModel.updateBill(filter).catch((error) => {
      throw error;
    });
  }

  async updateBill(filter) {
    return this.PendingBillModel.updateBill(filter).catch((error) => {
      throw error;
    });
  }

  async updateBill(filter) {
    return this.PendingBillModel.updateBill(filter).catch((error) => {
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
