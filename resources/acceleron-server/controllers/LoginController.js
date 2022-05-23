"use strict";
let BaseController = ACCELERONCORE._controllers.BaseController;
let LoginService = require('../services/LoginService');

var _ = require('underscore');

class LoginController extends BaseController {

    constructor(request) {
        super(request);
        this.LoginService = new LoginService(request);
    }

    async userLogin() {
        let newLicenseObject = this.request.body;
        if (_.isEmpty(newLicenseObject.machineUID)) {
            throw new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.machine_not_in_license);
        }

        return await this.LoginService.addNewLicense(newLicenseObject).catch(error => {
            throw error
        }); 
    }

}

module.exports = LicenseController;