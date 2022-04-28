"use strict";
let BaseModel = ACCELERONCORE._models.BaseModel;

var _ = require("underscore");

class KOTModel extends BaseModel {
  constructor(request) {
    super(request);
    this.couch = ACCELERONCORE._connectors.CouchDBAsync;
  }

  async getKOTById(kotId) {
    return await this.couch.get("/accelerate_kot/" + kotId).catch((error) => {
      throw error;
    });
  }
  async createNewKOT(new_KOT_data) {
    return await this.couch
      .post("/accelerate_kot/", new_KOT_data)
      .catch((error) => {
        throw error;
      });
  }
  async updateKOTById(kotId, newKOTData) {
    return await this.couch
      .put("/accelerate_kot/" + kotId, newKOTData)
      .catch((error) => {
        throw new ErrorResponse(
          ResponseType.ERROR,
          ErrorType.something_went_wrong
        );
      });
  }
  async deleteKOTById(kotId, kotRev) {
    const data = await this.couch
      .delete("/accelerate_kot/" + kotId + "?rev=" + kotRev)
      .catch((error) => {
        throw error;
      });

    return data;
  }
}

module.exports = KOTModel;
