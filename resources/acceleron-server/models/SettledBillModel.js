'use strict';
let BaseModel = ACCELERONCORE._models.BaseModel;

function frameFilterQuery(filter, filterMethod) {
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
    const filterQueryString = frameFilterQuery(filter, 'mobile');
    return await this.couch.get(filterQueryString);
  }
  async getSettledBillByAmount(filter) {
    const filterQueryString = frameFilterQuery(filter, 'amount');
    return await this.couch.get(filterQueryString);
  }
  async getSettledBillBySteward(filter) {
    const filterQueryString = frameFilterQuery(filter, 'stewardname');
    return await this.couch.get(filterQueryString);
  }
  async getSettledBillByMachine(filter) {
    const filterQueryString = frameFilterQuery(filter, 'machine');
    return await this.couch.get(filterQueryString);
  }

  async getSettledBillBySession(filter) {
    const filterQueryString = frameFilterQuery(filter, 'session');
    return await this.couch.get(filterQueryString);
  }
  async getSettledBillByDiscount(filter) {
    const filterQueryString = frameFilterQuery(filter, 'discount');
    return await this.couch.get(filterQueryString);
  }
  async getSettledBillByRefund(filter) {
    const filterQueryString = frameFilterQuery(filter, 'refund');
    return await this.couch.get(filterQueryString);
  }
  async getSettledBillByTable(filter) {
    const filterQueryString = frameFilterQuery(filter, 'table');
    return await this.couch.get(filterQueryString);
  }
  async getSettledBillByBillingMode(filter) {
    const filterQueryString = frameFilterQuery(filter, 'billingmode');
    return await this.couch.get(filterQueryString);
  }
  async getSettledBillByPayment(filter) {
    const filterQueryString = frameFilterQuery(filter, 'paymentmode');
    return await this.couch.get(filterQueryString);
  }

  async getSettledBillByDefault(filter) {
    return await this.couch.get(
      '/accelerate_invoices/_design/invoices/_view/all?descending=true&include_docs=true&limit=' +
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
