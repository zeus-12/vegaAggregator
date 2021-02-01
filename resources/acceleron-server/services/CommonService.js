"use strict";
let BaseService = ACCELERONCORE._services.BaseService;
let SettingsModel = require('../models/SettingsModel');

var _ = require('underscore');
var async = require('async');

class CommonService extends BaseService {
    constructor(request) {
        super(request);
        this.request = request;
        this.SettingsModel = new SettingsModel(request);
    }

    getSettingsFileById(settings_id, callback) {
      let self = this;
      self.SettingsModel.getSettingsById(settings_id, function(error, result){
        if(error) {
            return callback(error, null)
        }
        else{
            return callback(null, result);
        }
      })
    }

    updateSettingsFileById(settings_id, new_update_data, callback) {
      let self = this;
      self.SettingsModel.updateNewSettingsData(settings_id, new_update_data, function(error, result){
        if(error) {
            return callback(error, null)
        }
        else{
            return callback(null, "Updated successfully");
        }
      })    
    }
}

module.exports = CommonService;