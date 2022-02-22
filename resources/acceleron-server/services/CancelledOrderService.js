'use strict';
let CancelledOrderModel = require('../models/CancelledOrderModel');
let BaseService = ACCELERONCORE._services.BaseService;

var _ = require('underscore');
var async = require('async');

class CancelledOrderService extends BaseService {
  constructor(request) {
    super(request);
    this.request = request;
    this.CancelledOrderModel = new CancelledOrderModel(request);
  }

  async search(filter) {
    switch (filter.key) {
      case 'customer': {
        return this.CancelledOrderModel.getCancelledOrderByMobile(filter).catch(
          (error) => {
            throw error;
          },
        );
      }
      case 'amount': {
        return this.CancelledOrderModel.getCancelledOrderByAmount(filter).catch(
          (error) => {
            throw error;
          },
        );
      }
      case 'steward': {
        return this.CancelledOrderModel.getCancelledOrderBySteward(
          filter,
        ).catch((error) => {
          throw error;
        });
      }
      case 'machine': {
        return this.CancelledOrderModel.getCancelledOrderByMachine(
          filter,
        ).catch((error) => {
          throw error;
        });
      }
      case 'all': {
        return this.CancelledOrderModel.getCancelledOrderByAll(filter).catch(
          (error) => {
            throw error;
          },
        );
      }

      case 'session': {
        return this.CancelledOrderModel.getCancelledOrderBySession(
          filter,
        ).catch((error) => {
          throw error;
        });
      }
      case 'table': {
        return this.CancelledOrderModel.getCancelledOrderByTable(filter).catch(
          (error) => {
            throw error;
          },
        );
      }
      // case 'bill': {
      //   return this.CancelledOrderModel.getCancelledOrderByBillNumber(
      //     filter,
      //   ).catch((error) => {
      //     throw error;
      //   });
      // }

      case 'type': {
        return this.CancelledOrderModel.getCancelledOrderByBillingMode(
          filter,
        ).catch((error) => {
          throw error;
        });
      }

      case 'payment': {
        return this.CancelledOrderModel.getCancelledOrderByPayment(
          filter,
        ).catch((error) => {
          throw error;
        });
      }

      default: {
        throw new ErrorResponse(
          ResponseType.ERROR,
          ErrorType.server_cannot_handle_request,
        );
      }
    }
  }

  //cancelled-order/searchbill
  async searchBill(filter) {
    console.log(filter);
    return this.CancelledOrderModel.getCancelledOrderByBillNumber(filter).catch(
      (error) => {
        throw error;
      },
    );
  }

  async searchDefault(filter) {
    return this.CancelledOrderModel.getCancelledOrderByDefault(filter).catch(
      (error) => {
        throw error;
      },
    );
  }
}

module.exports = CancelledOrderService;
