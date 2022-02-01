 "use strict";
let BaseService = ACCELERONCORE._services.BaseService;
let SettingsModel = require('../models/SettingsModel');

var _ = require('underscore');
var async = require('async');
const ErrorType = require('../utils/errorConstants');

class SettingsService extends BaseService {
    constructor(request) {
        super(request);
        this.request = request;
        this.SettingsModel = new SettingsModel(request);
    }

    async getSettingsById(settings_id) {

      const data = await this.SettingsModel.getSettingsById(settings_id).catch(error => {
        throw error
      });

      if(_.isEmpty(data)){
        throw new ErrorResponse(ResponseType.NO_RECORD_FOUND, ErrorType.no_matching_results);
      }
      else{
          if(_.isUndefined(data.value)){
              throw new ErrorResponse(ResponseType.ERROR, ErrorType.server_data_corrupted);
          }
          else{
              return data; 
          }
      }
    }
  
    async addNewEntryToSettings(settings_id, new_entry) {
        
      const settingsData = await this.getSettingsById(settings_id).catch(error => {
        throw error
      });
      var valueList = settingsData.value;

      switch(settings_id){
        case 'ACCELERATE_TABLE_SECTIONS':{
                 for (var i=0; i<valueList.length; i++) {
                   if (valueList[i] == new_entry.new_section_name){
                      throw new ErrorResponse(ResponseType.CONFLICT, ErrorType.table_section_already_exists);
                   }
                 }

                 valueList.push(new_entry.new_section_name);
             break;
        }
        case 'ACCELERATE_COOKING_INGREDIENTS':{

                 for (var i=0; i<valueList.length; i++) {
                   if (valueList[i] == new_entry.new_ingredient_name){
                      throw new ErrorResponse(ResponseType.CONFLICT, ErrorType.ingredient_already_exists);
                   }
                 }

                 valueList.push(new_entry.new_ingredient_name);
             break;
        }
        case 'ACCELERATE_DINE_SESSIONS':{
                 for (var i=0; i<valueList.length; i++) {
                   if (valueList[i].name == new_entry.name){
                    throw new ErrorResponse(ResponseType.CONFLICT, ErrorType.dine_session_already_exists);
                   }
                 }

                 let newEntryFormatted = {
                  'name' : new_entry.name,
                  'startTime' : new_entry.startTime,
                  'endTime' : new_entry.endTime
                 }

                 valueList.push(newEntryFormatted);
             break;
        }
        case 'ACCELERATE_CANCELLATION_REASONS':{
                 for (var i=0; i<valueList.length; i++) {
                   if (valueList[i] == new_entry.new_reason_name){
                    throw new ErrorResponse(ResponseType.CONFLICT, ErrorType.reason_already_exists);
                   }
                 }

                 valueList.push(new_entry.new_reason_name);
             break;
        }
        case 'ACCELERATE_SAVED_COMMENTS':{
                 for (var i=0; i<valueList.length; i++) {
                   if (valueList[i] == new_entry.new_comment){
                    throw new ErrorResponse(ResponseType.CONFLICT, ErrorType.comment_already_exists);
                   }
                 }

                 valueList.push(new_entry.new_comment);
             break;
        }
        case 'ACCELERATE_BILLING_PARAMETERS':{
          for (var i=0; i<valueList.length; i++) {
            if (valueList[i].name == new_entry.name){
               throw new ErrorResponse(ResponseType.CONFLICT, ErrorType.billing_parameter_already_exists);
            }
          }
          let newEntryFormatted = {
            "name": new_entry.name,
            "excludePackagedFoods": new_entry.excludePackagedFoods,
            "value": new_entry.value,
            "unit": new_entry.unit,
            "unitName": new_entry.unitName
          }
          valueList.push(newEntryFormatted);
          break;
        }
        case 'ACCELERATE_DISCOUNT_TYPES':{
          for (var i=0; i<valueList.length; i++) {
            if (valueList[i].name == new_entry.name){
               throw new ErrorResponse(ResponseType.CONFLICT, ErrorType.discount_name_already_exits);
            }
          }
          let newEntryFormatted = {
            "name": new_entry.name,
            "maxDiscountUnit": new_entry.maxDiscountUnit,
            "maxDiscountValue": new_entry.maxDiscountValue,
          }
          valueList.push(newEntryFormatted);
          break;
        }
        case 'ACCELERATE_BILLING_MODES':{
          for (var i=0; i<valueList.length; i++) {
            if (valueList[i].name == new_entry.name){
               throw new ErrorResponse(ResponseType.CONFLICT, ErrorType.billing_mode_already_exists);
            }
          }
          const billParamData = await this.getSettingsById('ACCELERATE_BILLING_PARAMETERS').catch(error => {
            throw error
          });
          var billParamList = billParamData.value;
          for (var i=0; i<new_entry.extras.length; i++) {
            var isActive = 0
            for (var j=0; j<billParamList.length; j++) {
              if(billParamList[j].name == new_entry.extras[i].name){
                isActive = 1
              }
            }
            if(!isActive){
              throw new ErrorResponse(ResponseType.BAD_REQUEST, 'Please remove "'+ new_entry.extras[i].name + '" from extras as it is no longer a billing parameter');
            }
          }
          valueList.push(new_entry);
          break;
        }
        case 'ACCELERATE_PAYMENT_MODES':{
          for (var i=0; i<valueList.length; i++) {
            if (valueList[i].name == new_entry.name){
               throw new ErrorResponse(ResponseType.CONFLICT, ErrorType.payment_mode_already_exists);
            }
          }
          let newEntryFormatted = {
            "name": new_entry.name,
            "code": new_entry.code,
          }
          valueList.push(newEntryFormatted);
          break;
        }
        case 'ACCELERATE_ORDER_SOURCES':{
          for (var i=0; i<valueList.length; i++) {
            if (valueList[i].name == new_entry.name){
               throw new ErrorResponse(ResponseType.CONFLICT, ErrorType.order_source_name_already_exists);
            }
          }
          let newEntryFormatted = {
            "name": new_entry.name,
            "code": new_entry.code,
            "defaultTakeaway": new_entry.defaultTakeaway,
            "defaultDelivery": new_entry.defaultDelivery
          }
          valueList.push(newEntryFormatted);
          break;
        }
        case 'ACCELERATE_CONFIGURED_MACHINES':{
          for (var i=0; i<valueList.length; i++) {
            if (valueList[i].licence == new_entry.licence){
               throw new ErrorResponse(ResponseType.CONFLICT, ErrorType.license_already_used);
            }
          }
          valueList.push(new_entry);
          break;
        }
        case 'ACCELERATE_PERSONALISATIONS':
        case 'ACCELERATE_SYSTEM_OPTIONS':
        case 'ACCELERATE_SHORTCUT_KEYS':
        case 'ACCELERATE_CONFIGURED_PRINTERS':
        case 'ACCELERATE_KOT_RELAYING':{
          var isAlreadyFound = false;
          for(var n=0; n<valueList.length; n++){
            if(valueList[n].systemName == new_entry.systemName){
              isAlreadyFound = true;
              break;
            }
          }  
          if(!isAlreadyFound){
            valueList.push(new_entry);              
          }
          break;
        }
        
        default:{
          throw new ErrorResponse(ResponseType.ERROR, ErrorType.server_cannot_handle_request);
        }
      }
      settingsData.value = valueList;
      return await this.SettingsModel.updateNewSettingsData(settings_id, settingsData).catch(error => {
        throw error
      });

    }

    async removeEntryFromSettings(settings_id, entry_to_remove) {

      const settingsData = await this.getSettingsById(settings_id).catch(error => {
        throw error
      });
      var valueList = settingsData.value;
      var isFound = false;

      switch(settings_id){
        case 'ACCELERATE_TABLE_SECTIONS':{
                 for (var i=0; i<valueList.length; i++) {
                   if (valueList[i] == entry_to_remove.section_name){
                        valueList.splice(i,1);
                        isFound = true;
                        break;
                   }
                 }
            break;
        }
        case 'ACCELERATE_COOKING_INGREDIENTS':{
                 for (var i=0; i<valueList.length; i++) {
                   if (valueList[i] == entry_to_remove.ingredient_name){
                        valueList.splice(i,1);
                        isFound = true;
                        break;
                   }
                 }
            break;
        }
        case 'ACCELERATE_DINE_SESSIONS':{
                 for (var i=0; i<valueList.length; i++) {
                   if (valueList[i].name == entry_to_remove.session_name){
                        valueList.splice(i,1);
                        isFound = true;
                        break;
                   }
                 }
            break;
        }
        case 'ACCELERATE_CANCELLATION_REASONS':{
                 for (var i=0; i<valueList.length; i++) {
                   if (valueList[i] == entry_to_remove.reason_name){
                        valueList.splice(i,1);
                        isFound = true;
                        break;
                   }
                 }
            break;
        }
        case 'ACCELERATE_SAVED_COMMENTS':{           
          for (var i=0; i<valueList.length; i++) {
            if (valueList[i] == entry_to_remove.saved_comment){
              valueList.splice(i,1);
              isFound = true;
              break;
            }
          }
          break;
        }
        case 'ACCELERATE_MENU_CATALOG':{           
          for (var i=0; i<valueList.length; i++) {
            if (valueList[i].name == entry_to_remove.categoryName){
                 valueList.splice(i,1);
                 isFound = true;
                 break;
            }
          }
          break;
        }
        case 'ACCELERATE_BILLING_PARAMETERS':{
          for (var i=0; i<valueList.length; i++) {
            if (valueList[i].name == entry_to_remove.name){
                 valueList.splice(i,1);
                 isFound = true;
                 break;
            }
          }
          break;
        }
        case 'ACCELERATE_DISCOUNT_TYPES':{
          for (var i=0; i<valueList.length; i++) {
            if (valueList[i].name == entry_to_remove.name){
                 valueList.splice(i,1);
                 isFound = true;
                 break;
            }
          }
          break;
        }
        case 'ACCELERATE_BILLING_MODES':{
          for (var i=0; i<valueList.length; i++) {
            if (valueList[i].name == entry_to_remove.name){
                 valueList.splice(i,1);
                 isFound = true;
                 break;
            }
          }
          break;
        }
        case 'ACCELERATE_PAYMENT_MODES':{
          for (var i=0; i<valueList.length; i++) {
            if (valueList[i].name == entry_to_remove.name){
                 valueList.splice(i,1);
                 isFound = true;
                 break;
            }
          }
          break;
        }
        case 'ACCELERATE_ORDER_SOURCES':{
          for (var i=0; i<valueList.length; i++) {
            if (valueList[i].name == entry_to_remove.name){
                 valueList.splice(i,1);
                 isFound = true;
                 break;
            }
          }
          break;
        }
        case 'ACCELERATE_CONFIGURED_PRINTERS':{
          for(var i=0; i<valueList.length; i++){
            if(valueList[i].systemName == entry_to_remove.machineName){
              var printers = valueList[i].data;
              for (var j=0; j<printers.length; j++) {
                if (printers[j].name == entry_to_remove.name){
                  valueList[i].data.splice(j,1);
                  isFound = true;
                  break;
                }
              }
              break;
            }
          }
          break;
        }
        case 'ACCELERATE_KOT_RELAYING':{
          for(var i=0; i<valueList.length; i++){
            if(valueList[i].systemName == entry_to_remove.machineName){
              var kots = valueList[i].data;
              for (var j=0; j<kots.length; j++) {
                if (kots[j].printer == entry_to_remove.printer){
                  valueList[i].data.splice(j,1);
                  isFound = true;
                  break;
                }
              }
              break;
            }
          }
          break;
        }
        
        default:{
          throw new ErrorResponse(ResponseType.ERROR, ErrorType.server_cannot_handle_request);
        }
      }

      if(!isFound){
        throw new ErrorResponse(ResponseType.NO_RECORD_FOUND, ErrorType.no_matching_results);
       }

      settingsData.value = valueList;
      return await this.SettingsModel.updateNewSettingsData(settings_id, settingsData).catch(error => {
        throw error
      });

    }

    async filterItemFromSettingsList(settings_id, filter_key) {

      const settingsData = await this.getSettingsById(settings_id).catch(error => {
        throw error
      });
      var valueList = settingsData.value;
      var isFound = false;
      let returnResponse = ''
      switch(settings_id){
        case 'ACCELERATE_STAFF_PROFILES':{
                 
          for(var i = 0; i < valueList.length; i++){
            if(valueList[i].code == filter_key){
                isFound = true;
                returnResponse = valueList[i]
                delete returnResponse['password'];
                break;
            }
          }
          break;
        }
        case 'ACCELERATE_SYSTEM_OPTIONS':{
          for(var i = 0; i < valueList.length; i++){
            if(valueList[i].systemName == filter_key){
              isFound = true;
              returnResponse = valueList[i].data
              break;
            }
          }
          break;
        }
        case 'ACCELERATE_CONFIGURED_MACHINES':{
          for(var i = 0; i < valueList.length; i++){
            if(valueList[i].licence == filter_key){
              isFound = true;
              returnResponse = valueList[i]
              break;
            }
          }
          break;
        }
        default:{
          throw new ErrorResponse(ResponseType.ERROR, ErrorType.server_cannot_handle_request);
        }
      }
      
      if(!isFound){
        throw new ErrorResponse(ResponseType.NO_RECORD_FOUND, ErrorType.no_matching_results);
      }
      return returnResponse;
    }

    async updateItemFromSettingsList(settings_id, filter_key, entry_to_update) {

      const settingsData = await this.getSettingsById(settings_id).catch(error => {
        throw error
      });
      var valueList = settingsData.value;
      switch(settings_id){
        case 'ACCELERATE_SYSTEM_OPTIONS':{
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
            throw new ErrorResponse(ResponseType.NO_RECORD_FOUND, ErrorType.no_matching_results);
          }
          break;           
        
        }
        case 'ACCELERATE_PERSONALISATIONS':{
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
            throw new ErrorResponse(ResponseType.NO_RECORD_FOUND, ErrorType.no_matching_results);
          }     
          break;
        }
        case 'ACCELERATE_SHORTCUT_KEYS':{
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
                        throw new ErrorResponse(ResponseType.CONFLICT, ErrorType.shortcut_key_already_exists);
                      }
                    }
                    else{
                      if((key_selected[0] == selectedNormalKey) && key_selected.length == 1){
                        throw new ErrorResponse(ResponseType.CONFLICT, ErrorType.shortcut_key_already_exists);
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
          break;
        }
        case 'ACCELERATE_CONFIGURED_MACHINES':{
          var isFound = false
          for(var i = 0; i < valueList.length; i++){
            if(valueList[i].licence == filter_key){
              valueList[i].machineCustomName = entry_to_update.new_system_name;
              isFound = true;
              break;
            }
          }
          if(!isFound){
            throw new ErrorResponse(ResponseType.NO_RECORD_FOUND, ErrorType.no_matching_results);
          }     
          break;
        }
        case 'ACCELERATE_MENU_CATALOG':{
          if(valueList.length == 0){
            var newEntry = {
              "name": filter_key,
              "mainType": entry_to_update.mainType
            }

            valueList.push(newEntry);
          }
          else{
            var isFound = false
            for(var i = 0; i < valueList.length; i++){
              if(valueList[i].name == filter_key){
                valueList[i].mainType = entry_to_update.mainType;
                isFound = true;
                break;
              }
            }
            if(!isFound){
              var newEntry =     {
                "name": filter_key,
                "mainType": entry_to_update.mainType
              }
              valueList.push(newEntry);
            }
          }     
          break;
        }
        case 'ACCELERATE_KOT_RELAYING':{
          for(var n=0; n<valueList.length; n++){
            if(valueList[n].systemName == filter_key){
              if(valueList[n].data.length == 0){
                var newEntry = {
                  "name": entry_to_update.categoryName,
                  "printer": entry_to_update.printerName
                }
                valueList[n].data.push(newEntry);
              }
              else{
                var isFound = false
                for (var i=0; i<valueList[n].data.length; i++){
                  if(valueList[n].data[i].name == entry_to_update.categoryName){
                    valueList[n].data[i].printer = entry_to_update.printerName;
                    isFound = true;
                    break;
                  }
                }
                if(!isFound){
                  var newEntry =     {
                    "name": entry_to_update.categoryName,
                    "printer": entry_to_update.printerName
                  }
                  valueList[n].data.push(newEntry);
                }  
              }
              break;
            }
          }   
          break;
        }
        case 'ACCELERATE_CONFIGURED_PRINTERS':{
          for(var n=0; n<valueList.length; n++){
            if(valueList[n].systemName == filter_key){
              if(valueList[n].data.length == 0){
                var newEntry = {
                  "name": entry_to_update.name,
                  "type": entry_to_update.type,
                  "height": entry_to_update.height,
                  "width": entry_to_update.width,
                  "actions": entry_to_update.actions,
                }
                valueList[n].data.push(newEntry);
              }
              else{
                for (var i=0; i<valueList[n].data.length; i++){
                  if(valueList[n].data[i].name == entry_to_update.name){
                    throw new ErrorResponse(ResponseType.CONFLICT, ErrorType.printer_name_already_exists);
                  }
                }
                if(!isFound){
                  var newEntry = {
                    "name": entry_to_update.name,
                    "type": entry_to_update.type,
                    "height": entry_to_update.height,
                    "width": entry_to_update.width,
                    "actions": entry_to_update.actions,
                  }
                  valueList[n].data.push(newEntry);
                }  
              }
              break;
            }
          }   
          break;
        }
        case 'ACCELERATE_BILL_LAYOUT':{
          if(filter_key == 'logo'){
            for(var i=0;i<valueList.length;i++){
              if(valueList[i].name == 'data_custom_header_image'){
                valueList[i].value = entry_to_update.value;
                break;
              }
            }
          }
          else if(filter_key == 'text'){
            for(var i=0;i<valueList.length;i++){
              if(valueList[i].name == 'data_custom_header_image'){
                entry_to_update.push(valueList[i]);
                break;
              }
            }
            valueList = entry_to_update
          }
          
          break;
        }
        case 'ACCELERATE_PAYMENT_MODES':{
            for(var i=0;i<valueList.length;i++){
              if(valueList[i].code == filter_key){
                valueList[i].name = entry_to_update.paymentName;
                break;
              }
            }       
          break;
        }

        default:{
          throw new ErrorResponse(ResponseType.ERROR, ErrorType.server_cannot_handle_request);
        }
      }           
      settingsData.value = valueList;
      return await this.SettingsModel.updateNewSettingsData(settings_id, settingsData).catch(error => {
        throw error
      });          
    }

    async renameCategoryKOTRelays(machineName, categoryName, newCategoryName) {

      const settingsData = await this.getSettingsById('ACCELERATE_KOT_RELAYING').catch(error => {
        throw error
      });
      var settingsList = settingsData.value;
      var isFound = false;
      var isCategoryFound = false;
      for(var n=0; n<settingsList.length; n++){
        if(settingsList[n].systemName == machineName){
          for (var i=0; i<settingsList[n].data.length; i++){
            if(settingsList[n].data[i].name == categoryName){
              settingsList[n].data[i].name = newCategoryName;
              isCategoryFound = true;
              break;
            }
          }
          isFound = true;
          break;
        }
      }
      if(!isFound || !isCategoryFound){
        throw new ErrorResponse(ResponseType.NO_RECORD_FOUND, ErrorType.no_matching_results);
      }
      else{    
      settingsData.value = settingsList;
      return await this.SettingsModel.updateNewSettingsData('ACCELERATE_KOT_RELAYING', settingsData).catch(error => {
        throw error
      });
      }  
    }

    async deleteCategoryKOTRelays(machineName, categoryName) {

      const settingsData = await this.getSettingsById('ACCELERATE_KOT_RELAYING').catch(error => {
        throw error
      });
      var settingsList = settingsData.value;
      var isFound = false;
      var isCategoryFound = false;
      for(var n=0; n<settingsList.length; n++){
        if(settingsList[n].systemName == machineName){
            for (var i=0; i<settingsList[n].data.length; i++){
              if(settingsList[n].data[i].name == categoryName){
                settingsList[n].data.splice(i,1);
                isCategoryFound = true;
                break;
              }
            }
          isFound = true;  
          break;
        }
      }
      if(!isFound || !isCategoryFound){
        throw new ErrorResponse(ResponseType.NO_RECORD_FOUND, ErrorType.no_matching_results);
      }
      else{      
      settingsData.value = settingsList;
      return await this.SettingsModel.updateNewSettingsData('ACCELERATE_KOT_RELAYING', settingsData).catch(error => {
        throw error
      });  
      }
    }

}

module.exports = SettingsService;