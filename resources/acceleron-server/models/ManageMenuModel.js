"use strict";
let BaseModel = ACCELERONCORE._models.BaseModel;

var _ = require('underscore');

class ManageMenuModel extends BaseModel{

    constructor(request) {
        super(request);
        this.couch = ACCELERONCORE._connectors.CouchDBAsync;
    }

    async fetchAllMenuMappings() {
        const data = await this.couch.get('/accelerate_other_menu_mappings/_all_docs?include_docs=true').catch(error => {
            throw error;
        });
        return data;
        
    } 

    async createNewMappedMenu(menuData){
        const data = await this.couch.post('/accelerate_other_menu_mappings/', menuData).catch(error => {
            throw error;
        });

        return data;    
    }

    async getMappedMenu(menuTypeCode) {
        const data = await this.couch.get('/accelerate_other_menu_mappings/MENU_'+ menuTypeCode).catch(error => {
            throw error;
        });

        return data;
    }

    async updateMappedMenu( menuTypeCode, updateData) {
        const data = await this.couch.put('/accelerate_other_menu_mappings/MENU_'+ menuTypeCode, updateData).catch(error => {
            throw error;
        });

        return data;
    }

}

module.exports = ManageMenuModel;