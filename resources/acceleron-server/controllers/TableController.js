"use strict";
let BaseController = ACCELERONCORE._controllers.BaseController;
let TableService = require('../services/TableService');

var _ = require('underscore');

class TableController extends BaseController {

    constructor(request) {
        super(request);
        this.TableService = new TableService(request);
    }

    async getTableById() {
        var table_id = this.request.params.id;

        if (_.isEmpty(table_id)) {
            throw new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.table_id_is_empty_or_invalid)
        }

        return await this.TableService.getTableById(table_id).catch(error => {
            throw error
          });
    }
    
    async fetchTablesByFilter(){
        var filter_key = this.request.query.key;
        var unique_id = this.request.query.uniqueId;

        if (_.isEmpty(filter_key)) {
            throw new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.filter_key_is_empty_or_invalid)
        }

        let ALLOWED_FILTER_KEYS = ['all', 'live', 'name', 'section', 'kot'];
        if(!ALLOWED_FILTER_KEYS.includes(filter_key)){
            throw new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.invalid_filter)
        }

        //Validations
        switch(filter_key){
            case 'name':{
                if(_.isEmpty(unique_id)){
                    throw new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.unique_id_is_empty_or_invalid)
                }
                break;
            } 
            case 'kot':{
                if(_.isEmpty(unique_id)){
                    throw new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.unique_id_is_empty_or_invalid)
                }
                break;
            } 
        }
        return await this.TableService.fetchTablesByFilter(filter_key, unique_id).catch(error => {
            throw error
          });
    }

    async updateTableByFilter(){
        var filter_key = this.request.query.key;
        var unique_id = this.request.query.uniqueId;
        var updateData = this.request.body;

        if (_.isEmpty(filter_key)) {
            throw new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.filter_key_is_empty_or_invalid)
        }

        let ALLOWED_FILTER_KEYS = [ 'name', 'kot'];
        if(!ALLOWED_FILTER_KEYS.includes(filter_key)){
            throw new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.invalid_filter)
        }

        //Validations
        switch(filter_key){
            case 'name':{
                if(_.isEmpty(unique_id)){
                    throw new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.unique_id_is_empty_or_invalid)
                }
                break;
            } 
            case 'kot':{
                if(_.isEmpty(unique_id)){
                    throw new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.unique_id_is_empty_or_invalid)
                }
                break;
            } 
        }
        return await this.TableService.updateTableByFilter(filter_key, unique_id, updateData).catch(error => {
            throw error
          });
    }

    async resetTable(){
        var table_id = this.request.params.id;   
        
        if (_.isEmpty(table_id)) {
            throw new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.table_id_is_empty_or_invalid)
        } 
        return await this.TableService.resetTable(table_id).catch(error => {
            throw error
          });   
    }

    async addNewTableSection() {

        var sectionName = this.request.body.section_name;
        if (_.isEmpty(sectionName)) {
            throw new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.section_name_empty_or_invalid)
        }
        return await this.TableService.addNewTableSection(sectionName).catch(error => {
            throw error
          }); 
    }

    async createNewTable() {

        var new_entry = this.request.body;
        if (_.isEmpty(new_entry.table)) {
            throw new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.table_empty_or_invalid)
        }
        if (_.isEmpty(new_entry.capacity)) {
            throw new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.capacity_empty_or_invalid)
        }
        if ( _.isEmpty(new_entry.sortIndex)) {
            throw new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.sort_index_empty_or_invalid)
        }
        if ( _.isEmpty(new_entry.type)) {
            throw new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.type_empty_or_invalid)
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

        if (isNaN(new_entry.capacity)) {
            throw new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.capacity_must_be_a_number)
        }
        if (isNaN(new_entry.sortIndex)) {
            throw new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.sort_index_must_be_a_number)
        }

        return await this.TableService.createNewTable(new_entry).catch(error => {
            throw error
          }); 

    }

    async deleteTableByName(){

        var tableName = this.request.body.delete_table_name;
        if (_.isEmpty(tableName)) {
            throw new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.table_name_empty_or_invalid)
        }

        return await this.TableService.deleteTableByName(tableName).catch(error => {
            throw error
          });      
    }

    async deleteTableSection(){

        let sectionName = this.request.body.delete_section_name;
        if (_.isEmpty(sectionName)) {
            throw new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.section_name_empty_or_invalid)
        }

        return await this.TableService.deleteTableSection(sectionName).catch(error => {
            throw error
          });         
    }

    async tableTransferKOT() {
        const kotId = this.request.query.kotId;
        const newTableNumber = this.request.query.tableNumber;
        if(_.isEmpty(kotId)){
          throw new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.category_name_is_empty_or_invalid)
        }
        if( _.isEmpty(newTableNumber) ){
          throw new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.item_code_is_empty_or_invalid)
        }
  
        return await this.TableService.tableTransferKOT(kotId, newTableNumber)
        .catch(error => {
            throw error
          });
      }

    async mergeKOT(){
        var branch = this.request.body.accelerateLicenceeBranch
        var finalTable = this.request.body.tableName
        var mergeTableList = this.request.body.tableList

        if (_.isEmpty(finalTable)) {
            throw new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.table_name_empty_or_invalid)
        }
        for( var i=0; i<mergeTableList.length; i++){
            if (_.isEmpty(mergeTableList[i])) {
                throw new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.table_name_empty_or_invalid)
            }
        }

        return await this.TableService.mergeKOT(branch, finalTable, mergeTableList).catch(error => {
            throw error
          });

    }

}

module.exports = TableController;