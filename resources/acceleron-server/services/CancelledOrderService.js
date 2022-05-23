'use strict';
let CancelledOrderModel = require('../models/CancelledOrderModel');
let BaseService = ACCELERONCORE._services.BaseService;
class CancelledOrderService extends BaseService {
  constructor(request) {
    super(request);
    this.request = request;
    this.CancelledOrderModel = new CancelledOrderModel(request);
  }

  async search(filter) {
    switch (filter.key.toUpperCase()) {
      case 'CUSTOMER': {
        return this.CancelledOrderModel.getCancelledOrderByMobile(filter).catch(
          (error) => {
            throw error;
          },
        );
      }

      case 'STEWARD': {
        return this.CancelledOrderModel.getCancelledOrderBySteward(
          filter,
        ).catch((error) => {
          throw error;
        });
      }
      case 'MACHINE': {
        return this.CancelledOrderModel.getCancelledOrderByMachine(
          filter,
        ).catch((error) => {
          throw error;
        });
      }

      case 'SESSION': {
        return this.CancelledOrderModel.getCancelledOrderBySession(
          filter,
        ).catch((error) => {
          throw error;
        });
      }
      case 'TABLE': {
        return this.CancelledOrderModel.getCancelledOrderByTable(filter).catch(
          (error) => {
            throw error;
          },
        );
      }
      case 'TYPE': {
        return this.CancelledOrderModel.getCancelledOrderByBillingMode(
          filter,
        ).catch((error) => {
          throw error;
        });
      }

      case 'PAYMENT': {
        return this.CancelledOrderModel.getCancelledOrderByPayment(
          filter,
        ).catch((error) => {
          throw error;
        });
      }

      default: {
        throw new ErrorResponse(
          ResponseType.ERROR,
          ErrorType.invalid_filter_method,
        );
      }
    }
  }

  async fetchDefault(filter) {
    return this.CancelledOrderModel.getCancelledOrderByDefault(filter).catch(
      (error) => {
        throw error;
      },
    );
  }

  async filterByDateRange(filter) {
    return this.CancelledOrderModel.getCancelledOrderByAll(filter).catch(
      (error) => {
        throw error;
      },
    );
  }
}

module.exports = CancelledOrderService;
