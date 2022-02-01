"use strict";
let BaseController = ACCELERONCORE._controllers.BaseController;
let LicenseService = require('../services/LicenseService');

var _ = require('underscore');

class LicenseController extends BaseController {

    constructor(request) {
        super(request);
        this.LicenseService = new LicenseService(request);
    }

    async addNewLicense() {
        let newLicenseObject = this.request.body;
        if (_.isEmpty(newLicenseObject.machineUID)) {
            throw new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.machine_not_in_license);
        }

        return await this.LicenseService.addNewLicense(newLicenseObject).catch(error => {
            throw error
        }); 
    }

}

module.exports = LicenseController;