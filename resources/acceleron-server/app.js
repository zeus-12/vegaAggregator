"use strict";
const RUN_TYPE = process.env.APP_RUN_TYPE || "default";
process.env.APP_NAME = process.env.APP_NAME || 'acceleron-service';
process.env.PORT = process.env.PORT || 3000;
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

let cron = require("node-cron");
let path = require("path");
let express = require("express");
let morgan = require("morgan");
let bodyParser = require("body-parser");
let compression = require("compression");
let uuid = require("uuid");
let cors = require('cors');
require('dotenv').config()

let app = express();

global.ACCELERONCORE = require("../acceleron-core");

global.BaseResponse = ACCELERONCORE._utils.BaseResponse;
global.ResponseType = ACCELERONCORE._utils.BaseResponse.ResponseType;
global.ErrorResponse = ACCELERONCORE._utils.ErrorResponse;

global.ErrorType = require('./utils/ErrorConstants');


const SOCKET_IDLE_TIMEOUT = parseInt(process.env.SOCKET_IDLE_TIMEOUT || "100") * 1000;
const REQUEST_TIMEOUT = parseInt(process.env.REQUEST_TIMEOUT || "300") * 1000;

// body parser
app.use(bodyParser.json({
    limit: "15mb"
}));
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(compression({
    threshold: 512
}));

// request tracing
app.use(function (req, res, next) {
    let requestId = req.get("x-request-id");
    requestId = requestId ? requestId : uuid.v4();
    let parentSpan = req.get("x-trace-id");
    parentSpan = parentSpan ? parentSpan : requestId;
    
    next();
});

// setup request timeout
app.use(function (req, res, next) {
    req.__oms_timeout = setTimeout(function (socket) {
        next(new ErrorResponse(ResponseType.SERVER_TIMEDOUT));
    }, REQUEST_TIMEOUT);
    res.once("finish", function () {
        clearTimeout(req.__oms_timeout);
    });
    next();
});

app.use(cors({
    origin: true,
    credentials: true
}));

const server = app.listen(process.env.PORT, () => {
    let host, port;
    host = server.address().address;
    port = server.address().port;

    console.log('Acceleron Server listening on port '+port)
});

app.use('/', require('./routes'));
app.all('/*', function (req,res,next) {
    next(new ErrorResponse(ResponseType.NOT_FOUND,`Cannot ${req.method} ${req.originalUrl}`))
});
app.use(ACCELERONCORE._utils.ErrorResponse.errorHandler());



module.exports = app;