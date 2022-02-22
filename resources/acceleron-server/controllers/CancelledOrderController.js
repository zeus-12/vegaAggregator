'use strict';
let BaseController = ACCELERONCORE._controllers.BaseController;
let CancelledOrderService = require('../services/CancelledOrderService');
// const {TouchBarSlider} = require('electron');
var _ = require('underscore');

class CancelledOrderController extends BaseController {
  constructor(request) {
    super(request);
    this.CancelledOrderService = new CancelledOrderService(request);
  }

  async search() {
    console.log('inside /search controller');
    var filter = {};
    var queryParams = this.request.query;

    if (queryParams.key) filter.key = queryParams.key;
    else {
      throw new ErrorResponse(
        ResponseType.ERROR,
        // ErrorType.server_cannot_handle_request,
      );
    }

    if (queryParams.startkey && queryParams.endkey) {
      filter.startkey = queryParams.startkey;
      filter.endkey = queryParams.endkey;
    } else {
      throw new ErrorResponse(
        ResponseType.ERROR,
        ErrorType.server_cannot_handle_request,
      );
    }

    filter.descending = queryParams.descending
      ? queryParams.descending
      : 'true';

    filter.include_docs = queryParams.include_docs
      ? queryParams.include_docs
      : 'true';

    if (
      parseInt(queryParams.limit) > 10 ||
      parseInt(queryParams.limit) < 1 ||
      !Number.isInteger(parseInt(queryParams.limit))
    )
      filter.limit = '10';
    else filter.limit = queryParams.limit;

    filter.skip = queryParams.skip ? queryParams.skip : '0';

    return await this.CancelledOrderService.search(filter).catch((error) => {
      throw error;
    });
  }

  //requires body params

  async searchBill() {
    console.log('inside /searchbill controller');
    var filter = {};
    var queryParams = this.request.query;

    filter.descending = queryParams.descending
      ? queryParams.descending
      : 'true';

    filter.include_docs = queryParams.include_docs
      ? queryParams.include_docs
      : 'true';

    if (
      parseInt(queryParams.limit) > 10 ||
      parseInt(queryParams.limit) < 1 ||
      !Number.isInteger(parseInt(queryParams.limit))
    )
      filter.limit = '10';
    else filter.limit = queryParams.limit;

    filter.skip = queryParams.skip ? queryParams.skip : '0';

    //check the datatype
    if (queryParams.billno) filter.billno = queryParams.billno;
    else {
      throw new ErrorResponse(
        ResponseType.ERROR,
        // ErrorType.server_cannot_handle_request,
      );
    }

    return await this.CancelledOrderService.searchBill(filter).catch(
      (error) => {
        throw error;
      },
    );
  }

  async searchDefault() {
    var filter = {};
    var queryParams = this.request.query;
    filter.descending = queryParams.descending
      ? queryParams.descending
      : 'true';

    filter.include_docs = queryParams.include_docs
      ? queryParams.include_docs
      : 'true';

    if (
      parseInt(queryParams.limit) > 10 ||
      parseInt(queryParams.limit) < 1 ||
      !Number.isInteger(parseInt(queryParams.limit))
    )
      filter.limit = '10';
    else filter.limit = queryParams.limit;

    filter.skip = queryParams.skip ? queryParams.skip : '0';

    return await this.CancelledOrderService.searchDefault(filter).catch(
      (error) => {
        throw error;
      },
    );
  }
}

module.exports = CancelledOrderController;
