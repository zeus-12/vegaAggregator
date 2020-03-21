"use strict";
let BaseService = ACCELERONCORE._services.BaseService;
let SettingsModel = require('../models/SettingsModel');

var _ = require('underscore');

class SettingsService extends BaseService {
    constructor(request) {
        super(request);
        this.request = request;
        this.SettingsModel = new SettingsModel(request);
    }

    getSettingsById(settings_id, callback) {
      let self = this;
      self.SettingsModel.getSettingsById(settings_id, function(error, result){
        if(error) {
            return callback(error, null)
        }
        else{
            if(_.isEmpty(result) || _.isEmpty(result.value)){
                return callback(new ErrorResponse(ResponseType.NO_RECORD_FOUND, ErrorType.no_matching_results), null);
            }
            else{
                return callback(null, result.value);
            }
        }
      })
    }
}

module.exports = SettingsService;