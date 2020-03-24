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

        let ALLOWED_FILTER_KEYS = ['all', 'live', 'name'];
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
}

module.exports = TableController;