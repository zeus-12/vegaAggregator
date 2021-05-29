"use strict";
let BaseModel = ACCELERONCORE._models.BaseModel;

var _ = require('underscore');

class MenuModel extends BaseModel{

    constructor(request) {
        super(request);
        this.couch = ACCELERONCORE._connectors.CouchDBAsync;
    }

    async getMenu() {
        const data = await this.couch.get('/accelerate_settings/ACCELERATE_MASTER_MENU').catch(error => {
            throw error;
        });

        return data;
    }

    async updateMenu(updateData) {
        const data = await this.couch.put('/accelerate_settings/ACCELERATE_MASTER_MENU', updateData).catch(error => {
            throw error;
        });

        return data;
    }

    async getCategoryList() {
        const data = await this.couch.get('/accelerate_settings/ACCELERATE_MENU_CATEGORIES').catch(error => {
            throw error;
        });

        return data;
    }

    async updateCategoryList(updateData) {
        const data = await this.couch.put('/accelerate_settings/ACCELERATE_MENU_CATEGORIES', updateData).catch(error => {
            throw error;
        });

        return data;
    }
}

module.exports = MenuModel;