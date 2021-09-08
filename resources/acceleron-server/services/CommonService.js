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

    async getSettingsFileById(settings_id) {
      return await this.SettingsModel.getSettingsById(settings_id).catch(error => {
        throw error
      }); 
    }

    async updateSettingsFileById(settings_id, new_update_data) {
      return await this.SettingsModel.updateNewSettingsData(settings_id, new_update_data).catch(error => {
        throw error
      });   
    }
}

module.exports = CommonService;