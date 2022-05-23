"use strict";
let BaseService = ACCELERONCORE._services.BaseService;
let LoginModel = require("../models/LoginModel");
let SettingsService = require("./SettingsService");
let AuthService = require("./common/AuthService");

var _ = require("underscore");
var async = require("async");

class LoginService extends BaseService {
  constructor(request) {
    super(request);
    this.request = request;
    this.LoginModel = new LoginModel(request);
    this.SettingsService = new SettingsService(request);
    this.AuthService = new AuthService(request);
  }

  async addNewLicense(login_details) {
    let { username, role, usercode } = login_details;

    const data = await this.SettingsService.getSettingsById(
      "ACCELERATE_STAFF_PROFILES"
    ).catch((error) => {
      throw error;
    });
    let staff_profiles = data.value;
    console.log(staff_profiles);
    let USER = staff_profiles.find((staff) => {
      return (
        (staff.name === username &&
          staff.role === role &&
          staff.code === usercode &&
          role === "ADMIN") ||
        (staff.name === username && staff.role === role && role === "REGULAR")
      );
    });

    if (USER === undefined) {
      throw new ErrorResponse(
        ResponseType.NO_RECORD_FOUND,
        ErrorType.no_matching_results
      );
    }

    const token = await this.AuthService.createToken(USER);
    return token;
  }
}

module.exports = LoginService;
