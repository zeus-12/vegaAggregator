"use strict";
let jwt = require("jsonwebtoken");
var moment = require("moment");

let BaseService = ACCELERONCORE._services.BaseService;
let LicenceClient = require("../../clients/LicenceClient");

const secretKey = process.env.TOKEN_KEY || "";
const DAY = 60 * 60 * 24;
const TOKEN_EXPIRY_IN_DAYS = DAY * 7;

class AuthService extends BaseService {
  constructor(request) {
    super(request);
    this.request = request;
    this.LicenceClient = new LicenceClient();
  }

  async createToken(userData, licenceKey) {
    let licenceData = await this.LicenceClient.validateLicence(licenceKey);

    const user_detail = {
      client: licenceData.client,
      branch: licenceData.branch,
      issueTime: moment().unix(),
      user: {
        verifiedMobile: userData.code,
        name: userData.name,
        id: userData.id,
        role: userData.role,
        homeBranch: userData.homeBranch,
      },
      machineId: licenceData.machineUID,
    };

    return jwt.sign(user_detail, secretKey, {
      expiresIn: TOKEN_EXPIRY_IN_DAYS
    });
  }
}

module.exports = AuthService;
