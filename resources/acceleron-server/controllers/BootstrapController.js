"use strict";
let BaseController = ACCELERONCORE._controllers.BaseController;
let BootstrapService = require('../services/BootstrapService');

class BootstrapController extends BaseController {
    constructor(request) {
        super(request);
        this.BootstrapService = new BootstrapService(request);
    }

  async initialiseAcceleronPOS() {
        try{
            const {filter} = this.request.params;
            if(!filter){
               throw new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.filter_key_is_empty_or_invalid); 
            }
            const initData = await this.BootstrapService.initialiseAcceleronPOS(filter);
            return initData;
        } catch(error){
            throw error;
        }
    } 
}

module.exports = BootstrapController;
