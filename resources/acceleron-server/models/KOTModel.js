"use strict";
let BaseModel = ACCELERONCORE._models.BaseModel;

var _ = require('underscore');

class KOTModel extends BaseModel{

    constructor(request) {
        super(request);
        this.couch = ACCELERONCORE._connectors.CouchDBAsync;
    }

    async getKOTById(kot_id) {
        const data = await this.couch.get('/accelerate_kot/'+kot_id).catch(error => {
            throw error;
        });

        return data;
    }
}

module.exports = KOTModel;