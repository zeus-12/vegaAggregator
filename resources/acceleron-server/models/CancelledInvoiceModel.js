'use strict';
let BaseModel = ACCELERONCORE._models.BaseModel;

function format(filter, filterMethod) {
  return (
    '/accelerate_cancelled_invoices/_design/invoice-filters/_view/filterby' +
    filterMethod +
    '?startkey=["' +
    filter.searchkey +
    '", "' +
    filter.startdate +
    '"]&endkey=["' +
    filter.searchkey +
    '", "' +
    filter.enddate +
    '"]&descending=false&include_docs=true&limit=' +
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
    return await this.couch.get(formatLink);
  }
  async getCancelledInvoiceByAmount(filter) {
    const formatLink = format(filter, 'amount');
    return await this.couch.get(formatLink);
  }
  async getCancelledInvoiceBySteward(filter) {
    const formatLink = format(filter, 'stewardname');
    return await this.couch.get(formatLink);
  }
  async getCancelledInvoiceByMachine(filter) {
    const formatLink = format(filter, 'machine');
    return await this.couch.get(formatLink);
  }

  async getCancelledInvoiceBySession(filter) {
    const formatLink = format(filter, 'session');
    return await this.couch.get(formatLink);
  }
  async getCancelledInvoiceByAll(filter) {
    return await this.couch.get(
      '/accelerate_cancelled_invoices/_design/invoice-filters/_view/showall?startkey=' +
        filter.startkey +
        '&endkey=' +
        filter.endkey +
        '&descending=false&include_docs=true&limit=' +
        filter.limit +
        '&skip=' +
        filter.skip,
    );
  }
  async getCancelledInvoiceByTable(filter) {
    const formatLink = format(filter, 'table');
    return await this.couch.get(formatLink);
  }
  async getCancelledInvoiceByBillingMode(filter) {
    const formatLink = format(filter, 'billingmode');
    return await this.couch.get(formatLink);
  }
  async getCancelledInvoiceByPayment(filter) {
    const formatLink = format(filter, 'paymentmode');
    return await this.couch.get(formatLink);
  }

  async getCancelledInvoiceByDefault(filter) {
    return await this.couch.get(
      '/accelerate_cancelled_invoices/_design/invoices/_view/all?descending=true&include_docs=true&limit=' +
        filter.limit +
        '&skip=' +
        filter.skip,
    );
  }

  async getCancelledInvoiceByAll(filter) {
    return await this.couch.get(
      '/accelerate_cancelled_invoices/_design/invoice-filters/_view/showall?startkey=["' +
        filter.startdate +
        '"]&endkey=["' +
        filter.enddate +
        '"]&descending=false&include_docs=true&limit=' +
        filter.limit +
        '&skip=' +
        filter.skip,
    );
  }

  async getCancelledInvoiceByBillNumber(filter) {
    var filterbody = {selector: {billNumber: parseInt(filter.searchkey)}};
    return await this.couch.post(
      '/accelerate_cancelled_invoices/_find',
      filterbody,
    );
  }
}
module.exports = CancelledInvoiceModel;
