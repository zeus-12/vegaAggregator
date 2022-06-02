"use strict";
let BaseController = ACCELERONCORE._controllers.BaseController;
let LoginService = require("../services/LoginService");
var _ = require("underscore");

class LoginController extends BaseController {
  constructor(request) {
    super(request);
    this.LoginService = new LoginService(request);
  }

  async userLogin() {
    var bodyParams = this.request.body;
    if (bodyParams.username && bodyParams.password) {
      var { username, password } = bodyParams;
      var loginDetails = { username, password };
    } else if (bodyParams.username && !bodyParams.password) {
      var { username } = bodyParams;
      var loginDetails = { username };
    } else {
      throw new ErrorResponse(
        BaseResponse.ResponseType.BAD_REQUEST,
        ErrorType.incomplete_login_credentials
      );
    }

    return await this.LoginService.addNewLicense(loginDetails).catch(
      (error) => {
        throw error;
      }
    );
  }
}

module.exports = LoginController;
