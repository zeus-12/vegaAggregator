"use strict";
let BaseController = ACCELERONCORE._controllers.BaseController;
let TableService = require('../services/TableService');

var _ = require('underscore');

class TableController extends BaseController {

    constructor(request) {
        super(request);
        this.TableService = new TableService(request);
    }

    getTableById(callback) {
        let self = this;
        var table_id = self.request.params.id;

        if (_.isEmpty(table_id)) {
            return callback(new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.missing_required_parameters));
        }

        self.TableService.getTableById(table_id, function (error, result) {
            if(error){
                return callback(error, null);
            }
            else{
                return callback(null, result);
            }
        });
    }
    
    fetchTablesByFilter(callback){
        let self = this;
        var filter_key = self.request.query.key;
        var unique_id = self.request.query.uniqueId;

        if (_.isEmpty(filter_key)) {
            return callback(new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.missing_required_parameters));
        }

        let ALLOWED_FILTER_KEYS = ['all', 'live', 'name', 'section'];
        if(!ALLOWED_FILTER_KEYS.includes(filter_key)){
          return callback(new ErrorResponse(ResponseType.BAD_REQUEST, "Not a valid filter"))
        }

        //Validations
        switch(filter_key){
            case 'name':{
                if(_.isEmpty(unique_id)){
                    return callback(new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.invalid_data_format))
                }
                break;
            } 
        }

        self.TableService.fetchTablesByFilter(filter_key, unique_id, function (error, result) {
            if(error){
                return callback(error, null);
            }
            else{
                return callback(null, result);
            }
        });
    }

    resetTable(callback){
        let self = this;
        var table_id = self.request.params.id;   
        
        if (_.isEmpty(table_id)) {
            return callback(new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.missing_required_parameters));
        }  

        self.TableService.resetTable(table_id, function (error, result) {
            if(error){
                return callback(error, null);
            }
            else{
                return callback(null, result);
            }
        });   
    }

    addNewTableSection(callback) {
        let self = this;

        let new_entry = self.request.body;
        if (_.isEmpty(new_entry.section_name)) {
            return callback(new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.missing_required_parameters));
        }
        
        self.TableService.addNewTableSection(new_entry.section_name, function (error, result) {
            if(error){
                return callback(error, null);
            }
            else{
                return callback(null, result);
            }
        });
    }

    createNewTable(callback) {
        let self = this;

        let new_entry = self.request.body;
        if (_.isEmpty(new_entry.table) || _.isEmpty(new_entry.capacity) || _.isEmpty(new_entry.sortIndex) || _.isEmpty(new_entry.type)) {
            return callback(new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.missing_required_parameters));
        }
        
        //Complete table object
        new_entry._id = new_entry.sortIndex;
        new_entry.KOT = "";
        new_entry.status = 0;
        new_entry.lastUpdate = "";
        new_entry.assigned = "";
        new_entry.remarks = "";
        new_entry.guestName = ""; 
        new_entry.guestContact = ""; 
        new_entry.reservationMapping = ""; 
        new_entry.guestCount = "";
        new_entry.capacity = parseInt(new_entry.capacity);
        new_entry.sortIndex = parseInt(new_entry.sortIndex);

        if (isNaN(new_entry.capacity) || isNaN(new_entry.sortIndex)) {
            return callback(new ErrorResponse(ResponseType.BAD_REQUEST, "Capacity and Sort Index must be a number"));
        }

        self.TableService.createNewTable(new_entry, function (error, result) {
            if(error){
                return callback(error, null);
            }
            else{
                return callback(null, result);
            }
        });
    }

    deleteTableByName(callback){
        let self = this;
        let tableData = self.request.body;
        if (_.isEmpty(tableData.delete_table_name)) {
            return callback(new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.missing_required_parameters));
        }

        self.TableService.deleteTableByName(tableData.delete_table_name, function (error, result) {
            if(error){
                return callback(error, null);
            }
            else{
                return callback(null, result);
            }
        });        
    }

    deleteTableSection(callback){
        let self = this;
        let tableInfo = self.request.body;
        if (_.isEmpty(tableInfo.delete_section_name)) {
            return callback(new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.missing_required_parameters));
        }

        self.TableService.deleteTableSection(tableInfo.delete_section_name, function (error, result) {
            if(error){
                return callback(error, null);
            }
            else{
                return callback(null, result);
            }
        });         
    }
}

module.exports = TableController;