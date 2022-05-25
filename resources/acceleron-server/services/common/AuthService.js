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

  async createToken(USER) {
    var user_detail = {
      client: "ZAITOON",
      branch: "ADYAR",
      issueTime: moment().unix(),
      user: {
        verifiedMobile: "USER.code",
        name: USER.name,
        id: "srwr39trg9ed9g93r583t84e8tg8rgrf",
        role: USER.role,
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
  async validateToken(token) {
    try {
      const userData = jwt.verify(token, secretKey);
      return userData;
    } catch (err) {
      throw new ErrorResponse(
        ResponseType.AUTH_FAILED,
        "Failed to authenticate token"
      );
    }
  }
}

module.exports = AuthService;
