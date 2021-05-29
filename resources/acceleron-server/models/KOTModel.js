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
    async updateKOTById(kotId, newKOTData){
        return new Promise((resolve, reject) => {
            this.couch.put('/accelerate_kot/'+kotId, newKOTData, function (err, data) {
            if(err){
                reject(new ErrorResponse(ResponseType.ERROR, ErrorType.something_went_wrong));
            }
            else{
                resolve("Updated Successfully");
            }
            });
        }); 
    }
}

module.exports = KOTModel;