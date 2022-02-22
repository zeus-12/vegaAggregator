'use strict';
let BaseModel = ACCELERONCORE._models.BaseModel;

// var _ = require('underscore');
function format(filter, filterMethod) {
  return (
    '/accelerate_cancelled_orders/_design/order-filters/_view/filterby' +
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

class CancelledOrderModel extends BaseModel {
  constructor(request) {
    super(request);
    this.couch = ACCELERONCORE._connectors.CouchDBAsync;
  }

  async getCancelledOrderByMobile(filter) {
    const formatLink = format(filter, 'mobile');
    return await this.couch.get(
      formatLink,

      // '/accelerate_cancelled_orders/_design/order-filters/_view/filterbymobile?startkey=' +
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
  async getCancelledOrderByAmount(filter) {
    const formatLink = format(filter, 'amount');
    return await this.couch.get(
      formatLink,
      // '/accelerate_cancelled_orders/_design/order-filters/_view/filterbyamount?startkey=' +
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
  async getCancelledOrderBySteward(filter) {
    const formatLink = format(filter, 'stewardname');
    return await this.couch.get(
      formatLink,
      // '/accelerate_cancelled_orders/_design/order-filters/_view/filterbystewardname?startkey=' +
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
  async getCancelledOrderByMachine(filter) {
    const formatLink = format(filter, 'machinename');
    return await this.couch.get(
      formatLink,
      // '/accelerate_cancelled_orders/_design/order-filters/_view/filterbymachinename?startkey=' +
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
    const formatLink = format(filter, 'session');
    return await this.couch.get(
      formatLink,
      // '/accelerate_cancelled_orders/_design/order-filters/_view/filterbysession?startkey=' +
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
  async getCancelledOrderByTable(filter) {
    const formatLink = format(filter, 'table');
    return await this.couch.get(
      formatLink,
      // '/accelerate_cancelled_orders/_design/order-filters/_view/filterbytable?startkey=' +
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
  async getCancelledOrderByBillingMode(filter) {
    const formatLink = format(filter, 'billingmode');
    return await this.couch.get(
      formatLink,
      // '/accelerate_cancelled_orders/_design/order-filters/_view/filterbybillingmode?startkey=' +
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
  async getCancelledOrderByPayment(filter) {
    const formatLink = format(filter, 'paymentmode');
    return await this.couch.get(
      formatLink,
      // '/accelerate_cancelled_orders/_design/order-filters/_view/filterbypaymentmode?startkey=' +
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
