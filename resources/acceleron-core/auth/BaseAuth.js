let jwt = require("jsonwebtoken");
let _ = require("lodash");
let ErrorResponse = require("../utils/ErrorResponse");
let BaseResponse = require("../utils/BaseResponse");
let ResponseType = BaseResponse.ResponseType;
//todo
const secretKey = "secretkey";

module.exports = function (req, res, next) {
  var token =
    req.body.token || req.query.token || req.headers["x-access-token"];
  var route = req.path;
  var ignore_routes = ["/ping", "/login"];
  // decode token
  if (ignore_routes.indexOf(route) >= 0) {
    next();
  } else if (token) {
    try {
      //token eg:   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjbGllbnQiOiJaQUlUT09OIiwiYnJhbmNoIjoiQURZQVIiLCJpc3N1ZVRpbWUiOjE2NTQxMDAxMDEsInVzZXIiOnsidmVyaWZpZWRNb2JpbGUiOiI4NjA2ODA0ODgwIiwibmFtZSI6IlZJU0hOVSIsImlkIjoic3J3cjM5dHJnOWVkOWc5M3I1ODN0ODRlOHRnOHJncmYiLCJyb2xlIjoiUkVHVUxBUiIsImhvbWVCcmFuY2giOiJWRUxBQ0hFUlkifSwibWFjaGluZUlkIjoiWjUwMCIsImlhdCI6MTY1NDEwMDEwMSwiZXhwIjoxNjU0NzA0OTAxfQ.mnURXFZ4yRrwMHQcA1K5Lb4sF7ZG0HUU3f00S_SUBBQ
      var loggedInUser = jwt.verify(token, secretKey);
      var { client, branch, machineId } = loggedInUser;
      var { name, role, verifiedMobile: userMobile } = loggedInUser.user;

      req.loggedInUser = { client, branch, machineId, name, role, userMobile };
      //   console.log(req.loggedInUser);
      next();
    } catch (err) {
      throw new ErrorResponse(
        ResponseType.AUTH_FAILED,
        "Failed to authenticate token"
      );
    }
    // // verifies secret and checks exp
    // if (
    //   !_.isEmpty(process.env.SERVICE_ACCESS_TOKEN) &&
    //   token === process.env.SERVICE_ACCESS_TOKEN
    // ) {
    //   return next();
    // }

    // jwt.verify(
    //   token,
    //   process.env.JWT_TOKEN_KEY || "secret",
    //   function (err, decoded) {
    //     if (err) {
    //       return next(
    //         new ErrorResponse(
    //           ResponseType.AUTH_FAILED,
    //           "Failed to authenticate token"
    //         )
    //       );
    //     }
    //     req.decoded = decoded;
    //     next();
    //   }
    // );
  } else {
    return next(new ErrorResponse(ResponseType.NO_AUTH, "No token provided"));
  }
};
