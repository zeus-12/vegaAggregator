"use strict";
let jwt = require("jsonwebtoken");
var moment = require("moment");

let BaseService = ACCELERONCORE._services.BaseService;

var _ = require("underscore");
var async = require("async");
//todo
const secretKey = "secretkey";

class AuthService extends BaseService {
  constructor(request) {
    super(request);
    this.request = request;
  }

  //todo get from acceleron service
  async createToken(user) {
    var user_detail = {
      client: "ZAITOON",
      branch: "ADYAR",
      issueTime: moment().unix(),
      user: {
        verifiedMobile: user.code,
        name: user.name,
        id: "srwr39trg9ed9g93r583t84e8tg8rgrf",
        role: user.role,
        homeBranch: "VELACHERY",
      },
      machineId: "Z500",
    };
    const token = jwt.sign(user_detail, secretKey, {
      //7days
      expiresIn: 60 * 60 * 24 * 7,
    });
    return token;
  }
}

module.exports = AuthService;
