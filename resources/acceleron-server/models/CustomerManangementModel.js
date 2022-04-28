"use strict";
let BaseModel = ACCELERONCORE._models.BaseModel;

var _ = require("underscore");

class CustomerManangementModel extends BaseModel {
  constructor(request) {
    super(request);
    this.couch = ACCELERONCORE._connectors.CouchDBAsync;
  }

  async addNewCustomer(newCustomerData) {
    return await this.couch
      .post("/accelerate_users/", newCustomerData)
      .catch((error) => {
        throw error;
      });
  }

  async getCustomerData(mobile) {
    const data = await this.couch
      .get("/accelerate_users/" + mobile)
      .catch((error) => {
        throw error;
      });
    return data;
  }

  async updateCustomerData(mobile, newCustomerData) {
    const data = await this.couch
      .put("/accelerate_users/" + mobile + "/", newCustomerData)
      .catch((error) => {
        throw error;
      });
    return data;
  }
}

module.exports = CustomerManangementModel;
