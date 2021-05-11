"use strict";
let BaseModel = ACCELERONCORE._models.BaseModel;

var _ = require('underscore');

class SettingsModel extends BaseModel{

    constructor(request) {
        super(request);
        this.couch = ACCELERONCORE._connectors.CouchDBAsync;
    }
    
    async getSettingsById(settings_id) {
        const data = await this.couch.get('/accelerate_settings/'+settings_id).catch(error => {
            throw error;
        });

        return data;
    } 

    async updateNewSettingsData(settings_id, new_update_data) {
        const data = await this.couch.put('/accelerate_settings/'+settings_id, new_update_data).catch(error => {
            throw error;
        });
        
        return "Updated successfully";
    }
}

module.exports = SettingsModel;