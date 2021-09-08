"use strict";
let BaseModel = ACCELERONCORE._models.BaseModel;

var _ = require('underscore');

class KOTModel extends BaseModel{

    constructor(request) {
        super(request);
        this.couch = ACCELERONCORE._connectors.CouchDBAsync;
    }

    async getKOTById(kot_id) {
        return await this.couch.get('/accelerate_kot/'+kot_id).catch(error => {
            throw error;
        });
    }
    async updateKOTById(kotId, newKOTData){
        return await this.couch.put('/accelerate_kot/'+kotId, newKOTData).catch(error => {
            throw new ErrorResponse(ResponseType.ERROR, ErrorType.something_went_wrong);
        });
    }
}

module.exports = KOTModel;