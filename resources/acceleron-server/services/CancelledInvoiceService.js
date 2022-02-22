'use strict';
let CancelledInvoiceModel = require('../models/CancelledInvoiceModel');
let BaseService = ACCELERONCORE._services.BaseService;

var _ = require('underscore');
var async = require('async');

class CancelledInvoiceService extends BaseService {
  constructor(request) {
    super(request);
    this.request = request;
    this.CancelledInvoiceModel = new CancelledInvoiceModel(request);
  }

  async search(filter) {
    switch (filter.key) {
      case 'customer': {
        return this.CancelledInvoiceModel.getCancelledInvoiceByMobile(
          filter,
        ).catch((error) => {
          throw error;
        });
      }
      case 'amount': {
        return this.CancelledInvoiceModel.getCancelledInvoiceByAmount(
          filter,
        ).catch((error) => {
          throw error;
        });
      }
      case 'steward': {
        return this.CancelledInvoiceModel.getCancelledInvoiceBySteward(
          filter,
        ).catch((error) => {
          throw error;
        });
      }
      case 'machine': {
        return this.CancelledInvoiceModel.getCancelledInvoiceByMachine(
          filter,
        ).catch((error) => {
          throw error;
        });
      }

      case 'session': {
        return this.CancelledInvoiceModel.getCancelledInvoiceBySession(
          filter,
        ).catch((error) => {
          throw error;
        });
      }
      case 'table': {
        return this.CancelledInvoiceModel.getCancelledInvoiceByTable(
          filter,
        ).catch((error) => {
          throw error;
        });
      }
      // case 'bill': {
      //   return this.CancelledInvoiceModel.getCancelledInvoiceByBillNumber(
      //     filter,
      //   ).catch((error) => {
      //     throw error;
      //   });
      // }

      case 'type': {
        return this.CancelledInvoiceModel.getCancelledInvoiceByBillingMode(
          filter,
        ).catch((error) => {
          throw error;
        });
      }
      case 'all': {
        return this.CancelledInvoiceModel.getCancelledInvoiceByAll(
          filter,
        ).catch((error) => {
          throw error;
        });
      }

      case 'payment': {
        return this.CancelledInvoiceModel.getCancelledInvoiceByPayment(
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

  async searchDefault(filter) {
    return this.CancelledInvoiceModel.getCancelledInvoiceByDefault(
      filter,
    ).catch((error) => {
      throw error;
    });
  }
}
module.exports = CancelledInvoiceService;
