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

    async getDataForAggregatorInitialisation() {
      
        const source = this.request.query.source?.toUpperCase()

       
        if (!source) {
            return await this.LicenseService.getDataForAggregatorInitialisation().catch(error => {
                throw error
            }); 
        }
        else {
            const sourcesList = ['ZOMATO', 'SWIGGY']
            if (sourcesList.indexOf(source) == -1) {
                throw new ErrorResponse(
                  ResponseType.BAD_REQUEST,
                  ErrorType.invalid_source
                );
              }
            return await this.LicenseService.fetchMenuMappingsBySource(source).catch(error => {
                throw error
            }); 
        }
    }
}

module.exports = LicenseController;