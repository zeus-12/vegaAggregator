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
    console.log("inside controller");
    var username = this.request.body.username;
    var usercode = this.request.body.usercode;
    const ROLES = ["ADMIN", "REGULAR"];
    if (ROLES.includes(this.request.body.role)) {
      var role = this.request.body.role;
    } else {
      //throw error saying invalid role
    }

    const login_details = { username, usercode, role };
    return await this.LoginService.addNewLicense(login_details).catch(
      (error) => {
        throw error;
      }
    );
  }
}

module.exports = LoginController;
