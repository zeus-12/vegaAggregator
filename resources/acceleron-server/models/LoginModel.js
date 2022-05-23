"use strict";
let BaseModel = ACCELERONCORE._models.BaseModel;

var _ = require("underscore");

class LoginModel extends BaseModel {
  constructor(request) {
    super(request);
    this.couch = ACCELERONCORE._connectors.CouchDBAsync;
  }

  async authentication(data) {
    var { username, usercode, role } = data;
    return await this.couch.get(url).catch((error) => {
      throw error;
    });
  }
}

module.exports = LoginModel;
