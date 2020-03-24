"use strict";
let BaseController = ACCELERONCORE._controllers.BaseController;
let KOTService = require('../services/KOTService');

var _ = require('underscore');

class KOTController extends BaseController {

    constructor(request) {
        super(request);
        this.KOTService = new KOTService(request);
    }

    getKOTById(callback) {
        let self = this;
        var kot_id = self.request.params.id;

        if (_.isEmpty(kot_id)) {
            return callback(new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.missing_required_parameters));
        }

        self.KOTService.getKOTById(kot_id, function (error, result) {
            if(error){
                return callback(error, null);
            }
            else{
                return callback(null, result);
            }
        });
    }

    fetchKOTsByFilter(callback){
        let self = this;
        var filter_key = self.request.query.key;

        if (_.isEmpty(filter_key)) {
            return callback(new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.missing_required_parameters));
        }

        let ALLOWED_FILTER_KEYS = ['all', 'dine', 'nondine'];
        if(!ALLOWED_FILTER_KEYS.includes(filter_key)){
          return callback(new ErrorResponse(ResponseType.BAD_REQUEST, "Not a valid filter"))
        }

        self.KOTService.fetchKOTsByFilter(filter_key, function (error, result) {
            if(error){
                return callback(error, null);
            }
            else{
                return callback(null, result);
            }
        });
    }
}

module.exports = KOTController;