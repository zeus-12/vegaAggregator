"use strict";
let BaseModel = ACCELERONCORE._models.BaseModel;

var _ = require("underscore");

class BillingModel extends BaseModel {
  constructor(request) {
    super(request);
    this.couch = ACCELERONCORE._connectors.CouchDBAsync;
  }

  async generateBill(newBillFile, kot_id, kot_rev) {
    var data = await this.couch
      .post("/accelerate_bills/", newBillFile)
      .catch((error) => {
        throw error;
      });
    return { data, kot_id, kot_rev, newBillFile };
  }

  // async updateBill(updateBillObject) {
  //   return await this.couch
  //     .post("/accelerate_settings/ACCELERATE_BILL_INDEX/", updateBillObject)
  //     .catch((error) => {
  //       throw error;
  //     });
  // }
}

module.exports = BillingModel;
