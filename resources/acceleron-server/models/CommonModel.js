"use strict";
let BaseModel = ACCELERONCORE._models.BaseModel;

var _ = require('underscore');

class CommonModel extends BaseModel{

    constructor(request) {
        super(request);
        this.couch = ACCELERONCORE._connectors.CouchDB;
    }

    async getDataByPath(url) {
        return new Promise((resolve, reject) => {
            this.couch.get(url, function (err, data) {
            if(err){
                reject(new ErrorResponse(ResponseType.ERROR, ErrorType.something_went_wrong));
            }
            else{
                resolve(data);
            }
            });
        });
    }
}

module.exports = CommonModel;