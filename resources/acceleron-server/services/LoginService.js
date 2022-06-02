"use strict";
let BaseService = ACCELERONCORE._services.BaseService;
let SettingsService = require("./SettingsService");
let AuthService = require("./common/AuthService");

var _ = require("underscore");
var async = require("async");

class LoginService extends BaseService {
  constructor(request) {
    super(request);
    this.request = request;
    this.SettingsService = new SettingsService(request);
    this.AuthService = new AuthService(request);
  }

  async addNewLicense(loginDetails) {
    let { username, password } = loginDetails;
    const data = await this.SettingsService.getSettingsById(
      "ACCELERATE_STAFF_PROFILES"
    ).catch((error) => {
      throw error;
    });
    let staffProfiles = data.value;
    let user = staffProfiles.find((staff) => {
      return (
        (!password && staff.name === username && staff.role === "REGULAR") ||
        (staff.name === username &&
          staff.code === password &&
          staff.role === "ADMIN")
      );
    });

    if (!user) {
      throw new ErrorResponse(
        BaseResponse.ResponseType.AUTH_FAILED,
        ErrorType.no_user_found
      );
    }

    const token = await this.AuthService.createToken(user);
    // console.log(token);
  }
}

module.exports = LoginService;
