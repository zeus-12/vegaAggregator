"use strict";
let BaseModel = ACCELERONCORE._models.BaseModel;

var _ = require('underscore');

class TableModel extends BaseModel{

    constructor(request) {
        super(request);
        this.couch = ACCELERONCORE._connectors.CouchDBAsync;
    }

    async getTableById(table_id) {
        const data = await this.couch.get('/accelerate_tables/'+table_id).catch(error => {
            throw error;
        });

        return data;
    }

    async saveSingleTableData(table_id, tableData){
        const data = await this.couch.put('/accelerate_tables/'+table_id, tableData).catch(error => {
            throw error;
        });

        return data;    
    }

    async updateTable(table_id, new_table_data){
        const data = await this.couch.put('/accelerate_tables/'+table_id, new_table_data).catch(error => {
            throw error;
        });

        return data;
    }

    async createNewTable(tableData){
        const data = await this.couch.post('/accelerate_tables/', tableData).catch(error => {
            throw error;
        });

        return data;    
    }

    async deleteTable(tableId, tableRev, callback){
        const data = await this.couch.delete('/accelerate_tables/'+tableId+'?rev='+tableRev).catch(error => {
            throw error;
        });

        return data;       
    }
}

module.exports = TableModel;