"use strict";
let BaseService = ACCELERONCORE._services.BaseService;
let UserModel = require('../models/UserModel');
let SettingsService = require('./SettingsService');
let CommonService = require('./CommonService');

var _ = require('underscore');
var async = require('async');

class UserService extends BaseService {
    constructor(request) {
        super(request);
        this.request = request;
        this.SettingsService = new SettingsService(request);
        this.CommonService = new CommonService(request);
    }

    getUserById(user_id, callback) {
      let self = this;
      self.SettingsService.filterItemFromSettingsList('ACCELERATE_STAFF_PROFILES', user_id, function(error, result){
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

    getAllUsers(filter, callback){
      let self = this;
      self.SettingsService.getSettingsById('ACCELERATE_STAFF_PROFILES', function(error, result){
        if(error) {
            return callback(error, null)
        }
        else{
            let userData = result;
            let finalData = [];
            for(var i = 0; i < userData.length; i++){
              if(!_.isEmpty(filter)){
                if(userData[i].role == filter){
                  delete userData[i]['password'];
                  finalData.push(userData[i]);
                }
              }
              else{
                delete userData[i]['password'];
              }
            }

            if(!_.isEmpty(filter)){
              return callback(null, finalData);
            }
            else{
              return callback(null, userData);
            }
        }
      })      
    }

    createNewUser(newUserData, callback){
      let self = this;
      self.CommonService.getSettingsFileById('ACCELERATE_STAFF_PROFILES', function(error, result){
        if(error) {
            return callback(error, null)
        }
        else{
            let userDataFile = result;
            let userData = userDataFile.value;
            let isDuplicate = false;
            for(var i = 0; i < userData.length; i++){
              if (userData[i].code == newUserData.code){
                  isDuplicate = true;
                  break;
              }
            }

            if(isDuplicate){
              return callback(new ErrorResponse(ResponseType.CONFLICT, 'Mobile number '+newUserData.code+' already registered'), null);
            }

            userData.push(newUserData);
            userDataFile.value = userData;
            self.CommonService.updateSettingsFileById('ACCELERATE_STAFF_PROFILES', userDataFile, function(error, result){
                if(error) {
                  return callback(error, null)
                }
                else{
                  return callback(null, result);
                }
            })
        }
      })
    }

    deleteUserById(delete_user_code, callback){
      let self = this;
      self.CommonService.getSettingsFileById('ACCELERATE_STAFF_PROFILES', function(error, result){
        if(error) {
            return callback(error, null)
        }
        else{
            let userDataFile = result;
            let userData = userDataFile.value;
            let isFound = false;
            for(var i = 0; i < userData.length; i++){
              if (userData[i].code == delete_user_code){
                  userData.splice(i,1);
                  isFound = true;
                  break;
              }
            }

            if(!isFound){
              return callback(new ErrorResponse(ResponseType.NOT_FOUND, 'No user found for ' + delete_user_code), null);
            }

            userDataFile.value = userData;
            self.CommonService.updateSettingsFileById('ACCELERATE_STAFF_PROFILES', userDataFile, function(error, result){
                if(error) {
                  return callback(error, null)
                }
                else{
                  return callback(null, result);
                }
            })
        }
      })   
    }

    changeUserPasscode(passData, callback){
      let self = this;
      self.CommonService.getSettingsFileById('ACCELERATE_STAFF_PROFILES', function(error, result){
        if(error) {
            return callback(error, null)
        }
        else{
            let userDataFile = result;
            let userData = userDataFile.value;
            let isFound = false;
            for(var i = 0; i < userData.length; i++){
              if (userData[i].code == passData.code){
                  if(passData.current_passcode == userData[i].password){
                    userData[i].password = passData.updating_passcode;
                  }
                  else{
                    return callback(new ErrorResponse(ResponseType.NOT_FOUND, 'Incorrect passcode entered'), null);
                  }
                  
                  isFound = true;
                  break;
              }
            }

            if(!isFound){
              return callback(new ErrorResponse(ResponseType.NOT_FOUND, 'No user found'), null);
            }

            userDataFile.value = userData;
            self.CommonService.updateSettingsFileById('ACCELERATE_STAFF_PROFILES', userDataFile, function(error, result){
                if(error) {
                  return callback(error, null)
                }
                else{
                  return callback(null, result);
                }
            })
        }
      })   
    }


}

module.exports = UserService;