"use strict";
let express = require("express");
let Router = express.Router;

class BaseRouter extends Router {
    constructor(options) {
        super(options);
        this.use(function (req,res,next) {
            next();
        })
    }
}

module.exports = BaseRouter;