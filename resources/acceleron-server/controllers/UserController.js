"use strict";
let BaseController = ACCELERONCORE._controllers.BaseController;
let UserService = require('../services/UserService');

var _ = require('underscore');

class UserController extends BaseController {

    constructor(request) {
        super(request);
        this.UserService = new UserService(request);
    }

    getUserById(callback) {
        let self = this;
        var user_id = self.request.params.id;

        if (_.isEmpty(user_id)) {
            return callback(new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.missing_required_parameters));
        }

        self.UserService.getUserById(user_id, function (error, result) {
            if(error){
                return callback(error, null);
            }
            else{
                return callback(null, result);
            }
        });
    }

    getAllUsers(callback) {
        let self = this;
        var filter = self.request.query.filter;
        if(!_.isEmpty(filter)){
            filter = filter.toUpperCase();
            if(filter != 'ADMIN' && filter != 'AGENT' && filter != 'STEWARD'){
                return callback(new ErrorResponse(ResponseType.BAD_REQUEST, 'Invalid filter'));
            }
        }

        self.UserService.getAllUsers(filter, function (error, result) {
            if(error){
                return callback(error, null);
            }
            else{
                return callback(null, result);
            }
        });
    }

    createNewUser(callback) {
        let self = this;
        let new_entry = self.request.body;
        if (_.isEmpty(new_entry.name) || _.isEmpty(new_entry.code) || _.isEmpty(new_entry.role)) {
            return callback(new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.missing_required_parameters));
        }

        self.UserService.createNewUser(new_entry, function (error, result) {
            if(error){
                return callback(error, null);
            }
            else{
                return callback(null, result);
            }
        });
    }

    deleteUserById(callback){
        let self = this;
        let userData = self.request.body;
        if (_.isEmpty(userData.delete_user_code)) {
            return callback(new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.missing_required_parameters));
        }

        self.UserService.deleteUserById(userData.delete_user_code, function (error, result) {
            if(error){
                return callback(error, null);
            }
            else{
                return callback(null, result);
            }
        });             
    }

    changeUserPasscode(callback){
        let self = this;
        let passData = self.request.body;
        if (_.isEmpty(passData.code) || _.isEmpty(passData.current_passcode) || _.isEmpty(passData.updating_passcode)) {
            return callback(new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.missing_required_parameters));
        }

        if(passData.updating_passcode.length != 4 || isNaN(passData.updating_passcode)){
            return callback(new ErrorResponse(ResponseType.BAD_REQUEST, 'Passcode has to be a 4 digit number'));
        }

        self.UserService.changeUserPasscode(passData, function (error, result) {
            if(error){
                return callback(error, null);
            }
            else{
                return callback(null, result);
            }
        });           
    }
}

module.exports = UserController;