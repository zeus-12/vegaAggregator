"use strict";
let BaseController = ACCELERONCORE._controllers.BaseController;
let UserService = require('../services/UserService');

var _ = require('underscore');

class UserController extends BaseController {

    constructor(request) {
        super(request);
        this.UserService = new UserService(request);
    }

    async getUserById() {
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

    async getAllUsers() {
        var filter = this.request.query.filter;
        if(!_.isEmpty(filter)){
            filter = filter.toUpperCase();
            if(filter != 'ADMIN' && filter != 'AGENT' && filter != 'STEWARD'){
                throw new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.invalid_filter);
            }
        }
        return await this.UserService.getAllUsers(filter).catch(error => {
            throw error
        }); 
    }

    async createNewUser() {
        let new_entry = this.request.body;
        if (_.isEmpty(new_entry.name)) {
            throw new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.name_is_empty_or_invalid);
        }
        if (_.isEmpty(new_entry.role)) {
            throw new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.role_is_empty_or_invalid);
        }
        if (_.isEmpty(new_entry.code)) {
            throw new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.code_is_empty_or_invalid);
        }

        return await this.UserService.createNewUser(new_entry).catch(error => {
            throw error
        });
    }

    async deleteUserById(){
        let userData = this.request.body;
        if (_.isEmpty(userData.delete_user_code)) {
            throw new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.code_is_empty_or_invalid);
        }
        return await this.UserService.deleteUserById(userData.delete_user_code).catch(error => {
            throw error
        });           
    }

    async changeUserPasscode(){

        let passData = this.request.body;
        if (_.isEmpty(passData.code)) {
            return callback(new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.code_is_empty_or_invalid));
        }
        if ( _.isEmpty(passData.current_passcode)) {
            return callback(new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.passcode_is_empty_or_invalid));
        }
        if (_.isEmpty(passData.updating_passcode)) {
            return callback(new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.passcode_is_empty_or_invalid));
        }

        if(passData.updating_passcode.length != 4 || isNaN(passData.updating_passcode)){
            return callback(new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.passcode_has_to_be_four_digit));
        }

        return await this.UserService.changeUserPasscode(passData).catch(error => {
            throw error
        });          
    }
}

module.exports = UserController;