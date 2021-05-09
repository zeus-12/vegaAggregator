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

    async getUserById(user_id) {
      return await this.SettingsService.filterItemFromSettingsList('ACCELERATE_STAFF_PROFILES', user_id).catch(error => {
        throw error
      });
    }    

    async getAllUsers(filter){

      const userData =  await this.SettingsService.getSettingsById('ACCELERATE_STAFF_PROFILES').catch(error => {
        throw error
      });
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
        return finalData;
      }
      else{
        return userData;
      }
     
    }

    async createNewUser(newUserData){
      const userDataFile =  await this.CommonService.getSettingsFileById('ACCELERATE_STAFF_PROFILES').catch(error => {
        throw error
      });
      var userData = userDataFile.value;
      var isDuplicate = false;
      for(var i = 0; i < userData.length; i++){
        if (userData[i].code == newUserData.code){
            isDuplicate = true;
            break;
        }
      }
      if(isDuplicate){
        throw new ErrorResponse(ResponseType.CONFLICT, 'Mobile number '+newUserData.code+' already registered');
      }
      userData.push(newUserData);
      userDataFile.value = userData;
      return await this.CommonService.updateSettingsFileById('ACCELERATE_STAFF_PROFILES', userDataFile).catch(error => {
        throw error
      });
    }

    async deleteUserById(delete_user_code){
      const userDataFile =  await this.CommonService.getSettingsFileById('ACCELERATE_STAFF_PROFILES').catch(error => {
        throw error
      });
      var userData = userDataFile.value;
      var isFound = false;
      for(var i = 0; i < userData.length; i++){
        if (userData[i].code == delete_user_code){
            userData.splice(i,1);
            isFound = true;
            break;
        }
      }
      if(!isFound){
        throw new ErrorResponse(ResponseType.NOT_FOUND, ErrorType.no_user_found);
      }
      userDataFile.value = userData;
      return await this.CommonService.updateSettingsFileById('ACCELERATE_STAFF_PROFILES', userDataFile).catch(error => {
        throw error
      });  
    }

    async changeUserPasscode(passData){
      const userDataFile =  await this.CommonService.getSettingsFileById('ACCELERATE_STAFF_PROFILES').catch(error => {
        throw error
      });
      var userData = userDataFile.value;
      var isFound = false;
      for(var i = 0; i < userData.length; i++){
        if (userData[i].code == passData.code){
            if(passData.current_passcode == userData[i].password){
              userData[i].password = passData.updating_passcode;
            }
            else{
              throw new ErrorResponse(ResponseType.NOT_FOUND, ErrorType.incorrect_password);
            }            
            isFound = true;
            break;
        }
      }
      if(!isFound){
        throw new ErrorResponse(ResponseType.NOT_FOUND, ErrorType.no_user_found);
      }
      userDataFile.value = userData;
      return await this.CommonService.updateSettingsFileById('ACCELERATE_STAFF_PROFILES', userDataFile).catch(error => {
        throw error
      });   
    }


}

module.exports = UserService;