'use strict';
let BaseModel = ACCELERONCORE._models.BaseModel;

// var _ = require('underscore');

class CancelledOrderModel extends BaseModel {
  constructor(request) {
    super(request);
    this.couch = ACCELERONCORE._connectors.CouchDBAsync;
  }

  async getCancelledOrderByMobile(filter) {
    console.log(filter);
    return await this.couch.get(
      '/accelerate_cancelled_orders/_design/order-filters/_view/filterbymobile?startkey=' +
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
  async getCancelledOrderByAmount(filter) {
    return await this.couch.get(
      '/accelerate_cancelled_orders/_design/order-filters/_view/filterbyamount?startkey=' +
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
  async getCancelledOrderBySteward(filter) {
    return await this.couch.get(
      '/accelerate_cancelled_orders/_design/order-filters/_view/filterbystewardname?startkey=' +
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
  async getCancelledOrderByMachine(filter) {
    return await this.couch.get(
      '/accelerate_cancelled_orders/_design/order-filters/_view/filterbymachinename?startkey=' +
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

  //diff route
  // async getCancelledOrderByBillNumber(filter) {
  //   return await this.couch.get(
  //     '/accelerate_cancelled_orders/_design/order-filters/_view/filterby?startkey=' +
  //       filter.startkey +
  //       '&endkey=' +
  //       filter.endkey +
  //       '&descending=' +
  //       filter.descending,
  //     +'&include_docs=' +
  //       filter.include_docs +
  //       '&limit=' +
  //       filter.limit +
  //       '&skip=' +
  //       filter.skip,
  //   );
  // }

  async getCancelledOrderBySession(filter) {
    return await this.couch.get(
      '/accelerate_cancelled_orders/_design/order-filters/_view/filterbysession?startkey=' +
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
  async getCancelledOrderByTable(filter) {
    return await this.couch.get(
      '/accelerate_cancelled_orders/_design/order-filters/_view/filterbytable?startkey=' +
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
  async getCancelledOrderByBillingMode(filter) {
    return await this.couch.get(
      '/accelerate_cancelled_orders/_design/order-filters/_view/filterbybillingmode?startkey=' +
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
  async getCancelledOrderByPayment(filter) {
    return await this.couch.get(
      '/accelerate_cancelled_orders/_design/order-filters/_view/filterbypaymentmode?startkey=' +
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
  async getCancelledOrderByAll(filter) {
    return await this.couch.get(
      '/accelerate_cancelled_orders/_design/order-filters/_view/showall?startkey=' +
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

  //diff route- requires body params
  async getCancelledOrderByBillNumber(filter) {
    return await this.couch.get('/accelerate_cancelled_orders/_find?');
  }

  async getCancelledOrderByDefault(filter) {
    return await this.couch.get(
      '/accelerate_cancelled_orders/_design/orders/_view/all?descending=' +
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

module.exports = CancelledOrderModel;
