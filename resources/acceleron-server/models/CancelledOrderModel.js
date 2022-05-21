"use strict";
let BaseModel = ACCELERONCORE._models.BaseModel;

function frameFilterQuery(filter, filterMethod) {
  return (
    "/accelerate_cancelled_orders/_design/order-filters/_view/filterby" +
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
    "&skip=" +
    filter.skip
  );
}

class CancelledOrderModel extends BaseModel {
  constructor(request) {
    super(request);
    this.couch = ACCELERONCORE._connectors.CouchDBAsync;
  }

  async getCancelledOrderByMobile(filter) {
    const filterQueryString = frameFilterQuery(filter, "mobile");
    return await this.couch.get(filterQueryString);
  }

  async getCancelledOrderBySteward(filter) {
    const filterQueryString = frameFilterQuery(filter, "stewardname");
    return await this.couch.get(filterQueryString);
  }
  async getCancelledOrderByMachine(filter) {
    const filterQueryString = frameFilterQuery(filter, "machine");
    return await this.couch.get(filterQueryString);
  }

  async getCancelledOrderBySession(filter) {
    const filterQueryString = frameFilterQuery(filter, "session");
    return await this.couch.get(filterQueryString);
  }
  async getCancelledOrderByTable(filter) {
    const filterQueryString = frameFilterQuery(filter, "table");
    return await this.couch.get(filterQueryString);
  }
  async getCancelledOrderByBillingMode(filter) {
    const filterQueryString = frameFilterQuery(filter, "billingmode");
    return await this.couch.get(filterQueryString);
  }
  async getCancelledOrderByPayment(filter) {
    const filterQueryString = frameFilterQuery(filter, "paymentmode");
    return await this.couch.get(filterQueryString);
  }
  async getCancelledOrderByAll(filter) {
    return await this.couch.get(
      '/accelerate_cancelled_orders/_design/order-filters/_view/showall?startkey=["' +
        filter.startdate +
        '"]&endkey=["' +
        filter.enddate +
        '"]&descending=false&include_docs=true&limit=' +
        filter.limit +
        "&skip=" +
        filter.skip
    );
  }
  async getCancelledOrderByDefault(filter) {
    return await this.couch.get(
      "/accelerate_cancelled_orders/_design/orders/_view/all?descending=true&include_docs=true&limit=" +
        filter.limit +
        "&skip=" +
        filter.skip
    );
  }
}

module.exports = CancelledOrderModel;
