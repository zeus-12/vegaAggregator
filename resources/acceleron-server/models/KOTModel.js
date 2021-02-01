"use strict";
let BaseModel = ACCELERONCORE._models.BaseModel;

var _ = require('underscore');

class KOTModel extends BaseModel{

    constructor(request) {
        super(request);
        this.couch = ACCELERONCORE._connectors.CouchDB;
    }

    getKOTById(kot_id, callback) {
        this.couch.get('/accelerate_kot/'+kot_id, function (err, data) {
            return callback(err, data);
        });
    }
}

module.exports = KOTModel;