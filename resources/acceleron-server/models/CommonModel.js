"use strict";
let BaseModel = ACCELERONCORE._models.BaseModel;

var _ = require('underscore');

class CommonModel extends BaseModel{

    constructor(request) {
        super(request);
        this.couch = ACCELERONCORE._connectors.CouchDBAsync;
    }

    async getDataByPath(url) {
        const data = await this.couch.get(url).catch(error => {
            throw error;
        });

        return data;
    }
}

module.exports = CommonModel;