let jwt = require("jsonwebtoken");
let _ = require("lodash");
let ErrorResponse = require("../utils/ErrorResponse");
let BaseResponse = require("../utils/BaseResponse");
let ResponseType = BaseResponse.ResponseType;

//Server Secret for JWT
const secretKey = process.env.TOKEN_KEY || "";

module.exports = function (req, res, next) {
  var token =
    req.body.token || req.query.token || req.headers["x-access-token"];
  if (secretKey == "")
    throw new ErrorResponse(
      BaseResponse.ResponseType.ERROR,
      ErrorType.server_cannot_verify_request
    );

  var route = req.path;
  var ignore_routes = ["/ping", "/login"];
  // decode token
  if (ignore_routes.indexOf(route) >= 0) {
    next();
  } else if (token) {
    try {
      var loggedInUser = jwt.verify(token, secretKey);
      var { client, branch, machineId } = loggedInUser;
      var { name, role, verifiedMobile: userMobile } = loggedInUser.user;

      req.loggedInUser = { client, branch, machineId, name, role, userMobile };
      next();
    } catch (err) {
      throw new ErrorResponse(
        ResponseType.AUTH_FAILED,
        "Failed to authenticate token"
      );
    }
  } else {
    return next(new ErrorResponse(ResponseType.NO_AUTH, "No token provided"));
  }
};
