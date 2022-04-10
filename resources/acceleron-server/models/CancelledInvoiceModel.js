'use strict';
let BaseModel = ACCELERONCORE._models.BaseModel;

function frameFilterQuery(filter, filterMethod) {
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
    const filterQueryString = frameFilterQuery(filter, 'mobile');
    return await this.couch.get(filterQueryString);
  }
  async getCancelledInvoiceByAmount(filter) {
    const filterQueryString = frameFilterQuery(filter, 'amount');
    return await this.couch.get(filterQueryString);
  }
  async getCancelledInvoiceBySteward(filter) {
    const filterQueryString = frameFilterQuery(filter, 'stewardname');
    return await this.couch.get(filterQueryString);
  }
  async getCancelledInvoiceByMachine(filter) {
    const filterQueryString = frameFilterQuery(filter, 'machine');
    return await this.couch.get(filterQueryString);
  }

  async getCancelledInvoiceBySession(filter) {
    const filterQueryString = frameFilterQuery(filter, 'session');
    return await this.couch.get(filterQueryString);
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
    const filterQueryString = frameFilterQuery(filter, 'table');
    return await this.couch.get(filterQueryString);
  }
  async getCancelledInvoiceByBillingMode(filter) {
    const filterQueryString = frameFilterQuery(filter, 'billingmode');
    return await this.couch.get(filterQueryString);
  }
  async getCancelledInvoiceByPayment(filter) {
    const filterQueryString = frameFilterQuery(filter, 'paymentmode');
    return await this.couch.get(filterQueryString);
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
