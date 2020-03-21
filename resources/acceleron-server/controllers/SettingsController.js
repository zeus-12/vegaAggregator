"use strict";
let BaseController = ACCELERONCORE._controllers.BaseController;
let SettingsService = require('../services/SettingsService');

var _ = require('underscore');

class SettingsController extends BaseController {

    constructor(request) {
        super(request);
        this.SettingsService = new SettingsService(request);
    }

    getSettingsById(callback) {
        let self = this;
        var settings_id = self.request.params.id;

        if (_.isEmpty(settings_id)) {
            return callback(new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.missing_required_parameters));
        }

        let ALLOWED_SETTINGS = [
                'ACCELERATE_BILLING_MODES',
                'ACCELERATE_BILLING_PARAMETERS',
                'ACCELERATE_BILL_INDEX',
                'ACCELERATE_BILL_LAYOUT',
                'ACCELERATE_CANCELLATION_REASONS',
                'ACCELERATE_CONFIGURED_MACHINES',
                'ACCELERATE_CONFIGURED_PRINTERS',
                'ACCELERATE_COOKING_INGREDIENTS',
                'ACCELERATE_DINE_SESSIONS',
                'ACCELERATE_DISCOUNT_TYPES',
                'ACCELERATE_KOT_INDEX',
                'ACCELERATE_KOT_RELAYING',
                'ACCELERATE_MASTER_MENU',
                'ACCELERATE_PAYMENT_MODES',
                'ACCELERATE_REGISTERED_DEVICES',
                'ACCELERATE_SAVED_COMMENTS'
            ]

        if(!ALLOWED_SETTINGS.includes(settings_id)){
          return callback(new ErrorResponse(ResponseType.BAD_REQUEST, "No such settings exists"))
        }

        self.SettingsService.getSettingsById(settings_id, function (error, result) {
            if(error){
                return callback(error, null);
            }
            else{
                return callback(null, result);
            }
        });
    }

    addNewItemToSettings(callback) {
        let self = this;
        var settings_id = self.request.params.id;

        if (_.isEmpty(settings_id)) {
            return callback(new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.missing_required_parameters));
        }

        let new_entry = self.request.body;

        let ALLOWED_SETTINGS = [
                'ACCELERATE_BILLING_MODES',
                'ACCELERATE_BILLING_PARAMETERS',
                'ACCELERATE_BILL_INDEX',
                'ACCELERATE_BILL_LAYOUT',
                'ACCELERATE_CANCELLATION_REASONS',
                'ACCELERATE_CONFIGURED_MACHINES',
                'ACCELERATE_CONFIGURED_PRINTERS',
                'ACCELERATE_COOKING_INGREDIENTS',
                'ACCELERATE_DINE_SESSIONS',
                'ACCELERATE_DISCOUNT_TYPES',
                'ACCELERATE_KOT_INDEX',
                'ACCELERATE_KOT_RELAYING',
                'ACCELERATE_MASTER_MENU',
                'ACCELERATE_PAYMENT_MODES',
                'ACCELERATE_REGISTERED_DEVICES',
                'ACCELERATE_SAVED_COMMENTS'
            ]

        if(!ALLOWED_SETTINGS.includes(settings_id)){
          return callback(new ErrorResponse(ResponseType.BAD_REQUEST, "No such settings exists"))
        }

        //Validate new_entry
        switch(settings_id){
            case 'ACCELERATE_COOKING_INGREDIENTS':{
                if(_.isEmpty(new_entry.new_ingredient_name)){
                    return callback(new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.invalid_data_format))
                }
            }
        }


        self.SettingsService.addNewItemToSettings(settings_id, new_entry, function (error, result) {
            if(error){
                return callback(error, null);
            }
            else{
                return callback(null, result);
            }
        });
    }
}

module.exports = SettingsController;