"use strict";
let BaseService = ACCELERONCORE._services.BaseService;
let CommonModel = require('../models/CommonModel');
let TableModel = require('../models/TableModel');
let CommonService = require('./CommonService');
let SettingsService = require('./SettingsService');

var _ = require('underscore');
var async = require('async');

class TableService extends BaseService {
    constructor(request) {
        super(request);
        this.request = request;
        this.CommonModel = new CommonModel(request);
        this.TableModel = new TableModel(request);
        this.CommonService = new CommonService(request);
        this.SettingsService = new SettingsService(request);
    }

    async getTableById(table_id) {
      const data = await this.TableModel.getTableById(table_id).catch(error => {
        throw error
      });

      if(_.isEmpty(data)){
        throw new ErrorResponse(ResponseType.NO_RECORD_FOUND, ErrorType.no_matching_results);
      }
      else{
        return data; 
      }
    }   

    async fetchTablesByFilter(filter_key, unique_id) {

      let path = '';

      switch(filter_key){
        case 'all':{
          path = '/accelerate_tables/_design/filter-tables/_view/all';
          break;
        }
        case 'live':{
          path = '/accelerate_tables/_design/filter-tables/_view/filterbylive';
          break;
        }
        case 'name':{
          path = '/accelerate_tables/_design/filter-tables/_view/filterbyname?startkey=["'+unique_id+'"]&endkey=["'+unique_id+'"]';
          break;
        }
        case 'section':{
          path = '/accelerate_tables/_design/filter-tables/_view/filterbysection?startkey=["'+unique_id+'"]&endkey=["'+unique_id+'"]';
          break;
        }
        default:{
          throw new ErrorResponse(ResponseType.ERROR, ErrorType.server_cannot_handle_request);
        }
      }

      const result = await this.CommonModel.getDataByPath(path).catch(error => {
        throw error
      });

      if(filter_key == "all" || filter_key == "live" || filter_key == "section"){ //Set of tables
        let tableList = result.rows;
        let responseList = [];
        for(var i = 0; i < tableList.length; i++){
          responseList.push(tableList[i].value);
        }
        return responseList;
      }
      else if(filter_key == "name"){ //Single table
        if(_.isEmpty(result)){
          throw new ErrorResponse(ResponseType.NO_RECORD_FOUND, ErrorType.no_matching_results);
        }

        if(_.isEmpty(result.rows)){
          throw new ErrorResponse(ResponseType.NO_RECORD_FOUND, ErrorType.no_matching_results);
        }
        else{
          return result.rows[0].value;
        }
      }
    }

    async resetTable(table_id){

      var tableData = await this.getTableById(table_id).catch(error => {
        throw error
      });
      tableData.assigned = "";
      tableData.remarks = "";
      tableData.KOT = "";
      tableData.status = 0;
      tableData.lastUpdate = "";   
      tableData.guestName = ""; 
      tableData.guestContact = ""; 
      tableData.reservationMapping = ""; 
      tableData.guestCount = "";            
    return await this.TableModel.saveSingleTableData(table_id, tableData).catch(error => {
      throw error
    });            
      
    }

    async updateTable(table_id, newData){
      return await this.TableModel.updateTable(table_id, newData).catch(error => {
        throw error
      });   
    }

    async addNewTableSection(sectionName){
      return await this.SettingsService.addNewEntryToSettings('ACCELERATE_TABLE_SECTIONS', {new_section_name : sectionName}).catch(error => {
        throw error
      }); 
    }

    async createNewTable(newTableData){
      const tableData = await this.fetchTablesByFilter('all', '').catch(error => {
        throw error
      }); 

      let isDuplicate = false; 
      for(var i = 0; i < tableData.length; i++){
        if (tableData[i].table == newTableData.table || tableData[i].sortIndex == newTableData.sortIndex){
            isDuplicate = true;
            break;
        }
      }          
      if(isDuplicate){
        throw new ErrorResponse(ResponseType.CONFLICT, ErrorType.entry_already_exists);
      }
      return await this.TableModel.createNewTable(newTableData).catch(error => {
        throw error
      });  
    }

    async deleteTableByName(tableName){

      const tableData = await this.fetchTablesByFilter('name', tableName).catch(error => {
        throw error
      });

      if(tableData.status != 0){
        throw new ErrorResponse(ResponseType.CONFLICT, 'Table '+tableName+' is not free, can not be deleted');
      }
      await this.TableModel.deleteTable(tableData._id, tableData._rev).catch(error => {
        throw error
      }); 
      return "Table "+tableName+" has been deleted";      
    }

    async deleteTableSection(sectionName){
      const tableData = await this.fetchTablesByFilter('section', sectionName).catch(error => {
        throw error
      });
      let isAllFree = true;
      for(var i = 0; i < tableData.length; i++){ //validate if all tables are free
        if(tableData[i].status != 0){
          isAllFree = false;
          break;
        }
      }
      if(!isAllFree){
        throw new ErrorResponse(ResponseType.CONFLICT, ErrorType.all_tables_not_free);
      }  
      if(_.isEmpty(tableData)){
        return "Deleted successfully";
      }  
      for(var i = 0; i < tableData.length; i++){ 
        var sectionTable = tableData[i]
        await this.TableModel.deleteTable(sectionTable._id, sectionTable._rev).catch(error => {
          throw new ErrorResponse(ResponseType.ERROR, "Error while deleting tables in "+sectionName);
        });
      }
      
      await this.SettingsService.removeEntryFromSettings('ACCELERATE_TABLE_SECTIONS', {section_name : sectionName}).catch(error => {
        throw error
      });

      return "Deleted successfully";
      
    }

}

module.exports = TableService;