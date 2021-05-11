"use strict";
let BaseModel = ACCELERONCORE._models.BaseModel;

var _ = require('underscore');

class TableModel extends BaseModel{

    constructor(request) {
        super(request);
        this.couch = ACCELERONCORE._connectors.CouchDB;
    }

    async getTableById(table_id, callback) {
        return new Promise((resolve, reject) => {
            this.couch.get('/accelerate_tables/'+table_id, function (err, data) {
            if(err){
                reject(new ErrorResponse(ResponseType.ERROR, ErrorType.something_went_wrong));
            }
            else{
                resolve(data);
            }
            });
        });
    }

    async saveSingleTableData(table_id, tableData){
        return new Promise((resolve, reject) => {
            this.couch.put('/accelerate_tables/'+table_id, tableData, function (err, data) {
            if(err){
                reject(new ErrorResponse(ResponseType.ERROR, ErrorType.something_went_wrong));
            }
            else{
                resolve("Updated Successfully");
            }
            });
        });      
    }

    async updateTable(table_id, new_table_data){
        return new Promise((resolve, reject) => {
            this.couch.put('/accelerate_tables/'+table_id, new_table_data, function (err, data) {
            if(err){
                reject(new ErrorResponse(ResponseType.ERROR, ErrorType.something_went_wrong));
            }
            else{
                resolve("Updated Successfully");
            }
            });
        }); 
    }

    async createNewTable(tableData){
        return new Promise((resolve, reject) => {
            this.couch.post('/accelerate_tables/', tableData, function (err, data) {
            if(err){
                reject(new ErrorResponse(ResponseType.ERROR, ErrorType.something_went_wrong));
            }
            else{
                resolve(data);
            }
            });
        });       
    }

    async deleteTable(tableId, tableRev, callback){
        return new Promise((resolve, reject) => {
            this.couch.delete('/accelerate_tables/'+tableId+'?rev='+tableRev, function (err, data) {
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

module.exports = TableModel;