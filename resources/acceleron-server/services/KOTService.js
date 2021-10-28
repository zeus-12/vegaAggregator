"use strict";
let BaseService = ACCELERONCORE._services.BaseService;
let CommonModel = require('../models/CommonModel');
let KOTModel = require('../models/KOTModel');
let SettingsService = require('./SettingsService');
let TableService = require('./TableService');

var _ = require('underscore');
var async = require('async');

class KOTService extends BaseService {
    constructor(request) {
        super(request);
        this.request = request;
        this.CommonModel = new CommonModel(request);
        this.KOTModel = new KOTModel(request);
        this.SettingsService = new SettingsService(request);
        this.TableService = new TableService(request);
    }

    async getKOTById(kot_id) {
      const data = await this.KOTModel.getKOTById(kot_id).catch(error => {
        throw error
      });
      if(_.isEmpty(data)){
        throw new ErrorResponse(ResponseType.NO_RECORD_FOUND, ErrorType.no_matching_results);
      }
      return data;
    }    

    async fetchKOTsByFilter(filter_key) {

      let path = '';

      switch(filter_key){
        case 'all':{
          path = '/accelerate_kot/_design/kot-fetch/_view/fetchall';
          break;
        }
        case 'dine':{
          path = '/accelerate_kot/_design/table-mapping/_view/fetchdineorders';
          break;
        }
        case 'nondine':{
          path = '/accelerate_kot/_design/table-mapping/_view/fetchnondineorders';
          break;
        }
        default:{
          throw new ErrorResponse(ResponseType.ERROR, ErrorType.server_cannot_handle_request);
        }
      }

      const result = await this.CommonModel.getDataByPath(path).catch(error => {
        throw error
      });
      var kotList = result.rows;
      var responseList = [];
      for(var i = 0; i < kotList.length; i++){
        responseList.push(kotList[i].key);
      }
      return responseList;
    }

    async tableTransferKOT(kotId, newTableNumber) {
      var kotData = await this.getKOTById(kotId).catch(error => {
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
      await this.KOTModel.updateKOTById(kotId, kotData).catch(error => {
        throw error
      });

      //Updating Old Table
      var tableData = await this.TableService.fetchTablesByFilter('name', oldTableNumber).catch(error => {
        throw error
      });
      tableData.status = 0;
      tableData.assigned = "";
      tableData.remarks = "";
      tableData.KOT = "";
      tableData.lastUpdate = "";
      tableData.guestName = ""; 
      tableData.guestContact = ""; 
      tableData.reservationMapping = "";
      tableData.guestCount = "";
      await this.TableService.updateTable(oldTableNumber, tableData).catch(error => {
        throw error
      });

      //Updating New Table
      var newTableData = await this.TableService.fetchTablesByFilter('name', newTableNumber).catch(error => {
        throw error
      });
      newTableData.status = 1;
      newTableData.assigned = kotData.stewardName;
      newTableData.remarks = kotData.remarks;
      newTableData.KOT = kotData.KOTNumber;
      newTableData.lastUpdate = (kotData.timeKOT != "" ? kotData.timeKOT : kotData.timePunch);;
      newTableData.guestName = kotData.guestName; 
      newTableData.guestContact = kotData.guestContact; 
      newTableData.reservationMapping = kotData.reservationMapping;
      newTableData.guestCount = kotData.guestCount;
      var result = await this.TableService.updateTable(newTableNumber, newTableData).catch(error => {
        throw error
      });

      return result

    }

}

module.exports = KOTService;