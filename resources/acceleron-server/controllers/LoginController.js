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
    let bodyParams = this.request.body;
    if (!bodyParams.username || !bodyParams.licenceKey) {
      throw new ErrorResponse(
        BaseResponse.ResponseType.BAD_REQUEST,
        ErrorType.incomplete_login_credentials
      );
    }

    let { username, password, licenceKey } = bodyParams;
    let loginDetails = { username, password, licenceKey };
    return await this.LoginService.validateAndGenerateToken(loginDetails).catch(
      (error) => {
        throw error;
      }
    );
  }
}

module.exports = LoginController;
