"use strict";
let BaseModel = ACCELERONCORE._models.BaseModel;

var _ = require("underscore");

class BillingModel extends BaseModel {
  constructor(request) {
    super(request);
    this.couch = ACCELERONCORE._connectors.CouchDBAsync;
  }

  async postBill(newBillFile) {
    var data = await this.couch
      .post("/accelerate_bills/", newBillFile)
      .catch((error) => {
        throw error;
      });
    return { data };
  }

  async generateInvoice(billData) {
    var invoiceData = await this.couch
      .post("/accelerate_invoices", billData)
      .catch((error) => {
        throw error;
      });
    return invoiceData;
  }


  async getBillById(billId) {
    return await this.couch
      .get("/accelerate_bills/" + billId)
      .catch((error) => {
        throw error;
      });
  }
  async getInvoiceById(invoiceId) {
    return await this.couch
      .get("/accelerate_invoices/" + invoiceId)
      .catch((error) => {
        throw error;
      });
  }

  async deleteBillById(billId, billRev) {
    await this.couch
      .delete("/accelerate_bills/" + billId + "?rev=" + billRev)
      .catch((error) => {
        throw error;
      });

  }

  async deleteInvoiceById(invoiceId, invoiceRev) {
    await this.couch
      .delete("/accelerate_invoices/" + invoiceId + "?rev=" + invoiceRev)
      .catch((error) => {
        throw error;
      });


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
