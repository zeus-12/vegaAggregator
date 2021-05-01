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

async getSettingsById(settings_id) {
      let self = this;
      const data = await self.SettingsModel.getSettingsById(settings_id).catch(error => {
        throw error;
      });
            if(_.isEmpty(data)){
                throw new ErrorResponse(ResponseType.NO_RECORD_FOUND, ErrorType.no_matching_results);
            }
            else{
                if(data.value == undefined){
                    throw new ErrorResponse(ResponseType.ERROR, ErrorType.server_data_corrupted);
                }
                else{
                    return data.value;
                }
            }
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
                  self.SettingsModel.updateNewSettingsData(settings_id, new_update_data, function(error, data){
                    if(error) {
                        return majorCallback(error, null)
                    }
                    else{
                        return majorCallback(null, "Updated successfully");
                    }
                  })                
            }
        });

        function fetchSettings(callback){
              self.SettingsModel.getSettingsById(settings_id, function(error, data){
                if(error) {
                    return callback(error, null)
                }
                else{
                    if(_.isEmpty(data)){
                        return callback(new ErrorResponse(ResponseType.NO_RECORD_FOUND, ErrorType.no_matching_datas), null);
                    }
                    else{
                        return callback(null, data);
                    }
                }
              })
        }

        function validateInput(settingsData, callback){
              switch(settings_id){
                    case 'ACCELERATE_TABLE_SECTIONS':{
                        try {
                             var valueList = settingsData.value;
                             
                             for (var i=0; i<valueList.length; i++) {
                               if (valueList[i] == new_entry.new_section_name){
                                  return callback(new ErrorResponse(ResponseType.CONFLICT, "Section already exists"), null)
                               }
                             }

                             valueList.push(new_entry.new_section_name);
                             settingsData.value = valueList;
                             return callback(null, settingsData);
                         }
                         catch(er) {
                            return callback(new ErrorResponse(ResponseType.ERROR, ErrorType.server_data_corrupted), null);
                         }
                         break;
                    }
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
                  self.SettingsModel.updateNewSettingsData(settings_id, new_update_data, function(error, data){
                    if(error) {
                        return majorCallback(error, null)
                    }
                    else{
                        return majorCallback(null, "Updated successfully");
                    }
                  })                
            }
        });


        function fetchSettings(callback){
              self.SettingsModel.getSettingsById(settings_id, function(error, data){
                if(error) {
                    return callback(error, null)
                }
                else{
                    if(_.isEmpty(data)){
                        return callback(new ErrorResponse(ResponseType.NO_RECORD_FOUND, ErrorType.no_matching_datas), null);
                    }
                    else{
                        return callback(null, data);
                    }
                }
              })
        }

        function validateInput(settingsData, callback){
              switch(settings_id){
                    case 'ACCELERATE_TABLE_SECTIONS':{
                        try{
                             var valueList = settingsData.value;
                             var isFound = false;
                             for (var i=0; i<valueList.length; i++) {
                               if (valueList[i] == entry_to_remove.section_name){
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
      self.SettingsModel.getSettingsById(settings_id, function(error, data){
        if(error) {
            return callback(error, null)
        }
        else{
            if(_.isEmpty(data)){
                return callback(new ErrorResponse(ResponseType.NO_RECORD_FOUND, ErrorType.no_matching_datas), null);
            }
            else{
                if(data.value == undefined){
                    return callback(new ErrorResponse(ResponseType.ERROR, ErrorType.server_data_corrupted), null);
                }
                else{

                    let settingsData = data.value;
                    switch(settings_id){
                      case 'ACCELERATE_STAFF_PROFILES':{
                        try{
                          var isFound = false;
                          for(var i = 0; i < settingsData.length; i++){
                            if(settingsData[i].code == filter_key){
                              isFound = true;
                              let returnResponse = settingsData[i];
                              delete returnResponse['password'];
                              return callback(null, returnResponse);
                              break;
                            }
                          }

                          if(!isFound){
                            return callback(new ErrorResponse(ResponseType.NO_RECORD_FOUND, ErrorType.no_data_found), null);
                          }
                        }
                        catch(er) {
                            return callback(new ErrorResponse(ResponseType.ERROR, ErrorType.server_data_corrupted), null);
                        }
                        break;
                      }
                      case 'ACCELERATE_SYSTEM_OPTIONS':{
                        try{
                          var isFound = false;
                          for(var i = 0; i < settingsData.length; i++){
                            if(settingsData[i].systemName == filter_key){
                              isFound = true;
                              return callback(null, settingsData[i].data);
                              break;
                            }
                          }

                          if(!isFound){
                            return callback(new ErrorResponse(ResponseType.NO_RECORD_FOUND, ErrorType.no_data_found), null);
                          }
                        }
                        catch(er) {
                            return callback(new ErrorResponse(ResponseType.ERROR, ErrorType.server_data_corrupted), null);
                        }
                        break;
                      }
                      case 'ACCELERATE_CONFIGURED_MACHINES':{
                        try{
                          var isFound = false;
                          for(var i = 0; i < settingsData.length; i++){
                            if(settingsData[i].licence == filter_key){
                              isFound = true;
                              return callback(null, settingsData[i]);
                              break;
                            }
                          }

                          if(!isFound){
                            return callback(new ErrorResponse(ResponseType.NO_RECORD_FOUND, ErrorType.no_data_found), null);
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
                  self.SettingsModel.updateNewSettingsData(settings_id, new_update_data, function(error, data){
                    if(error) {
                        return majorCallback(error, null)
                    }
                    else{
                        return majorCallback(null, "Updated successfully");
                    }
                  })                
            }
        });

        function fetchSettings(callback){
              self.SettingsModel.getSettingsById(settings_id, function(error, data){
                if(error) {
                    return callback(error, null)
                }
                else{
                    if(_.isEmpty(data)){
                        return callback(new ErrorResponse(ResponseType.NO_RECORD_FOUND, ErrorType.no_matching_datas), null);
                    }
                    else{
                        return callback(null, data);
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
                    case 'ACCELERATE_PERSONALISATIONS':{
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
                    case 'ACCELERATE_SHORTCUT_KEYS':{
                        try {
                            var valueList = settingsData.value;
                            var replaceIndex = -1;
                            let selectedNormalKey = entry_to_update.selectedNormalKey;
                            let selectedTriggerKey = entry_to_update.selectedTriggerKey;

                            for(var n = 0; n < valueList.length; n++){
                              if(valueList[n].systemName == filter_key){
                                
                                //Check for same shortcuts for multiple actions
                                for (var i=0; i<valueList[n].data.length; i++){
                                  var key_selected = (valueList[n].data[i].value).split('+'); 

                                  if(selectedNormalKey == '' && selectedTriggerKey == ''){ 
                                    //Call for unset shortcut
                                  }
                                  else{
                                      if(selectedTriggerKey != ''){
                                        if((key_selected[0] == selectedTriggerKey && key_selected[1] == selectedNormalKey) || (key_selected[1] == selectedTriggerKey && key_selected[0] == selectedNormalKey)){
                                          return callback(new ErrorResponse(ResponseType.CONFLICT, "Shortcut key already exists, choose a different key"), null);
                                        }
                                      }
                                      else{
                                        if((key_selected[0] == selectedNormalKey) && key_selected.length == 1){
                                          return callback(new ErrorResponse(ResponseType.CONFLICT, "Shortcut key already exists, choose a different key"), null);
                                        }
                                      }
                                  }

                                  //Find the index at which the key has to be set
                                  if(valueList[n].data[i].name == entry_to_update.updateField){
                                    replaceIndex = i;
                                  }

                                  if((i == valueList[n].data.length - 1) && replaceIndex > -1){ //last iteration and replace index is found
                                    valueList[n].data[replaceIndex].value = selectedTriggerKey != '' ? selectedTriggerKey+'+'+selectedNormalKey : selectedNormalKey;
                                  }
                                }

                              }
                            }     

                            settingsData.value = valueList;
                            return callback(null, settingsData);
                         }
                         catch(er) {
                            return callback(new ErrorResponse(ResponseType.ERROR, ErrorType.server_data_corrupted), null);
                         }
                         break;
                    }
                    case 'ACCELERATE_CONFIGURED_MACHINES':{
                        try {
                            var valueList = settingsData.value;
                            var isFound = false;
                            for(var i = 0; i < valueList.length; i++){
                              if(valueList[i].licence == filter_key){
                                valueList[i].machineCustomName = entry_to_update.new_system_name;
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
}

module.exports = SettingsService;