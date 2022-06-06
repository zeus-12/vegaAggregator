let BaseController = ACCELERONCORE._controllers.BaseController;
let PendingBillService = require('../services/PendingBillService');
var _ = require('underscore');

class PendingBillController extends BaseController {
  constructor(request) {
    super(request);
    this.PendingBillService = new PendingBillService(request);
  }

  async cancelBill() {
    var filter = {};
    if (this.request.body && this.request.query.bill_id) {
      filter.file = this.request.body;
      filter.bill_id = this.request.query.bill_id;
    }

    return await this.PendingBillService.cancelBill(filter).catch((error) => {
      throw error;
    });
  }
}
module.exports = PendingBillController;
