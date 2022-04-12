'use strict';
let BaseModel = ACCELERONCORE._models.BaseModel;

function frameFilterQuery(filter, filterMethod) {
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
    const filterQueryString = frameFilterQuery(filter, 'mobile');
    return await this.couch.get(filterQueryString);
  }
  async getPendingBillByAmount(filter) {
    const filterQueryString = frameFilterQuery(filter, 'amount');
    return await this.couch.get(filterQueryString);
  }
  async getPendingBillBySteward(filter) {
    const filterQueryString = frameFilterQuery(filter, 'stewardname');
    return await this.couch.get(filterQueryString);
  }
  async getPendingBillByMachine(filter) {
    const filterQueryString = frameFilterQuery(filter, 'machine');
    return await this.couch.get(filterQueryString);
  }

  async getPendingBillBySession(filter) {
    const filterQueryString = frameFilterQuery(filter, 'session');
    return await this.couch.get(filterQueryString);
  }
  async getPendingBillByDiscount(filter) {
    const filterQueryString = frameFilterQuery(filter, 'discount');
    return await this.couch.get(filterQueryString);
  }
  async getPendingBillByRefund(filter) {
    const filterQueryString = frameFilterQuery(filter, 'refund');
    return await this.couch.get(filterQueryString);
  }

  async getPendingBillByTable(filter) {
    const filterQueryString = frameFilterQuery(filter, 'table');
    return await this.couch.get(filterQueryString);
  }
  async getPendingBillByBillingMode(filter) {
    const filterQueryString = frameFilterQuery(filter, 'billingmode');
    return await this.couch.get(filterQueryString);
  }
  async getPendingBillByPayment(filter) {
    const filterQueryString = frameFilterQuery(filter, 'paymentmode');
    return await this.couch.get(filterQueryString);
  }

  async getPendingBillByDefault(filter) {
    return await this.couch.get(
      '/accelerate_bills/_design/bills/_view/all?descending=true&include_docs=true&limit=' +
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

  async applyDiscount({bill_id, file, maximumReached, totalDiscount}) {
    var data = await this.couch.put(
      '/accelerate_bills/ADYAR_BILL_' + bill_id,
      file,
    );
    var result = {data, maximumReached, totalDiscount};
    return result;
  }

  async updateDeliveryAgent({data, bill_id}) {
    return await this.couch.put(
      '/accelerate_bills/ADYAR_BILL_' + bill_id,
      data,
    );
  }

  async addItem({data, bill_id}) {
    return await this.couch.put(
      '/accelerate_bills/ADYAR_BILL_' + bill_id,
      data,
    );
  }
}
module.exports = PendingBillModel;
