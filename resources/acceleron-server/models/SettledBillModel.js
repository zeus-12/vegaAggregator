'use strict';
let BaseModel = ACCELERONCORE._models.BaseModel;

function format(filter, filterMethod) {
  return (
    '/accelerate_invoices/_design/invoice-filters/_view/filterby' +
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

class SettledBillModel extends BaseModel {
  constructor(request) {
    super(request);
    this.couch = ACCELERONCORE._connectors.CouchDBAsync;
  }

  async getSettledBillByMobile(filter) {
    const formatLink = format(filter, 'mobile');
    return await this.couch.get(formatLink);
  }
  async getSettledBillByAmount(filter) {
    const formatLink = format(filter, 'amount');
    return await this.couch.get(formatLink);
  }
  async getSettledBillBySteward(filter) {
    const formatLink = format(filter, 'stewardname');
    return await this.couch.get(formatLink);
  }
  async getSettledBillByMachine(filter) {
    const formatLink = format(filter, 'machine');
    return await this.couch.get(formatLink);
  }

  async getSettledBillBySession(filter) {
    const formatLink = format(filter, 'session');
    return await this.couch.get(formatLink);
  }
  async getSettledBillByDiscount(filter) {
    const formatLink = format(filter, 'discount');
    return await this.couch.get(formatLink);
  }
  async getSettledBillByRefund(filter) {
    const formatLink = format(filter, 'refund');
    return await this.couch.get(formatLink);
  }
  async getSettledBillByTable(filter) {
    const formatLink = format(filter, 'table');
    return await this.couch.get(formatLink);
  }
  async getSettledBillByBillingMode(filter) {
    const formatLink = format(filter, 'billingmode');
    return await this.couch.get(formatLink);
  }
  async getSettledBillByPayment(filter) {
    const formatLink = format(filter, 'paymentmode');
    return await this.couch.get(formatLink);
  }

  async getSettledBillByDefault(filter) {
    return await this.couch.get(
      '/accelerate_invoices/_design/invoices/_view/all?descending=false&include_docs=true&limit=' +
        filter.limit +
        '&skip=' +
        filter.skip,
    );
  }

  async getSettledBillByAll(filter) {
    return await this.couch.get(
      '/accelerate_invoices/_design/invoice-filters/_view/showall?startkey=["' +
        filter.startdate +
        '"]&endkey=["' +
        filter.enddate +
        '"]&descending=false&include_docs=true&limit=' +
        filter.limit +
        '&skip=' +
        filter.skip,
    );
  }

  async getSettledBillByBillNumber(filter) {
    var filterbody = 'ADYAR_INVOICE_' + filter.searchkey;
    return await this.couch.get('/accelerate_invoices/' + filterbody);
  }
}
module.exports = SettledBillModel;
