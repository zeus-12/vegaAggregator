"use strict";
let BaseModel = ACCELERONCORE._models.BaseModel;

var _ = require('underscore');

class SettingsModel extends BaseModel{

    constructor(request) {
        super(request);
        this.couch = ACCELERONCORE._connectors.CouchDB;
    }

    getSettingsById(settings_id, callback) {
        this.couch.get('/accelerate_settings/'+settings_id, function (err, data) {
            return callback(err, data);
        });
    }
}

module.exports = SettingsModel;