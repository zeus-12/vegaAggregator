let BaseController = ACCELERONCORE._controllers.BaseController;
let PendingBillService = require('../services/PendingBillService');
var _ = require('underscore');

function populateSkipAndLimit(filter, queryParams) {
  if (
    parseInt(queryParams.limit) > 10 ||
    parseInt(queryParams.limit) < 1 ||
    !queryParams.limit
  )
    filter.limit = '10';
  else filter.limit = queryParams.limit;

  filter.skip = queryParams.skip ? queryParams.skip : '0';

  return filter;
}
class PendingBillController extends BaseController {
  constructor(request) {
    super(request);
    this.PendingBillService = new PendingBillService(request);
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
        'Please mention Start and End dates.',
      );
    }
    if (queryParams.searchkey && queryParams.key) {
      filter.key = queryParams.key;
      filter.searchkey = queryParams.searchkey;
    } else {
      throw new ErrorResponse(
        ResponseType.ERROR,
        'Please provide filter method and search key.',
      );
    }

    filter = populateSkipAndLimit(filter, queryParams);

    return await this.PendingBillService.search(filter).catch((error) => {
      throw error;
    });
  }

  async searchBill() {
    var filter = {};
    var searchkey = this.request.params['BILL_NUMBER'];

    if (searchkey) {
      filter.searchkey = searchkey;
    } else {
      throw new ErrorResponse(
        ResponseType.ERROR,
        'Please provide the Bill number to be searched.',
      );
    }
    return await this.PendingBillService.searchBill(filter).catch((error) => {
      throw error;
    });
  }

  async searchDefault() {
    var filter = {};
    var queryParams = this.request.query;

    filter = populateSkipAndLimit(filter, queryParams);

    return await this.PendingBillService.searchDefault(filter).catch(
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

    filter = populateSkipAndLimit(filter, queryParams);

    return await this.PendingBillService.searchAll(filter).catch((error) => {
      throw error;
    });
  }

  async applyDiscount() {
    var filter = {};
    if (this.request.body && this.request.query.bill_id) {
      filter.file = this.request.body;
      filter.bill_id = this.request.query.bill_id;
    }

    return await this.PendingBillService.updateBill(filter).catch((error) => {
      throw error;
    });
  }

  async addItem() {
    var filter = {};
    if (this.request.body && this.request.query.bill_id) {
      filter.file = this.request.body;
      filter.bill_id = this.request.query.bill_id;
    }

    return await this.PendingBillService.updateBill(filter).catch((error) => {
      throw error;
    });
  }

  async updateDeliveryAgent() {
    var filter = {};
    if (this.request.body && this.request.query.bill_id) {
      filter.file = this.request.body;
      filter.bill_id = this.request.query.bill_id;
    }

    return await this.PendingBillService.updateBill(filter).catch((error) => {
      throw error;
    });
  }

  async settleBill() {
    var filter = {};
    if (this.request.body && this.request.query.bill_id) {
      filter.file = this.request.body;
      filter.bill_id = this.request.query.bill_id;
    }

    return await this.PendingBillService.updateBill(filter).catch((error) => {
      throw error;
    });
  }
}
module.exports = PendingBillController;
