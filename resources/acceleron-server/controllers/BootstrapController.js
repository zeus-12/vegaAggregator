"use strict";
let BaseController = ACCELERONCORE._controllers.BaseController;
let BootstrapService = require('../services/BootstrapService');

class BootstrapController extends BaseController {
    constructor(request) {
        super(request);
        this.BootstrapService = new BootstrapService(request);
    }

    async getDataForAggregatorInitialisation() {
        return await this.BootstrapService.getDataForAggregatorInitialisation().catch(error => {
            throw error
        }); 

    }  

  async initialiseAcceleronPOS() {
        var licenseKey = this.request.query.key;
        if(!licenseKey){
           throw new ErrorResponse(
               ResponseType.BAD_REQUEST,
               ErrorType.system_name_is_empty_or_invalid
           );
        }

        return await this.BootstrapService.initialiseAcceleronPOS(licenseKey).catch(error => {
            throw error
        });
    } 
}

module.exports = BootstrapController;
