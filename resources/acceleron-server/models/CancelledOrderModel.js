'use strict';
let BaseModel = ACCELERONCORE._models.BaseModel;

function format(filter, filterMethod) {
  return (
    '/accelerate_cancelled_orders/_design/order-filters/_view/filterby' +
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

class CancelledOrderModel extends BaseModel {
  constructor(request) {
    super(request);
    this.couch = ACCELERONCORE._connectors.CouchDBAsync;
  }

  async getCancelledOrderByMobile(filter) {
    const formatLink = format(filter, 'mobile');
    return await this.couch.get(formatLink);
  }

  async getCancelledOrderBySteward(filter) {
    const formatLink = format(filter, 'stewardname');
    return await this.couch.get(formatLink);
  }
  async getCancelledOrderByMachine(filter) {
    const formatLink = format(filter, 'machine');
    return await this.couch.get(formatLink);
  }

  async getCancelledOrderBySession(filter) {
    const formatLink = format(filter, 'session');
    return await this.couch.get(formatLink);
  }
  async getCancelledOrderByTable(filter) {
    const formatLink = format(filter, 'table');
    return await this.couch.get(formatLink);
  }
  async getCancelledOrderByBillingMode(filter) {
    const formatLink = format(filter, 'billingmode');
    return await this.couch.get(formatLink);
  }
  async getCancelledOrderByPayment(filter) {
    const formatLink = format(filter, 'paymentmode');
    return await this.couch.get(formatLink);
  }
  async getCancelledOrderByAll(filter) {
    return await this.couch.get(
      '/accelerate_cancelled_orders/_design/order-filters/_view/showall?startkey=["' +
        filter.startdate +
        '"]&endkey=["' +
        filter.enddate +
        '"]&descending=false&include_docs=true&limit=' +
        filter.limit +
        '&skip=' +
        filter.skip,
    );
  }
  async getCancelledOrderByDefault(filter) {
    return await this.couch.get(
      '/accelerate_cancelled_orders/_design/orders/_view/all?descending=true&include_docs=true&limit=' +
        filter.limit +
        '&skip=' +
        filter.skip,
    );
  }
}

module.exports = CancelledOrderModel;
