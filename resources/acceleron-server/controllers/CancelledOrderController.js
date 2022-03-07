'use strict';
let BaseController = ACCELERONCORE._controllers.BaseController;
let CancelledOrderService = require('../services/CancelledOrderService');
var _ = require('underscore');

function skipAndLimit(filter, queryParams) {
  if (
    parseInt(queryParams.limit) > 10 ||
    parseInt(queryParams.limit) < 1 ||
    !Number.isInteger(parseInt(queryParams.limit))
  )
    filter.limit = '10';
  else filter.limit = queryParams.limit;

  filter.skip = queryParams.skip ? queryParams.skip : '0';

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

    if (queryParams.startdate && queryParams.enddate && queryParams.key) {
      filter.key = queryParams.key;
      filter.startdate = queryParams.startdate;
      filter.enddate = queryParams.enddate;
      filter.searchkey = queryParams.searchkey;
    } else {
      throw new ErrorResponse(
        ResponseType.ERROR,
        ErrorType.server_cannot_handle_request,
      );
    }
    filter = skipAndLimit(filter, queryParams);

    return await this.CancelledOrderService.search(filter).catch((error) => {
      throw error;
    });
  }

  async searchDefault() {
    //limit,skip
    var filter = {};
    var queryParams = this.request.query;

    filter = skipAndLimit(filter, queryParams);

    return await this.CancelledOrderService.searchDefault(filter).catch(
      (error) => {
        throw error;
      },
    );
  }

  async searchAll() {
    var filter = {};
    var queryParams = this.request.query;

    if (queryParams.startdate && queryParams.enddate) {
      filter.startdate = queryParams.startdate;
      filter.enddate = queryParams.enddate;
    } else {
      throw new ErrorResponse(
        ResponseType.ERROR,
        ErrorType.server_cannot_handle_request,
      );
    }

    filter = skipAndLimit(filter, queryParams);

    return await this.CancelledOrderService.searchAll(filter).catch((error) => {
      throw error;
    });
  }
}

module.exports = CancelledOrderController;
