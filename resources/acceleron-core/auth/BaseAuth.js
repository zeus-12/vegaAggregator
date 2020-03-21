let jwt = require("jsonwebtoken");
let _ = require('lodash');
let ErrorResponse = require('../utils/ErrorResponse');
let BaseResponse = require('../utils/BaseResponse');
let ResponseType = BaseResponse.ResponseType;

module.exports = function (req, res, next) {
    var token = req.body.token || req.query.token || req.headers["x-access-token"];
    var route = req.path;
    var ignore_routes = ["/ping", "/login"];
    // decode token
    if (ignore_routes.indexOf(route) >= 0) {
        next();
    } else if (token) {
        // verifies secret and checks exp
        if (!_.isEmpty(process.env.SERVICE_ACCESS_TOKEN) && token === process.env.SERVICE_ACCESS_TOKEN){
            return next()
        }

        jwt.verify(token, process.env.JWT_TOKEN_KEY || "secret", function (err, decoded) {
            if (err) {
                return next(new ErrorResponse(ResponseType.AUTH_FAILED, 'Failed to authenticate token'))
            }
            req.decoded = decoded;
            next();
        });

    } else {
        return next(new ErrorResponse(ResponseType.NO_AUTH, 'No token provided'))
    }
};