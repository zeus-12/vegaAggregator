"use strict";
let BaseController = ACCELERONCORE._controllers.BaseController;
let SummaryService = require('../services/SummaryService');
var _ = require('underscore');
var moment = require('moment');

class SummaryController extends BaseController {

    constructor(request) {
        super(request);
        this.SummaryService = new SummaryService(request);
    }


async fetchSummaryByBillingMode(){

        let self = this;
        var from_date = self.request.query.startdate;
        var to_date = self.request.query.enddate;
        var curr_date = moment().format('YYYYMMDD');
        var billingModes = [];
        var SELECTED_INVOICE_SOURCE_DB = 'accelerate_invoices';

        if (_.isEmpty(from_date) || _.isEmpty(to_date)) {
            throw new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.missing_required_parameters);
        }
        if (from_date > to_date){
            throw new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.from_date_should_be_greater_than_to_date);            
        }

        try {
            const data = await self.SummaryService.getAllBillingModes();
            billingModes = data.value;
        } catch (error) {
            throw error;
        };

        try {
            const data = await self.SummaryService.fetchSummaryByBillingMode(SELECTED_INVOICE_SOURCE_DB, billingModes, from_date, to_date, curr_date);
            return data;
        } catch (error) {
            throw error; 
        }
    
}

async  fetchSummaryByBillingAndPaymentMode(){

        let self = this;
        var from_date = self.request.query.startdate;
        var to_date = self.request.query.enddate;
        var billing_mode = self.request.query.billingmode;
        var paymentModes = [];
        var SELECTED_INVOICE_SOURCE_DB = 'accelerate_invoices';
        var ALLOWED_BILLING_MODES = [];

        if (_.isEmpty(from_date) || _.isEmpty(to_date) || _.isEmpty(billing_mode)) {
            throw new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.missing_required_parameters);
        }

        if (from_date > to_date){
            throw new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.from_date_should_be_greater_than_to_date);            
        }

        try {
            const data = await self.SummaryService.getAllBillingModes();
            for(var i = 0; i < data.value.length; i++){
                ALLOWED_BILLING_MODES = [...ALLOWED_BILLING_MODES, data.value[i].name];
            }
        } catch (error) {
            throw error;
        };

        if(!ALLOWED_BILLING_MODES.includes(billing_mode)){
            throw new ErrorResponse(ResponseType.BAD_REQUEST, "Not a valid billing mode");
        }

        try {
            const data = await self.SummaryService.getAllPaymentModes();
            paymentModes = data.value;
        } catch (error) {
            throw error;
        };

        try {
            const data = await self.SummaryService.fetchSummaryByBillingAndPaymentMode(SELECTED_INVOICE_SOURCE_DB, paymentModes, from_date, to_date, billing_mode);
            return data;
        } catch (error) {
            throw error; 
        }

    }

async fetchSummaryByPaymentMode(){

        let self = this;
        var from_date = self.request.query.startdate;
        var to_date = self.request.query.enddate;
        var paymentModes = [];
        var SELECTED_INVOICE_SOURCE_DB = 'accelerate_invoices';

        if (_.isEmpty(from_date) || _.isEmpty(to_date)) {
            throw new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.missing_required_parameters);
        }
        if (from_date > to_date){
            throw new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.from_date_should_be_greater_than_to_date);            
        }

        try {
            const data = await self.SummaryService.getAllPaymentModes();
            paymentModes = data.value;
        } catch (error) {
            throw error;
        };

        try {
            const data = await self.SummaryService.fetchSummaryByPaymentMode(SELECTED_INVOICE_SOURCE_DB, paymentModes, from_date, to_date);
            return data;
        } catch (error) {
            throw error; 
        }
    
}

}

module.exports = SummaryController;