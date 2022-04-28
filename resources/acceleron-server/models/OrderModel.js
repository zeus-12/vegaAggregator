"use strict";
let BaseModel = ACCELERONCORE._models.BaseModel;

var _ = require("underscore");

class OrderModel extends BaseModel {
  constructor(request) {
    super(request);
    this.couch = ACCELERONCORE._connectors.CouchDBAsync;
  }

  async getTableStatus(table_req) {
    const data = await this.couch
      .get(
        '/accelerate_kot/_design/kot-fetch/_view/fetchbytable?startkey=["' +
          table_req +
          '"]&endkey=["' +
          table_req +
          '"]'
      )
      .catch((error) => {
        throw error;
      });

    return data;
  }
}

module.exports = OrderModel;
