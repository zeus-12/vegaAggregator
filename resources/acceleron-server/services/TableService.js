"use strict";
let BaseService = ACCELERONCORE._services.BaseService;
let CommonModel = require('../models/CommonModel');
let TableModel = require('../models/TableModel');

var _ = require('underscore');
var async = require('async');

class TableService extends BaseService {
    constructor(request) {
        super(request);
        this.request = request;
        this.CommonModel = new CommonModel(request);
        this.TableModel = new TableModel(request);
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
        default:{
          return callback(new ErrorResponse(ResponseType.ERROR, ErrorType.server_cannot_handle_request), null);
        }
      }

      self.CommonModel.getDataByPath(path, function(error, result){
        if(error) {
            return callback(error, null)
        }
        else{
              if(filter_key == "all" || filter_key == "live"){ //Set of tables
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

}

module.exports = TableService;