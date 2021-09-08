"use strict";
let uuid = require("uuid");

class BaseResponse {

    constructor(ResponseType) {
        this.status_code = ResponseType.status_code;
        this.msg = ResponseType.msg;
    }

    send(res, data) {
        let response_body = {code: this.status_code, msg: this.msg};
        if (data) {
            response_body.data = data;
        }
        res.status(this.status_code).json(response_body);
    }
}

BaseResponse.ResponseType = {};
BaseResponse.ResponseType.ERROR = {status_code: 500, msg: 'some error occurred'};
BaseResponse.ResponseType.SUCCESS = {status_code: 200, msg: 'success'};
BaseResponse.ResponseType.CREATED = {status_code: 201, msg: 'success'};
BaseResponse.ResponseType.ACCEPTED = {status_code: 202, msg: 'success'};
BaseResponse.ResponseType.BAD_REQUEST = {status_code: 400, msg: 'bad request'};
BaseResponse.ResponseType.AUTH_FAILED = {status_code: 401, msg: 'auth failure'};
BaseResponse.ResponseType.NO_AUTH = {status_code: 403, msg: 'auth failure'};
BaseResponse.ResponseType.NO_RECORD_FOUND = {status_code: 404, msg: 'no record found'};
BaseResponse.ResponseType.NOT_FOUND = {status_code: 404, msg: 'not found'};
BaseResponse.ResponseType.SERVER_TIMEDOUT = {status_code: 408, msg: 'server timed out'};
BaseResponse.ResponseType.CONFLICT = {status_code: 409, msg: 'conflict'};

/* Menu Responses */
BaseResponse.ResponseType.ERROR_DUPLICATE_ITEM = {status_code: 501, msg: 'Error due to item duplication'};

module.exports = BaseResponse;