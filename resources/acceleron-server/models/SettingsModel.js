"use strict";
let BaseModel = ACCELERONCORE._models.BaseModel;

var _ = require('underscore');

class SettingsModel extends BaseModel{

    constructor(request) {
        super(request);
        this.couch = ACCELERONCORE._connectors.CouchDB;
    }

    async getSettingsById(settings_id) {
        return new Promise((resolve, reject) => {
            this.couch.get('/accelerate_settings/'+settings_id, function (err, data) {
            if(err){
                reject(new ErrorResponse(ResponseType.ERROR, ErrorType.something_went_wrong));
            }
            else{
                resolve(data);
            }
            });
        });
    }

    async updateNewSettingsData(settings_id, new_update_data) {
        return new Promise((resolve, reject) => {
            this.couch.put('/accelerate_settings/'+settings_id, new_update_data, function (err, data) {
            if(err){
                reject(new ErrorResponse(ResponseType.ERROR, ErrorType.something_went_wrong));
            }
            else{
                resolve("Updated successfully");
            }
            });
        });
    }
}

module.exports = SettingsModel;