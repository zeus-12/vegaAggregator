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

  async validateAndGenerateToken(loginDetails) {
    let { username, password } = loginDetails;
    const data = await this.SettingsService.getSettingsById(
      "ACCELERATE_STAFF_PROFILES"
    ).catch((error) => {
      throw error;
    });
    let staffProfiles = data.value;
    let user = staffProfiles.find((staff) => {
      return (
        (staff.role === "STEWARD" && staff.code === username) ||
        (staff.role === "ADMIN" &&
          staff.code === username &&
          staff.code === password)
      );
    });

    if (!user) {
      throw new ErrorResponse(
        BaseResponse.ResponseType.AUTH_FAILED,
        ErrorType.no_user_found
      );
    }

    const token = await this.AuthService.createToken(user);
    return token;
  }
}

module.exports = LoginService;