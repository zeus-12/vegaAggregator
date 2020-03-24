"use strict";
let BaseModel = ACCELERONCORE._models.BaseModel;

var _ = require('underscore');

class TableModel extends BaseModel{

    constructor(request) {
        super(request);
        this.couch = ACCELERONCORE._connectors.CouchDB;
    }

    getTableById(table_id, callback) {
        this.couch.get('/accelerate_tables/'+table_id, function (err, data) {
            return callback(err, data);
        });
    }

    saveSingleTableData(table_id, tableData, callback){
        this.couch.put('/accelerate_tables/'+table_id, tableData, function (err, data) {
            return callback(err, data);
        });        
    }

    updateTable(table_id, new_table_data, callback){
        this.couch.put('/accelerate_tables/'+table_id, new_table_data, function (err, data) {
            return callback(err, data);
        });
    }
}

module.exports = TableModel;