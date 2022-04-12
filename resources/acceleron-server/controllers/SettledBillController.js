let BaseController = ACCELERONCORE._controllers.BaseController;
let SettledBillService = require('../services/SettledBillService');
var _ = require('underscore');
const {isNumber} = require('underscore');

function populateSkipAndLimit(filter, queryParams) {
  if (
    !queryParams.limit ||
    parseInt(queryParams.limit) > 10 ||
    parseInt(queryParams.limit) < 1
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

    if (queryParams.startdate && queryParams.enddate) {
      filter.startdate = queryParams.startdate;
      filter.enddate = queryParams.enddate;
    } else {
      throw new ErrorResponse(
        ResponseType.ERROR,
        ErrorType.start_and_end_date_empty,
      );
    }

    if (queryParams.searchkey && queryParams.key) {
      filter.key = queryParams.key;
      filter.searchkey = queryParams.searchkey;
    } else {
      throw new ErrorResponse(
        ResponseType.ERROR,
        ErrorType.filter_key_and_filter_method_empty,
      );
    }

    filter = populateSkipAndLimit(filter, queryParams);

    return await this.SettledBillService.search(filter).catch((error) => {
      throw error;
    });
  }

  async searchBill() {
    var filter = {};
    var searchkey = this.request.params['BILL_NUMBER'];

    if (searchkey && isNumber(parseInt(searchkey))) {
      filter.searchkey = searchkey;
    } else {
      throw new ErrorResponse(ResponseType.ERROR, ErrorType.bill_number_empty);
    }

    return await this.SettledBillService.searchBill(filter).catch((error) => {
      throw error;
    });
  }

  async fetchDefault() {
    var filter = {};
    var queryParams = this.request.query;

    filter = populateSkipAndLimit(filter, queryParams);

    return await this.SettledBillService.fetchDefault(filter).catch((error) => {
      throw error;
    });
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
        ErrorType.start_and_end_date_empty,
      );
    }

    filter = populateSkipAndLimit(filter, queryParams);

    return await this.SettledBillService.filterByDateRange(filter).catch(
      (error) => {
        throw error;
      },
    );
  }
}
module.exports = SettledBillController;
