'use strict';
let BaseModel = ACCELERONCORE._models.BaseModel;

// var _ = require('underscore');
function format(filter, filterMethod) {
  return (
    '/accelerate_cancelled_invoices/_design/invoice-filters/_view/filterby' +
    filterMethod +
    '?startkey=' +
    filter.startkey +
    '&endkey=' +
    filter.endkey +
    '&descending=' +
    filter.descending +
    '&include_docs=' +
    filter.include_docs +
    '&limit=' +
    filter.limit +
    '&skip=' +
    filter.skip
  );
}

class CancelledInvoiceModel extends BaseModel {
  constructor(request) {
    super(request);
    this.couch = ACCELERONCORE._connectors.CouchDBAsync;
  }

  async getCancelledInvoiceByMobile(filter) {
    const formatLink = format(filter, 'mobile');
    return await this.couch.get(
      formatLink,

      // '/accelerate_cancelled_invoices/_design/invoice-filters/_view/filterbymobile?startkey=' +
      //   filter.startkey +
      //   '&endkey=' +
      //   filter.endkey +
      //   '&descending=' +
      //   filter.descending,
      // +'&include_docs=' +
      //   filter.include_docs +
      //   '&limit=' +
      //   filter.limit +
      //   '&skip=' +
      //   filter.skip,
    );
  }
  async getCancelledInvoiceByAmount(filter) {
    const formatLink = format(filter, 'amount');
    return await this.couch.get(
      formatLink,
      // '/accelerate_cancelled_invoices/_design/invoice-filters/_view/filterbyamount?startkey=' +
      //   filter.startkey +
      //   '&endkey=' +
      //   filter.endkey +
      //   '&descending=' +
      //   filter.descending,
      // +'&include_docs=' +
      //   filter.include_docs +
      //   '&limit=' +
      //   filter.limit +
      //   '&skip=' +
      //   filter.skip,
    );
  }
  async getCancelledInvoiceBySteward(filter) {
    const formatLink = format(filter, 'stewardname');
    return await this.couch.get(
      formatLink,
      // '/accelerate_cancelled_invoices/_design/invoice-filters/_view/filterbystewardname?startkey=' +
      //   filter.startkey +
      //   '&endkey=' +
      //   filter.endkey +
      //   '&descending=' +
      //   filter.descending,
      // +'&include_docs=' +
      //   filter.include_docs +
      //   '&limit=' +
      //   filter.limit +
      //   '&skip=' +
      //   filter.skip,
    );
  }
  async getCancelledInvoiceByMachine(filter) {
    const formatLink = format(filter, 'machinename');
    return await this.couch.get(
      formatLink,
      // '/accelerate_cancelled_invoices/_design/invoice-filters/_view/filterbymachinename?startkey=' +
      //   filter.startkey +
      //   '&endkey=' +
      //   filter.endkey +
      //   '&descending=' +
      //   filter.descending,
      // +'&include_docs=' +
      //   filter.include_docs +
      //   '&limit=' +
      //   filter.limit +
      //   '&skip=' +
      //   filter.skip,
    );
  }

  async getCancelledInvoiceBySession(filter) {
    const formatLink = format(filter, 'session');
    return await this.couch.get(
      formatLink,
      // '/accelerate_cancelled_invoices/_design/invoice-filters/_view/filterbysession?startkey=' +
      //   filter.startkey +
      //   '&endkey=' +
      //   filter.endkey +
      //   '&descending=' +
      //   filter.descending,
      // +'&include_docs=' +
      //   filter.include_docs +
      //   '&limit=' +
      //   filter.limit +
      //   '&skip=' +
      //   filter.skip,
    );
  }
  async getCancelledOrderByAll(filter) {
    return await this.couch.get(
      '/accelerate_cancelled_invoices/_design/invoice-filters/_view/showall?startkey=' +
        filter.startkey +
        '&endkey=' +
        filter.endkey +
        '&descending=' +
        filter.descending,
      +'&include_docs=' +
        filter.include_docs +
        '&limit=' +
        filter.limit +
        '&skip=' +
        filter.skip,
    );
  }
  async getCancelledInvoiceByTable(filter) {
    const formatLink = format(filter, 'table');
    return await this.couch.get(
      formatLink,
      // '/accelerate_cancelled_invoices/_design/invoice-filters/_view/filterbytable?startkey=' +
      //   filter.startkey +
      //   '&endkey=' +
      //   filter.endkey +
      //   '&descending=' +
      //   filter.descending,
      // +'&include_docs=' +
      //   filter.include_docs +
      //   '&limit=' +
      //   filter.limit +
      //   '&skip=' +
      //   filter.skip,
    );
  }
  async getCancelledInvoiceByBillingMode(filter) {
    const formatLink = format(filter, 'billingmode');
    return await this.couch.get(
      formatLink,
      // '/accelerate_cancelled_invoices/_design/invoice-filters/_view/filterbybillingmode?startkey=' +
      //   filter.startkey +
      //   '&endkey=' +
      //   filter.endkey +
      //   '&descending=' +
      //   filter.descending,
      // +'&include_docs=' +
      //   filter.include_docs +
      //   '&limit=' +
      //   filter.limit +
      //   '&skip=' +
      //   filter.skip,
    );
  }
  async getCancelledInvoiceByPayment(filter) {
    const formatLink = format(filter, 'paymentmode');
    return await this.couch.get(
      formatLink,
      // '/accelerate_cancelled_invoices/_design/invoice-filters/_view/filterbypaymentmode?startkey=' +
      //   filter.startkey +
      //   '&endkey=' +
      //   filter.endkey +
      //   '&descending=' +
      //   filter.descending,
      // +'&include_docs=' +
      //   filter.include_docs +
      //   '&limit=' +
      //   filter.limit +
      //   '&skip=' +
      //   filter.skip,
    );
  }

  async getCancelledInvoiceByDefault(filter) {
    return await this.couch.get(
      '/accelerate_cancelled_invoices/_design/invoices/_view/all?descending=' +
        filter.descending +
        '&include_docs=' +
        filter.include_docs +
        '&limit=' +
        filter.limit +
        '&skip=' +
        filter.skip,
    );
  }
}
module.exports = CancelledInvoiceModel;
