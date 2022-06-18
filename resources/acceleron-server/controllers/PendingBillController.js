let BaseController = ACCELERONCORE._controllers.BaseController;
let PendingBillService = require('../services/PendingBillService');
let BillingUtils = require('../utils/BillingUtils');
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

    return await this.PendingBillService.search(filter).catch((error) => {
      throw error;
    });
  }

  async searchBill() {
    var searchkey = this.request.params.BILL_NUMBER;
    if (!searchkey || !isNumber(parseInt(searchkey))) {
      throw new ErrorResponse(ResponseType.ERROR, ErrorType.bill_number_empty);
    }

    var userBranch = this.request.loggedInUser.branch;
    var billNumber = BillingUtils.frameBillNumber(userBranch, searchkey);

    return await this.PendingBillService.searchBill(billNumber).catch((error) => {
      throw error;
    });
  }

  async fetchDefault() {
    var filter = {};
    var queryParams = this.request.query;

    filter = populateSkipAndLimit(filter, queryParams);

    return await this.PendingBillService.fetchDefault(filter).catch((error) => {
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

    return await this.PendingBillService.filterByDateRange(filter).catch(
      (error) => {
        throw error;
      },
    );
  }

  async applyDiscount() {
    var filter = {};
    var queryParams = this.request.query;
    var userBranch = this.request.loggedInUser.branch;

    filter = populateSkipAndLimit(filter, queryParams);
    var bill_id = this.request.params.BILL_NUMBER;

    if (this.request.body && bill_id) {
      filter.file = this.request.body;
      filter.bill_id = bill_id;
      filter.billNumber = BillingUtils.frameBillNumber(userBranch, bill_id);
    }

    return await this.PendingBillService.applyDiscount(filter).catch(
      (error) => {
        throw error;
      },
    );
  }
  async updateDeliveryAgent() {
    var filter = {};
    var queryParams = this.request.query;
    var userBranch = this.request.loggedInUser.branch;

    filter = populateSkipAndLimit(filter, queryParams);
    var bill_id = this.request.params.BILL_NUMBER;

    if (this.request.body && bill_id) {
      filter.file = this.request.body;
      filter.bill_id = bill_id;
      filter.branchNumber = BillingUtils.frameBillNumber(userBranch, bill_id);
    }
    return await this.PendingBillService.updateDeliveryAgent(filter).catch(
      (error) => {
        throw error;
      },
    );
  }

  async addItem() {
    var filter = {};
    var queryParams = this.request.query;
    var userBranch = this.request.loggedInUser.branch;

    filter = populateSkipAndLimit(filter, queryParams);
    var bill_id = this.request.params.BILL_NUMBER;

    if (this.request.body && bill_id) {
      filter.file = this.request.body;
      filter.bill_id = bill_id;
      filter.billNumber = BillingUtils.frameBillNumber(userBranch, bill_id);
    }

    return await this.PendingBillService.addItem(filter).catch((error) => {
      throw error;
    });
  }
}
module.exports = PendingBillController;
