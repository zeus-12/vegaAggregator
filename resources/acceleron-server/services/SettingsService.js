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
            if(_.isEmpty(result)){
                return callback(new ErrorResponse(ResponseType.NO_RECORD_FOUND, ErrorType.no_matching_results), null);
            }
            else{
                if(result.value == undefined){
                    return callback(new ErrorResponse(ResponseType.ERROR, ErrorType.server_data_corrupted), null);
                }
                else{
                    return callback(null, result.value); 
                }
            }
        }
      })
    }

    addNewEntryToSettings(settings_id, new_entry, majorCallback) {
        
        let self = this;

        async.waterfall([
          fetchSettings,
          validateInput
        ], function(err, new_update_data) {
            if(err){
                return majorCallback(err, null)
            }
            else {
                  self.SettingsModel.updateNewSettingsData(settings_id, new_update_data, function(error, result){
                    if(error) {
                        return majorCallback(error, null)
                    }
                    else{
                        return majorCallback(null, "Updated succeffully");
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
                    if(_.isEmpty(result)){
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
                        try {
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
                         catch(er) {
                            return callback(new ErrorResponse(ResponseType.ERROR, ErrorType.server_data_corrupted), null);
                         }
                         break;
                    }
                    case 'ACCELERATE_DINE_SESSIONS':{
                        try {
                             var valueList = settingsData.value;
                             
                             for (var i=0; i<valueList.length; i++) {
                               if (valueList[i].name == new_entry.name){
                                  return callback(new ErrorResponse(ResponseType.CONFLICT, "Session Name already exists"), null)
                               }
                             }

                             let newEntryFormatted = {
                              'name' : new_entry.name,
                              'startTime' : new_entry.startTime,
                              'endTime' : new_entry.endTime
                             }

                             valueList.push(newEntryFormatted);
                             settingsData.value = valueList;
                             return callback(null, settingsData);
                         }
                         catch(er) {
                            return callback(new ErrorResponse(ResponseType.ERROR, ErrorType.server_data_corrupted), null);
                         }
                         break;
                    }
                    case 'ACCELERATE_CANCELLATION_REASONS':{
                        try {
                             var valueList = settingsData.value;
                             
                             for (var i=0; i<valueList.length; i++) {
                               if (valueList[i] == new_entry.new_reason_name){
                                  return callback(new ErrorResponse(ResponseType.CONFLICT, "Reason already exists"), null)
                               }
                             }

                             valueList.push(new_entry.new_reason_name);
                             settingsData.value = valueList;
                             return callback(null, settingsData);
                         }
                         catch(er) {
                            return callback(new ErrorResponse(ResponseType.ERROR, ErrorType.server_data_corrupted), null);
                         }
                         break;
                    }
                    case 'ACCELERATE_SAVED_COMMENTS':{
                        try {
                             var valueList = settingsData.value;
                             
                             for (var i=0; i<valueList.length; i++) {
                               if (valueList[i] == new_entry.new_comment){
                                  return callback(new ErrorResponse(ResponseType.CONFLICT, "Comment already exists"), null)
                               }
                             }

                             valueList.push(new_entry.new_comment);
                             settingsData.value = valueList;
                             return callback(null, settingsData);
                         }
                         catch(er) {
                            return callback(new ErrorResponse(ResponseType.ERROR, ErrorType.server_data_corrupted), null);
                         }
                         break;
                    }
                    default:{
                      return callback(new ErrorResponse(ResponseType.ERROR, ErrorType.server_cannot_handle_request), null);
                    }
              }
        }
    }


    removeEntryFromSettings(settings_id, entry_to_remove, majorCallback) {
        
        let self = this;

        async.waterfall([
          fetchSettings,
          validateInput
        ], function(err, new_update_data) {
            if(err){
                return majorCallback(err, null)
            }
            else {
                  self.SettingsModel.updateNewSettingsData(settings_id, new_update_data, function(error, result){
                    if(error) {
                        return majorCallback(error, null)
                    }
                    else{
                        return majorCallback(null, "Updated succeffully");
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
                    if(_.isEmpty(result)){
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
                        try{
                             var valueList = settingsData.value;
                             var isFound = false;
                             for (var i=0; i<valueList.length; i++) {
                               if (valueList[i] == entry_to_remove.ingredient_name){
                                    valueList.splice(i,1);
                                    isFound = true;
                                    break;
                               }
                             }

                             if(!isFound){
                                return callback(new ErrorResponse(ResponseType.NO_RECORD_FOUND, ErrorType.no_data_found), null)
                             }

                             settingsData.value = valueList;
                             return callback(null, settingsData);
                        }
                        catch(er) {
                            return callback(new ErrorResponse(ResponseType.ERROR, ErrorType.server_data_corrupted), null);
                        }
                        break;
                    }
                    case 'ACCELERATE_DINE_SESSIONS':{
                        try{
                             var valueList = settingsData.value;
                             var isFound = false;
                             for (var i=0; i<valueList.length; i++) {
                               if (valueList[i].name == entry_to_remove.session_name){
                                    valueList.splice(i,1);
                                    isFound = true;
                                    break;
                               }
                             }

                             if(!isFound){
                                return callback(new ErrorResponse(ResponseType.NO_RECORD_FOUND, ErrorType.no_data_found), null)
                             }

                             settingsData.value = valueList;
                             return callback(null, settingsData);
                        }
                        catch(er) {
                            return callback(new ErrorResponse(ResponseType.ERROR, ErrorType.server_data_corrupted), null);
                        }
                        break;
                    }
                    case 'ACCELERATE_CANCELLATION_REASONS':{
                        try{
                             var valueList = settingsData.value;
                             var isFound = false;
                             for (var i=0; i<valueList.length; i++) {
                               if (valueList[i] == entry_to_remove.reason_name){
                                    valueList.splice(i,1);
                                    isFound = true;
                                    break;
                               }
                             }

                             if(!isFound){
                                return callback(new ErrorResponse(ResponseType.NO_RECORD_FOUND, ErrorType.no_data_found), null)
                             }

                             settingsData.value = valueList;
                             return callback(null, settingsData);
                        }
                        catch(er) {
                            return callback(new ErrorResponse(ResponseType.ERROR, ErrorType.server_data_corrupted), null);
                        }
                        break;
                    }
                    case 'ACCELERATE_SAVED_COMMENTS':{
                        try{
                             var valueList = settingsData.value;
                             var isFound = false;
                             for (var i=0; i<valueList.length; i++) {
                               if (valueList[i] == entry_to_remove.saved_comment){
                                    valueList.splice(i,1);
                                    isFound = true;
                                    break;
                               }
                             }

                             if(!isFound){
                                return callback(new ErrorResponse(ResponseType.NO_RECORD_FOUND, ErrorType.no_data_found), null)
                             }

                             settingsData.value = valueList;
                             return callback(null, settingsData);
                        }
                        catch(er) {
                            return callback(new ErrorResponse(ResponseType.ERROR, ErrorType.server_data_corrupted), null);
                        }
                        break;
                    }
                    default:{
                      return callback(new ErrorResponse(ResponseType.ERROR, ErrorType.server_cannot_handle_request), null);
                    }
              }
        }
    }

    filterItemFromSettingsList(settings_id, filter_key, callback) {
      let self = this;
      self.SettingsModel.getSettingsById(settings_id, function(error, result){
        if(error) {
            return callback(error, null)
        }
        else{
            if(_.isEmpty(result)){
                return callback(new ErrorResponse(ResponseType.NO_RECORD_FOUND, ErrorType.no_matching_results), null);
            }
            else{
                if(result.value == undefined){
                    return callback(new ErrorResponse(ResponseType.ERROR, ErrorType.server_data_corrupted), null);
                }
                else{

                    let settingsData = result.value;
                    switch(settings_id){
                      case 'ACCELERATE_SYSTEM_OPTIONS':{
                        try{
                          for(var i = 0; i < settingsData.length; i++){
                            if(settingsData[i].systemName == filter_key){
                              return callback(null, settingsData[i].data);
                              break;
                            }
                          }
                        }
                        catch(er) {
                            return callback(new ErrorResponse(ResponseType.ERROR, ErrorType.server_data_corrupted), null);
                        }
                        break;
                      }
                      default:{
                        return callback(new ErrorResponse(ResponseType.ERROR, ErrorType.server_cannot_handle_request), null);
                      }
                    }

                }
            }
        }
      })

    }

    updateItemFromSettingsList(settings_id, filter_key, entry_to_update, majorCallback) {
      
        let self = this;

        async.waterfall([
          fetchSettings,
          makeChanges
        ], function(err, new_update_data) {
            if(err){
                return majorCallback(err, null)
            }
            else {
                  self.SettingsModel.updateNewSettingsData(settings_id, new_update_data, function(error, result){
                    if(error) {
                        return majorCallback(error, null)
                    }
                    else{
                        return majorCallback(null, "Updated succeffully");
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
                    if(_.isEmpty(result)){
                        return callback(new ErrorResponse(ResponseType.NO_RECORD_FOUND, ErrorType.no_matching_results), null);
                    }
                    else{
                        return callback(null, result);
                    }
                }
              })
        }

        function makeChanges(settingsData, callback){
              switch(settings_id){
                    case 'ACCELERATE_SYSTEM_OPTIONS':{
                        try {
                            var valueList = settingsData.value;
                            var isFound = false;
                            var isUpdateFieldFound = false;
                            for(var i = 0; i < valueList.length; i++){
                              if(valueList[i].systemName == filter_key){
                                
                                for(var n = 0; n < valueList[i].data.length; n++){
                                  if(valueList[i].data[n].name == entry_to_update.updateField){
                                    valueList[i].data[n].value = entry_to_update.newValue;
                                    isUpdateFieldFound = true;
                                    break;
                                  }
                                }

                                isFound = true;
                                break;
                              }
                            }     

                            if(!isFound || !isUpdateFieldFound){
                              return callback(new ErrorResponse(ResponseType.NO_RECORD_FOUND, ErrorType.no_data_found), null)
                            }                        

                            settingsData.value = valueList;
                            return callback(null, settingsData);
                         }
                         catch(er) {
                            return callback(new ErrorResponse(ResponseType.ERROR, ErrorType.server_data_corrupted), null);
                         }
                         break;
                    }
                    default:{
                      return callback(new ErrorResponse(ResponseType.ERROR, ErrorType.server_cannot_handle_request), null);
                    }
              }
        }

    }


}

module.exports = SettingsService;