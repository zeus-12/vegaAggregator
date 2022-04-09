let BaseController = ACCELERONCORE._controllers.BaseController;
let SettledBillService = require('../services/SettledBillService');
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
class SettledBillController extends BaseController {
  constructor(request) {
    super(request);
    this.SettledBillService = new SettledBillService(request);
  }

  async search() {
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

    return await this.SettledBillService.search(filter).catch((error) => {
      throw error;
    });
  }

  async searchBill() {
    var filter = {};
    var queryParams = this.request.query;

    filter = skipAndLimit(filter, queryParams);

    if (queryParams.searchkey) filter.searchkey = queryParams.searchkey;
    else {
      throw new ErrorResponse(ResponseType.ERROR);
    }

    return await this.SettledBillService.searchBill(filter).catch((error) => {
      throw error;
    });
  }

  async searchDefault() {
    var filter = {};
    var queryParams = this.request.query;

    filter = skipAndLimit(filter, queryParams);

    return await this.SettledBillService.searchDefault(filter).catch(
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

    return await this.SettledBillService.searchAll(filter).catch((error) => {
      throw error;
    });
  }
}
module.exports = SettledBillController;
