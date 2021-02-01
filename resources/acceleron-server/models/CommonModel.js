"use strict";
let BaseModel = ACCELERONCORE._models.BaseModel;

var _ = require('underscore');

class CommonModel extends BaseModel{

    constructor(request) {
        super(request);
        this.couch = ACCELERONCORE._connectors.CouchDB;
    }

    getDataByPath(url, callback) {
        this.couch.get(url, function (err, data) {
            return callback(err, data);
        });
    }
}

module.exports = CommonModel;