"use strict";
let BaseService = ACCELERONCORE._services.BaseService;
let CommonModel = require('../models/CommonModel');
let TableModel = require('../models/TableModel');
let SettingsService = require('./SettingsService');
let KOTService = require('./KOTService');
let TimeUtils = require("../utils/TimeUtils");

var _ = require('underscore');
var async = require('async');

class TableService extends BaseService {
    constructor(request) {
        super(request);
        this.request = request;
        this.CommonModel = new CommonModel(request);
        this.TableModel = new TableModel(request);
        this.SettingsService = new SettingsService(request);
        this.KOTService = new KOTService(request);
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
        case 'kot':{
          path = '/accelerate_tables/_design/filter-tables/_view/filterbyKOT?startkey=["'+unique_id+'"]&endkey=["'+unique_id+'"]';
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
      else if(filter_key == "kot"){ //Single table
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

    async setTableFree(table_id){
        try {
          await this.resetTable(table_id);
          return true;
        } catch (error) {
          return false;
        }
    }

    async updateTableByFilter(filter_key, unique_id, updateData){
      const tableData = await this.fetchTablesByFilter(filter_key, unique_id).catch(error => {
        throw error
    });
    var newData = {...tableData, ...updateData}
      return await this.TableModel.updateTable(tableData.table, newData).catch(error => {
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
    
    async tableTransferKOT(kotId, newTableNumber) {
      var kotData = await this.KOTService.getKOTById(kotId).catch(error => {
        throw error
      });

      if(kotData.table == newTableNumber){ //same table
        throw new ErrorResponse(ResponseType.CONFLICT, ErrorType.same_table);
      }

      if(kotData.orderDetails.modeType != 'DINE'){
        throw new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.order_not_dine);
      }

      var oldTableNumber = kotData.table
      kotData.table = newTableNumber

      await this.KOTService.updateKOTById(kotId, kotData).catch(error => {
        throw error
      });

      //Updating Old Table
      var updateData = {
        "remarks" : "",
        "assigned" : "",
        "KOT" : "",
        "status" : 0,
        "lastUpdate" : "",   
        "guestName" : "", 
        "guestContact" : "", 
        "reservationMapping" : "", 
        "guestCount" : ""
    }


      await this.updateTableByFilter('name', oldTableNumber, updateData).catch(error => {
        throw error
      });

      //Updating New Table
      var newUpdateData = {
        "status" : 1,
        "assigned" : kotData.stewardName,
        "remarks" : kotData.remarks,
        "KOT" : kotData.KOTNumber,
        "lastUpdate" : kotData.timeKOT != "" ? kotData.timeKOT : kotData.timePunch,   
        "guestName" : kotData.guestName, 
        "guestContact" : kotData.guestContact, 
        "reservationMapping" : kotData.reservationMapping, 
        "guestCount" : kotData.guestCount
      }

      var result = await this.updateTableByFilter('name', newTableNumber, newUpdateData).catch(error => {
        throw error
      });

      return result

    }

    async mergeKOT(branch, finalTable, mergeTableList){
      const tableData = await this.fetchTablesByFilter("live","").catch(error => {
        throw error
      });

      var KOTList = []
      var finalKOT = ""

      for (var i =0; i < mergeTableList.length; i++){
        var m = 0;
        while(m < tableData.length){
          if(mergeTableList[i] == tableData[m].table){
            KOTList.push(tableData[m].KOT);
            
            if( mergeTableList[i] == finalTable){
              finalKOT = tableData[m].KOT
            }
            else{
              await this.resetTable(mergeTableList[i]).catch(error => {
                throw error
              });
            }
            break;
          }
          m++;
        }		              	
      }
      var mergedCart = [];
      var mergedExtras = [];
      var kotCount = KOTList.length;
      var kotCounter = 0;

      var mergingBillingMode = '';
      var freshCartIndices = 1;

      while (kotCounter < kotCount) {
        var kotId = branch +"_KOT_"+ KOTList[kotCounter];
        var kotfile = await this.KOTService.getKOTById(kotId).catch(error => {
          throw error
        });

        if(kotfile.KOTNumber != finalKOT){
          await this.KOTService.deleteKOTById(kotId).catch(error => {
            throw error
          });
        }

        if(mergingBillingMode == ''){
          mergingBillingMode = kotfile.orderDetails.mode;
        }
        else{
          if(mergingBillingMode != kotfile.orderDetails.mode){
            //Suspend Merge
            throw new ErrorResponse(ResponseType.CONFLICT, 'Operation Aborted! Orders have to be billed under same mode', '#e74c3c');
          }
        }

        kotCounter++;

        /*Generate MERGED EXTRAS*/
        var extraDuplicateFlag = false;
        for (var g = 0; g < kotfile.extras.length; g++) {

          var t = 0;
          extraDuplicateFlag = false;

          while (mergedExtras[t]) {
            if (mergedExtras[t].name == kotfile.extras[g].name) {
              mergedExtras[t].amount = mergedExtras[t].amount + kotfile.extras[g].amount;
              extraDuplicateFlag = true;
              break;
            }
            t++
          }

          if (!extraDuplicateFlag) { //No duplicate, push the extra wholely.
            mergedExtras.push(kotfile.extras[g]);
          }        
        }

        /*Generate MERGED CART*/
        var itemDuplicateFlag = false;
        for (var f = 0; f < kotfile.cart.length; f++) {
          var m = 0;
          itemDuplicateFlag = false;
  
          if (kotfile.cart[f].isCustom) {
            while (mergedCart[m]) {
              if (mergedCart[m].code == kotfile.cart[f].code && mergedCart[m].variant == kotfile.cart[f].variant) {
                mergedCart[m].qty += kotfile.cart[f].qty;
                itemDuplicateFlag = true;
                break;
              }
              m++
            }
          } 
          else {
            while (mergedCart[m]) {
              if (mergedCart[m].code == kotfile.cart[f].code) {
                mergedCart[m].qty += kotfile.cart[f].qty;
                itemDuplicateFlag = true;
                break;
              }
              m++
            }        
          }
  
          if (!itemDuplicateFlag) { //No duplicate, push the item wholely.
            kotfile.cart[f].cartIndex = freshCartIndices;
            mergedCart.push(kotfile.cart[f]);
            freshCartIndices++;
          }          
        }

      }

      var kotId = branch +"_KOT_"+ finalKOT;
      var updateData = {}
      if(mergedCart && mergedCart.length > 0){
        updateData.cart = mergedCart;
        updateData.discount = {};
        updateData.customExtras = {};
        updateData.extras = mergedExtras;
      }

      return await this.KOTService.updateKOTById(kotId, updateData).catch(error => {
        throw error
      });

    }

    async updateTableAsBilled(tableNumber, updateData) {
      try {
        let tableData = await this.fetchTablesByFilter("name", tableNumber);
        tableData.remarks = updateData.payableAmount;
        tableData.KOT = updateData.billNumber;
        tableData.status = 2;
        tableData.lastUpdate = TimeUtils.getCurrentTimestamp();

        await this.updateTableByFilter("name", tableNumber, tableData);
        return true;
      }
      catch (error) {
        return false;
      }
  }

}

module.exports = TableService;