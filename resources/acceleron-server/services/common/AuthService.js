"use strict";
let jwt = require("jsonwebtoken");
let BaseService = ACCELERONCORE._services.BaseService;

var _ = require("underscore");
var async = require("async");

class AuthService extends BaseService {
  constructor(request) {
    super(request);
    this.request = request;
  }

  async createToken(USER) {
    var user_detail = {
      client: "ZAITOON",
      branch: "ADYAR",
      issueTime: 1653113773000,
      user: {
        verifiedMobile: "USER.code",
        name: USER.name,
        id: "srwr39trg9ed9g93r583t84e8tg8rgrf",
        role: USER.role,
        homeBranch: "VELACHERY",
      },
      machineId: "Z500",
    };

    //todo: to be read from .env
    const token = jwt.sign(user_detail, "secretkey");
    return token;
  }
}

module.exports = AuthService;
