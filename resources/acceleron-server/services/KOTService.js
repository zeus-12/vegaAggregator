"use strict";
let BaseService = ACCELERONCORE._services.BaseService;
let CommonModel = require('../models/CommonModel');
let KOTModel = require('../models/KOTModel');
let SettingsService = require('./SettingsService');

var _ = require('underscore');
var async = require('async');

class KOTService extends BaseService {
    constructor(request) {
        super(request);
        this.request = request;
        this.CommonModel = new CommonModel(request);
        this.KOTModel = new KOTModel(request);
        this.SettingsService = new SettingsService(request);
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
        responseList.push(kotList[i].value);
      }
      return responseList;
    }

}

module.exports = KOTService;