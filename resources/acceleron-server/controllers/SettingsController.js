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
                'ACCELERATE_MENU_CATALOG',
                'ACCELERATE_MENU_CATEGORIES',
                'ACCELERATE_ORDER_SOURCES',
                'ACCELERATE_PAYMENT_MODES',
                'ACCELERATE_REGISTERED_DEVICES',
                'ACCELERATE_SAVED_COMMENTS',
                'ACCELERATE_SAVED_ORDERS',
                'ACCELERATE_STAFF_PROFILES',
                'ACCELERATE_TABLE_SECTIONS',
                'ACCELERATE_TEXT_TO_KITCHEN_LOG',
                'ACCELERATE_TOKEN_INDEX'
            ]

        if(!ALLOWED_SETTINGS.includes(settings_id)){
          return callback(new ErrorResponse(ResponseType.BAD_REQUEST, "Not valid settings name"))
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

    addNewEntryToSettings(callback) {
        let self = this;
        var settings_id = self.request.params.id;

        if (_.isEmpty(settings_id)) {
            return callback(new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.missing_required_parameters));
        }

        let new_entry = self.request.body;

        let ALLOWED_SETTINGS = [
                'ACCELERATE_BILLING_MODES',
                'ACCELERATE_BILLING_PARAMETERS',
                'ACCELERATE_CANCELLATION_REASONS',
                'ACCELERATE_CONFIGURED_MACHINES',
                'ACCELERATE_CONFIGURED_PRINTERS',
                'ACCELERATE_COOKING_INGREDIENTS',
                'ACCELERATE_DINE_SESSIONS',
                'ACCELERATE_DISCOUNT_TYPES',
                'ACCELERATE_MENU_CATALOG',
                'ACCELERATE_MENU_CATEGORIES',
                'ACCELERATE_ORDER_SOURCES',
                'ACCELERATE_PAYMENT_MODES',
                'ACCELERATE_REGISTERED_DEVICES',
                'ACCELERATE_SAVED_COMMENTS',
                'ACCELERATE_SAVED_ORDERS',
                'ACCELERATE_STAFF_PROFILES',
                'ACCELERATE_TABLE_SECTIONS',
                'ACCELERATE_TEXT_TO_KITCHEN_LOG',
                'ACCELERATE_TOKEN_INDEX'
            ]

        if(!ALLOWED_SETTINGS.includes(settings_id)){
          return callback(new ErrorResponse(ResponseType.BAD_REQUEST, "Not valid settings name"))
        }

        //Validate new_entry
        switch(settings_id){
            case 'ACCELERATE_COOKING_INGREDIENTS':{
                if(_.isEmpty(new_entry.new_ingredient_name)){
                    return callback(new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.invalid_data_format))
                }
                break;
            } 
            case 'ACCELERATE_DINE_SESSIONS':{
                if(_.isEmpty(new_entry.name) || _.isEmpty(new_entry.startTime) || _.isEmpty(new_entry.endTime)){
                    return callback(new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.invalid_data_format))
                }
                break;
            }
            case 'ACCELERATE_CANCELLATION_REASONS':{
                if(_.isEmpty(new_entry.new_reason_name)){
                    return callback(new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.invalid_data_format))
                }
                break;
            }
            case 'ACCELERATE_SAVED_COMMENTS':{
                if(_.isEmpty(new_entry.new_comment)){
                    return callback(new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.invalid_data_format))
                }
                break;
            }
        }

        self.SettingsService.addNewEntryToSettings(settings_id, new_entry, function (error, result) {
            if(error){
                return callback(error, null);
            }
            else{
                return callback(null, result);
            }
        });
    }

    removeEntryFromSettings(callback) {
        let self = this;
        var settings_id = self.request.params.id;

        if (_.isEmpty(settings_id)) {
            return callback(new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.missing_required_parameters));
        }

        let entry_to_remove = self.request.body;

        let ALLOWED_SETTINGS = [
                'ACCELERATE_BILLING_MODES',
                'ACCELERATE_BILLING_PARAMETERS',
                'ACCELERATE_CANCELLATION_REASONS',
                'ACCELERATE_CONFIGURED_MACHINES',
                'ACCELERATE_CONFIGURED_PRINTERS',
                'ACCELERATE_COOKING_INGREDIENTS',
                'ACCELERATE_DINE_SESSIONS',
                'ACCELERATE_DISCOUNT_TYPES',
                'ACCELERATE_MENU_CATALOG',
                'ACCELERATE_MENU_CATEGORIES',
                'ACCELERATE_ORDER_SOURCES',
                'ACCELERATE_PAYMENT_MODES',
                'ACCELERATE_REGISTERED_DEVICES',
                'ACCELERATE_SAVED_COMMENTS',
                'ACCELERATE_SAVED_ORDERS',
                'ACCELERATE_STAFF_PROFILES',
                'ACCELERATE_TABLE_SECTIONS',
                'ACCELERATE_TEXT_TO_KITCHEN_LOG',
                'ACCELERATE_TOKEN_INDEX'
            ]

        if(!ALLOWED_SETTINGS.includes(settings_id)){
          return callback(new ErrorResponse(ResponseType.BAD_REQUEST, "Not valid settings name"))
        }

        //Validate new_entry
        switch(settings_id){
            case 'ACCELERATE_COOKING_INGREDIENTS':{
                if(_.isEmpty(entry_to_remove.ingredient_name)){
                    return callback(new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.invalid_data_format))
                }
                break
            }
            case 'ACCELERATE_DINE_SESSIONS':{
                if(_.isEmpty(entry_to_remove.session_name)){
                    console.log(entry_to_remove)
                    return callback(new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.invalid_data_format))
                }
                break;
            }
            case 'ACCELERATE_CANCELLATION_REASONS':{
                if(_.isEmpty(entry_to_remove.reason_name)){
                    return callback(new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.invalid_data_format))
                }
                break;
            }
            case 'ACCELERATE_SAVED_COMMENTS':{
                if(_.isEmpty(entry_to_remove.saved_comment)){
                    return callback(new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.invalid_data_format))
                }
                break;
            }
        }

        self.SettingsService.removeEntryFromSettings(settings_id, entry_to_remove, function (error, result) {
            if(error){
                return callback(error, null);
            }
            else{
                return callback(null, result);
            }
        });
    }


    filterItemFromSettingsList(callback){
        let self = this;
        var settings_id = self.request.params.id;
        var filter_key = self.request.query.uniqueKey;

        if (_.isEmpty(settings_id) || _.isEmpty(filter_key)) {
            return callback(new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.missing_required_parameters));
        }

        /*
            These types of settings has list of entries, and any of the entries can be
            retrieved against a given unique identifier. 
            For ex. Shortcut keys for a given machine
        */

        let ALLOWED_SETTINGS = [
                'ACCELERATE_CONFIGURED_MACHINES',
                'ACCELERATE_CONFIGURED_PRINTERS',
                'ACCELERATE_SHORTCUT_KEYS',
                'ACCELERATE_SYSTEM_OPTIONS',
                'ACCELERATE_PERSONALISATIONS'
            ]

        if(!ALLOWED_SETTINGS.includes(settings_id)){
          return callback(new ErrorResponse(ResponseType.BAD_REQUEST, "Not valid settings name"))
        }

        self.SettingsService.filterItemFromSettingsList(settings_id, filter_key, function (error, result) {
            if(error){
                return callback(error, null);
            }
            else{
                return callback(null, result);
            }
        });
    }

    updateItemFromSettingsList(callback){
        let self = this;
        var settings_id = self.request.params.id;
        var filter_key = self.request.query.uniqueKey;

        if (_.isEmpty(settings_id) || _.isEmpty(filter_key)) {
            return callback(new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.missing_required_parameters));
        }

        let entry_to_update = self.request.body;

        /*
            These types of settings has list of entries, and any of the entries can be
            retrieved against a given unique identifier. 
            For ex. Shortcut keys for a given machine
        */

        let ALLOWED_SETTINGS = [
                'ACCELERATE_CONFIGURED_MACHINES',
                'ACCELERATE_CONFIGURED_PRINTERS',
                'ACCELERATE_SHORTCUT_KEYS',
                'ACCELERATE_SYSTEM_OPTIONS',
                'ACCELERATE_PERSONALISATIONS'
            ]  

        if(!ALLOWED_SETTINGS.includes(settings_id)){
          return callback(new ErrorResponse(ResponseType.BAD_REQUEST, "Not valid settings name"))
        }

        self.SettingsService.updateItemFromSettingsList(settings_id, filter_key, entry_to_update, function (error, result) {
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