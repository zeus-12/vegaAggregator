"use strict";
let BaseModel = ACCELERONCORE._models.BaseModel;
var _ = require('underscore');

class BootstrapModel extends BaseModel{

    constructor(request) {
        super(request);
        this.couch = ACCELERONCORE._connectors.CouchDBAsync;
    }
    
    async fetchMenuMappingsBySource(source) {
        const menuTitle = "MENU_" +source
        const data = await this.couch.get('/accelerate_other_menu_mappings/'+menuTitle).catch(error => {
            throw error;
        });

        return data;
    } 
    async fetchAllMenuMappings() {
        const data = await this.couch.get('/accelerate_other_menu_mappings/_all_docs?include_docs=true').catch(error => {
            throw error;
        });
        return data;
        
    } 

}
module.exports = BootstrapModel;