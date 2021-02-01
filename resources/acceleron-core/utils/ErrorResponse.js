let BaseResponse = require('./BaseResponse');
let _ = require('underscore');

class ErrorResponse extends Error {
    constructor(responseType, data) {
        super(data);
        this.data = data;
        this.responseType = responseType ? responseType : BaseResponse.ResponseType.ERROR;
    }

    static errorHandler() {
        return function (err, req, res, next) {
            if (err instanceof ErrorResponse) {
                let response_body = {code: err.responseType.status_code, msg: err.responseType.msg};
                (err.data) ? response_body.data = err.data : false;
                return res.status(response_body.code).json(response_body);
            } else if (err instanceof Error) {
                let response_body = {
                    code: BaseResponse.ResponseType.ERROR.status_code,
                    msg: BaseResponse.ResponseType.ERROR.msg
                };
                (process.env.NODE_ENV === 'development') ? response_body.data = err.stack.toString() : false;
                
                return res.status(response_body.code).json(response_body);
            } else {
                return next(err);
            }
        };
    }

    send(res) {
        let response_body = {code: this.responseType.status_code, msg: this.responseType.msg};
        (this.data) ? response_body.data = this.data : false;
        return res.status(response_body.code).json(response_body);
    }
}

module.exports = ErrorResponse;