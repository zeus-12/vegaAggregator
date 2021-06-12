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
            const data = await self.SummaryService.fetchSummaryByBillingMode(billingModes, from_date, to_date, curr_date);
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
            const data = await self.SummaryService.fetchSummaryByBillingAndPaymentMode(paymentModes, from_date, to_date, billing_mode);
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
            const data = await self.SummaryService.fetchSummaryByPaymentMode(paymentModes, from_date, to_date);
            return data;
        } catch (error) {
            throw error; 
        }
    
}

async  fetchSummaryByPaymentModeAndExtras(){

    let self = this;
    var from_date = self.request.query.startdate;
    var to_date = self.request.query.enddate;
    var payment_mode = self.request.query.paymentmode;
    var billingParameters = [];
    var ALLOWED_PAYMENT_MODES = [];

    if (_.isEmpty(from_date) || _.isEmpty(to_date) || _.isEmpty(payment_mode)) {
        throw new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.missing_required_parameters);
    }

    if (from_date > to_date){
        throw new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.from_date_should_be_greater_than_to_date);            
    }

    try {
        const data = await self.SummaryService.getAllPaymentModes();
        for(var i = 0; i < data.value.length; i++){
            ALLOWED_PAYMENT_MODES = [...ALLOWED_PAYMENT_MODES, data.value[i].code];
        }
    } catch (error) {
        throw error;
    };

    if(!ALLOWED_PAYMENT_MODES.includes(payment_mode)){
        throw new ErrorResponse(ResponseType.BAD_REQUEST, "Not a valid payment mode");
    }

    try {
        const data = await self.SummaryService.getAllBillingParameters();
        billingParameters = data.value;
    } catch (error) {
        throw error;
    };

    try {
        const data = await self.SummaryService.fetchSummaryByPaymentModeAndExtras(billingParameters, from_date, to_date, payment_mode);
        return data;
    } catch (error) {
        throw error; 
    }

}

async fetchSummaryBySessions(){

    let self = this;
    var from_date = self.request.query.startdate;
    var to_date = self.request.query.enddate;
    var diningSessions = [];


    if (_.isEmpty(from_date) || _.isEmpty(to_date)) {
        throw new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.missing_required_parameters);
    }
    if (from_date > to_date){
        throw new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.from_date_should_be_greater_than_to_date);            
    }

    try {
        const data = await self.SummaryService.getAllDiningSessions();
        diningSessions = data.value;
    } catch (error) {
        throw error;
    };

    try {
        const data = await self.SummaryService.fetchSummaryBySessions(diningSessions, from_date, to_date);
        return data;
    } catch (error) {
        throw error; 
    }

}

}

module.exports = SummaryController;