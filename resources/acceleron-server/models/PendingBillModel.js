'use strict';
let BaseModel = ACCELERONCORE._models.BaseModel;

function format(filter, filterMethod) {
  return (
    '/accelerate_bills/_design/bill-filters/_view/filterby' +
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

class PendingBillModel extends BaseModel {
  constructor(request) {
    super(request);
    this.couch = ACCELERONCORE._connectors.CouchDBAsync;
  }

  async getPendingBillByMobile(filter) {
    const formatLink = format(filter, 'mobile');
    return await this.couch.get(formatLink);
  }
  async getPendingBillByAmount(filter) {
    const formatLink = format(filter, 'amount');
    return await this.couch.get(formatLink);
  }
  async getPendingBillBySteward(filter) {
    const formatLink = format(filter, 'stewardname');
    return await this.couch.get(formatLink);
  }
  async getPendingBillByMachine(filter) {
    const formatLink = format(filter, 'machine');
    return await this.couch.get(formatLink);
  }

  async getPendingBillBySession(filter) {
    const formatLink = format(filter, 'session');
    return await this.couch.get(formatLink);
  }
  async getPendingBillByDiscount(filter) {
    const formatLink = format(filter, 'discount');
    return await this.couch.get(formatLink);
  }
  async getPendingBillByRefund(filter) {
    const formatLink = format(filter, 'refund');
    return await this.couch.get(formatLink);
  }

  async getPendingBillByTable(filter) {
    const formatLink = format(filter, 'table');
    return await this.couch.get(formatLink);
  }
  async getPendingBillByBillingMode(filter) {
    const formatLink = format(filter, 'billingmode');
    return await this.couch.get(formatLink);
  }
  async getPendingBillByPayment(filter) {
    const formatLink = format(filter, 'paymentmode');
    return await this.couch.get(formatLink);
  }

  async getPendingBillByDefault(filter) {
    return await this.couch.get(
      '/accelerate_bills/_design/bills/_view/all?descending=false&include_docs=true&limit=' +
        filter.limit +
        '&skip=' +
        filter.skip,
    );
  }

  async getPendingBillByAll(filter) {
    return await this.couch.get(
      '/accelerate_bills/_design/bill-filters/_view/showall?startkey=["' +
        filter.startdate +
        '"]&endkey=["' +
        filter.enddate +
        '"]&descending=false&include_docs=true&limit=' +
        filter.limit +
        '&skip=' +
        filter.skip,
    );
  }

  async getPendingBillByBillNumber(filter) {
    var filterbody = 'ADYAR_BILL_' + filter.searchkey;
    return await this.couch.get('/accelerate_bills/' + filterbody);
  }

  async updateBill(filter) {
    return await this.couch.put(
      '/accelerate_bills/' + filter.bill_id,
      filter.file,
    );
  }
}
module.exports = PendingBillModel;
