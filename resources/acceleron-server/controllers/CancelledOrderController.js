"use strict";
let BaseController = ACCELERONCORE._controllers.BaseController;
let CancelledOrderService = require("../services/CancelledOrderService");
var _ = require("underscore");

function populateSkipAndLimit(filter, queryParams) {
  if (
    !queryParams.limit ||
    parseInt(queryParams.limit) > 10 ||
    parseInt(queryParams.limit) < 1
  ) {
    filter.limit = "10";
  } else {
    filter.limit = queryParams.limit;
  }

  filter.skip = queryParams.skip ? queryParams.skip : "0";
  return filter;
}
class CancelledOrderController extends BaseController {
  constructor(request) {
    super(request);
    this.CancelledOrderService = new CancelledOrderService(request);
  }

  async search() {
    //dates,key,searchkey,limit,skip
    var filter = {};
    var queryParams = this.request.query;

    if (queryParams.startdate && queryParams.enddate) {
      filter.startdate = queryParams.startdate;
      filter.enddate = queryParams.enddate;
    } else {
      throw new ErrorResponse(
        ResponseType.ERROR,
        ErrorType.start_and_end_date_empty
      );
    }

    if (queryParams.searchkey && queryParams.key) {
      filter.key = queryParams.key;
      filter.searchkey = queryParams.searchkey;
    } else {
      throw new ErrorResponse(
        ResponseType.ERROR,
        ErrorType.filter_key_and_filter_method_empty
      );
    }

    filter = populateSkipAndLimit(filter, queryParams);

    return await this.CancelledOrderService.search(filter).catch((error) => {
      throw error;
    });
  }

  async fetchDefault() {
    //limit,skip
    var filter = {};
    var queryParams = this.request.query;

    filter = populateSkipAndLimit(filter, queryParams);

    return await this.CancelledOrderService.fetchDefault(filter).catch(
      (error) => {
        throw error;
      }
    );
  }

  async filterByDateRange() {
    var filter = {};
    var queryParams = this.request.query;

    if (queryParams.startdate && queryParams.enddate) {
      filter.startdate = queryParams.startdate;
      filter.enddate = queryParams.enddate;
    } else {
      throw new ErrorResponse(
        ResponseType.ERROR,
        ErrorType.start_and_end_date_empty
      );
    }

    filter = populateSkipAndLimit(filter, queryParams);

    return await this.CancelledOrderService.filterByDateRange(filter).catch(
      (error) => {
        throw error;
      }
    );
  }
}

module.exports = CancelledOrderController;
