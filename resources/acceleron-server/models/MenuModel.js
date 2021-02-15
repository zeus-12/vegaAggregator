"use strict";
let BaseModel = ACCELERONCORE._models.BaseModel;

var _ = require('underscore');

class MenuModel extends BaseModel{

    constructor(request) {
        super(request);
        this.couch = ACCELERONCORE._connectors.CouchDB;
    }

    async getMenu() {
        return new Promise((resolve, reject) => {
            this.couch.get('/accelerate_settings/ACCELERATE_MASTER_MENU', function (err, data) {
            if(err){
                reject(new ErrorResponse(ResponseType.ERROR, ErrorType.something_went_wrong));
            }
            else{
                resolve(data);
            }
            });
        });
    }

    async updateMenu(updateData) {
        return new Promise((resolve, reject) => {
        this.couch.put('/accelerate_settings/ACCELERATE_MASTER_MENU', updateData, function (err, data) {
            if(err){
                reject(new ErrorResponse(ResponseType.ERROR, ErrorType.something_went_wrong));
            }
            else{
                resolve("Updated successfully");
            }
        });
    });
    }

    async getCategoryList() {
        return new Promise((resolve, reject) => {
        this.couch.get('/accelerate_settings/ACCELERATE_MENU_CATEGORIES', function (err, data) {
            if(err){
                reject(new ErrorResponse(ResponseType.ERROR, ErrorType.something_went_wrong));
            }
            else{
                resolve(data);
            }
        });
    });
    }

    async updateCategoryList(updateData) {
        return new Promise((resolve, reject) => {
        this.couch.put('/accelerate_settings/ACCELERATE_MENU_CATEGORIES', updateData, function (err, data) {
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

module.exports = MenuModel;