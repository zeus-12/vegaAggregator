'use strict';
let CancelledInvoiceModel = require('../models/CancelledInvoiceModel');
let BaseService = ACCELERONCORE._services.BaseService;
class CancelledInvoiceService extends BaseService {
  constructor(request) {
    super(request);
    this.request = request;
    this.CancelledInvoiceModel = new CancelledInvoiceModel(request);
  }

  async search(filter) {
    switch (filter.key.toUpperCase()) {
      case 'CUSTOMER': {
        return this.CancelledInvoiceModel.getCancelledInvoiceByMobile(
          filter,
        ).catch((error) => {
          throw error;
        });
      }
      case 'AMOUNT': {
        return this.CancelledInvoiceModel.getCancelledInvoiceByAmount(
          filter,
        ).catch((error) => {
          throw error;
        });
      }
      case 'STEWARD': {
        return this.CancelledInvoiceModel.getCancelledInvoiceBySteward(
          filter,
        ).catch((error) => {
          throw error;
        });
      }
      case 'MACHINE': {
        return this.CancelledInvoiceModel.getCancelledInvoiceByMachine(
          filter,
        ).catch((error) => {
          throw error;
        });
      }

      case 'SESSION': {
        return this.CancelledInvoiceModel.getCancelledInvoiceBySession(
          filter,
        ).catch((error) => {
          throw error;
        });
      }
      case 'TABLE': {
        return this.CancelledInvoiceModel.getCancelledInvoiceByTable(
          filter,
        ).catch((error) => {
          throw error;
        });
      }

      case 'TYPE': {
        return this.CancelledInvoiceModel.getCancelledInvoiceByBillingMode(
          filter,
        ).catch((error) => {
          throw error;
        });
      }

      case 'PAYMENT': {
        return this.CancelledInvoiceModel.getCancelledInvoiceByPayment(
          filter,
        ).catch((error) => {
          throw error;
        });
      }

      default: {
        throw new ErrorResponse(
          ResponseType.ERROR,
          "Filter method doesn't exist",
        );
      }
    }
  }

  //cancelled-Invoice/searchbill
  async searchBill(filter) {
    return this.CancelledInvoiceModel.getCancelledInvoiceByBillNumber(
      filter,
    ).catch((error) => {
      throw error;
    });
  }

  async searchDefault(filter) {
    return this.CancelledInvoiceModel.getCancelledInvoiceByDefault(
      filter,
    ).catch((error) => {
      throw error;
    });
  }

  async searchAll(filter) {
    return this.CancelledInvoiceModel.getCancelledInvoiceByAll(filter).catch(
      (error) => {
        throw error;
      },
    );
  }
}
module.exports = CancelledInvoiceService;
