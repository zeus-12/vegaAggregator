"use strict";
let BaseService = ACCELERONCORE._services.BaseService;
let CommonModel = require('../models/CommonModel');
let KOTModel = require('../models/KOTModel');

var _ = require('underscore');
var async = require('async');

class KOTService extends BaseService {
    constructor(request) {
        super(request);
        this.request = request;
        this.CommonModel = new CommonModel(request);
        this.KOTModel = new KOTModel(request);
    }

    getKOTById(kot_id, callback) {
      let self = this;
      self.KOTModel.getTableById(kot_id, function(error, result){
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

    fetchKOTsByFilter(filter_key, callback) {
      let self = this;
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
        default:{
          return callback(new ErrorResponse(ResponseType.ERROR, ErrorType.server_cannot_handle_request), null);
        }
      }

      self.CommonModel.getDataByPath(path, function(error, result){
        if(error) {
            return callback(error, null)
        }
        else{
            let kotList = result.rows;
            let responseList = [];
            for(var i = 0; i < kotList.length; i++){
              responseList.push(kotList[i].value);
            }

            return callback(null, responseList);
        }
      })
    }

}

module.exports = KOTService;