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

    getTableById(table_id, callback) {
      let self = this;
      self.TableModel.getTableById(table_id, function(error, result){
        if(error) {
            return callback(error, null)
        }
        else{
            if(_.isEmpty(result)){
                return callback(new ErrorResponse(ResponseType.NO_RECORD_FOUND, ErrorType.no_matching_results), null);
            }
            else{
                return callback(null, result);
            }
        }
      })
    }    

    fetchTablesByFilter(filter_key, unique_id, callback) {
      let self = this;
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
          return callback(new ErrorResponse(ResponseType.ERROR, ErrorType.server_cannot_handle_request), null);
        }
      }

      self.CommonModel.getDataByPath(path, function(error, result){
        if(error) {
            return callback(error, null)
        }
        else{
              if(filter_key == "all" || filter_key == "live" || filter_key == "section"){ //Set of tables
                let tableList = result.rows;
                let responseList = [];
                for(var i = 0; i < tableList.length; i++){
                  responseList.push(tableList[i].value);
                }

                return callback(null, responseList);
              }
              else if(filter_key == "name"){ //Single table
                if(_.isEmpty(result)){
                  return callback(new ErrorResponse(ResponseType.NOT_FOUND, ErrorType.no_matching_results), null);
                }

                if(_.isEmpty(result.rows)){
                  return callback(new ErrorResponse(ResponseType.NO_RECORD_FOUND, ErrorType.no_matching_results), null);
                }
                else{
                  return callback(null, result.rows[0].value);
                }
              }
        }
      })
    }

    resetTable(table_id, callback){
      let self = this;
      self.getTableById(table_id, function(error, result){
        if(error) {
            return callback(error, null)
        }
        else{
            if(_.isEmpty(result)){
              return callback(new ErrorResponse(ResponseType.NO_RECORD_FOUND, ErrorType.no_matching_results), null);
            }
            else{
              var tableData = result;

              tableData.assigned = "";
              tableData.remarks = "";
              tableData.KOT = "";
              tableData.status = 0;
              tableData.lastUpdate = "";   
              tableData.guestName = ""; 
              tableData.guestContact = ""; 
              tableData.reservationMapping = ""; 
              tableData.guestCount = "";

              self.TableModel.saveSingleTableData(table_id, tableData, function(error, result){
                if(error) {
                    return callback(error, null)
                }
                else{
                    return callback(null, "Updated successfully");
                }
              })   

            }
        }
      })      
    }

    updateTable(table_id, newData, callback){
      let self = this;
      self.TableModel.updateTable(table_id, newData, function(error, result){
        if(error) {
            return callback(error, null)
        }
        else{
            return callback(null, "Updated successfully");
        }
      })   
    }

    addNewTableSection(sectionName, callback){
      let self = this;
      self.SettingsService.addNewEntryToSettings('ACCELERATE_TABLE_SECTIONS', {new_section_name : sectionName}, function(error, result){
        if(error){
          return callback(error, null)
        }
        else{
          return callback(null, "Section added successfully");
        }
      })
    }

    createNewTable(newTableData, callback){
      let self = this;

      self.fetchTablesByFilter('all', '', function(error, result){
        if(error) {
            return callback(error, null)
        }
        else{
            let tableData = result;
            let isDuplicate = false;
            for(var i = 0; i < tableData.length; i++){
              if (tableData[i].table == newTableData.table || tableData[i].sortIndex == newTableData.sortIndex){
                  isDuplicate = true;
                  break;
              }
            }

            if(isDuplicate){
              return callback(new ErrorResponse(ResponseType.CONFLICT, ErrorType.entry_already_exists), null);
            }

            self.TableModel.createNewTable(newTableData, function(error, result){
                if(error) {
                  return callback(error, null)
                }
                else{
                  return callback(null, result);
                }
            })
        }
      })
    }

    deleteTableByName(tableName, callback){
      let self = this;

      self.fetchTablesByFilter('name', tableName, function(error, result){
        if(error) {
            return callback(error, null)
        }
        else{
            let tableData = result;
            
            if(tableData.status != 0){
              return callback(new ErrorResponse(ResponseType.CONFLICT, 'Table '+tableName+' is not free, can not be deleted'), null);
            }

            self.TableModel.deleteTable(tableData._id, tableData._rev, function(error, result){
                if(error) {
                  return callback(error, null)
                }
                else{
                  return callback(null, "Table "+tableName+" has been deleted");
                }
            })
        }
      })      
    }

    deleteTableSection(sectionName, finalCallback){
      let self = this;
      self.fetchTablesByFilter('section', sectionName, function(error, result){
        if(error) {
            return finalCallback(error, null)
        }
        else{
            let tableData = result;
            let isAllFree = true;
            for(var i = 0; i < tableData.length; i++){ //validate if all tables are free
              if(tableData[i].status != 0){
                isAllFree = false;
                break;
              }
            }

            if(!isAllFree){
              return finalCallback(new ErrorResponse(ResponseType.CONFLICT, 'All the tables are not free, section can not be deleted'), null);
            }

            async.series([
              deleteTables,
              deleteSection
            ], function(err, res) {
                if(err){
                  return finalCallback(err, null)
                }
                else {
                  return finalCallback(null, 'Deleted successfully')               
                }
            });

            function deleteTables(callback){
              if(_.isEmpty(tableData)){
                return callback(null, "Deleted successfully");
              }

              async.eachSeries(tableData, function (sectionTable, loopCallback) {
                  self.TableModel.deleteTable(sectionTable._id, sectionTable._rev, function(err, deleteResponse){
                      if(err){
                          return loopCallback(null, "failed")
                      }
                      else{
                          return loopCallback(null, "succeeded")
                      }
                  })
              }, 
              function (err) {
                  if(err){
                    callback(new ErrorResponse(ResponseType.ERROR, "Error while deleting tables in "+sectionName), null);
                  }
                  return callback(null, "Deleted successfully");
              });
            }

            function deleteSection(callback){
              self.SettingsService.removeEntryFromSettings('ACCELERATE_TABLE_SECTIONS', {section_name : sectionName}, function(error, result){
                  if(error) {
                    return callback(error, null)
                  }
                  else{
                    return callback(null, "Deleted successfully");
                  }
              })     
            }
        }

      })       
    }

}

module.exports = TableService;