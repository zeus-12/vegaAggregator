"use strict";
let BaseService = ACCELERONCORE._services.BaseService;
let SettingsModel = require('../models/SettingsModel');

var _ = require('underscore');
var async = require('async');

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

    addNewItemToSettings(settings_id, new_entry, callback) {
        
        let self = this;

        async.waterfall([
          fetchSettings,
          validateInput
        ], function(err, new_update_data) {
            if(err){
                return callback(err, null)
            }
            else {
                  self.SettingsModel.updateNewSettingsData(settings_id, new_update_data, function(error, result){
                    if(error) {
                        return callback(error, null)
                    }
                    else{
                        return callback(null, "Updated succeffully");
                    }
                  })                
            }
        });


        function fetchSettings(callback){
              self.SettingsModel.getSettingsById(settings_id, function(error, result){
                if(error) {
                    return callback(error, null)
                }
                else{
                    if(_.isEmpty(result) || _.isEmpty(result.value)){
                        return callback(new ErrorResponse(ResponseType.NO_RECORD_FOUND, ErrorType.no_matching_results), null);
                    }
                    else{
                        return callback(null, result);
                    }
                }
              })
        }

        function validateInput(settingsData, callback){
              switch(settings_id){
                    case 'ACCELERATE_COOKING_INGREDIENTS':{

                         var valueList = settingsData.value;
                         
                         for (var i=0; i<valueList.length; i++) {
                           if (valueList[i] == new_entry.new_ingredient_name){
                              return callback(new ErrorResponse(ResponseType.CONFLICT, "Ingredient already exists"), null)
                           }
                         }

                         valueList.push(new_entry.new_ingredient_name);
                         settingsData.value = valueList;
                         return callback(null, settingsData);
                    }
              }
        }
    }


}

module.exports = SettingsService;