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
  }
}
module.exports = CancelledOrderController;
