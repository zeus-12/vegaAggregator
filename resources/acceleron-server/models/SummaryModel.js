"use strict";
let BaseModel = ACCELERONCORE._models.BaseModel;

var _ = require('underscore');

class SummaryModel extends BaseModel{

    constructor(request) {
        super(request);
        this.couch = ACCELERONCORE._connectors.CouchDB;
    }

    async getSales(SELECTED_INVOICE_SOURCE_DB, billingMode, from_date, to_date) {
        return new Promise((resolve, reject) => {
            this.couch.get('/'+SELECTED_INVOICE_SOURCE_DB+'/_design/invoice-summary/_view/sumbybillingmode?startkey=["'+billingMode+'","'+from_date+'"]&endkey=["'+billingMode+'","'+to_date+'"]', function (err, data) {
            if(err){
                reject(new ErrorResponse(ResponseType.ERROR, ErrorType.something_went_wrong));
            }
            else{
                resolve(data);
            }
            });
        });
    }

    async getRefunds(SELECTED_INVOICE_SOURCE_DB, billingMode, from_date, to_date) {
        return new Promise((resolve, reject) => {
            this.couch.get('/'+SELECTED_INVOICE_SOURCE_DB+'/_design/invoice-summary/_view/sumbybillingmode_refundedamounts?startkey=["'+billingMode+'","'+from_date+'"]&endkey=["'+billingMode+'","'+to_date+'"]', function (err, data) {
            if(err){
                reject(new ErrorResponse(ResponseType.ERROR, ErrorType.something_went_wrong));
            }
            else{
                resolve(data);
            }
            });
        });
    }

    async getUnbilledKOT() {
        return new Promise((resolve, reject) => {
            this.couch.get('/accelerate_kot/_design/kot-summary/_view/sumbycart', function (err, data) {
            if(err){
                reject(new ErrorResponse(ResponseType.ERROR, ErrorType.something_went_wrong));
            }
            else{
                resolve(data);
            }
            });
        });
    }

    async getUnbilledKOTExtras() {
        return new Promise((resolve, reject) => {
            this.couch.get('/accelerate_kot/_design/kot-summary/_view/sumbyextras', function (err, data) {
            if(err){
                reject(new ErrorResponse(ResponseType.ERROR, ErrorType.something_went_wrong));
            }
            else{
                resolve(data);
            }
            });
        });
    }

    async getUnbilledBills(from_date, to_date) {
        return new Promise((resolve, reject) => {
            this.couch.get('/accelerate_bills/_design/bill-summary/_view/sumbytotalpayable?startkey=["'+from_date+'"]&endkey=["'+to_date+'"]', function (err, data) {
            if(err){
                reject(new ErrorResponse(ResponseType.ERROR, ErrorType.something_went_wrong));
            }
            else{
                resolve(data);
            }
            });
        });
    }

    async getSalesByPaymentMode(SELECTED_INVOICE_SOURCE_DB, billing_mode, paymentMode,from_date, to_date) {
        return new Promise((resolve, reject) => {
            this.couch.get('/'+SELECTED_INVOICE_SOURCE_DB+'/_design/invoice-summary/_view/sumbybillingandpaymentmodes?startkey=["'+billing_mode+'","'+paymentMode+'","'+from_date+'"]&endkey=["'+billing_mode+'","'+paymentMode+'","'+to_date+'"]', function (err, data) {
            if(err){
                reject(new ErrorResponse(ResponseType.ERROR, ErrorType.something_went_wrong));
            }
            else{
                resolve(data);
            }
            });
        }); 
    }

    async getSplitPayments(SELECTED_INVOICE_SOURCE_DB, billing_mode, paymentMode,from_date, to_date) {
        return new Promise((resolve, reject) => {
            this.couch.get('/'+SELECTED_INVOICE_SOURCE_DB+'/_design/invoice-summary/_view/sumbybillingandpaymentmodes_multiple?startkey=["'+billing_mode+'","'+paymentMode+'","'+from_date+'"]&endkey=["'+billing_mode+'","'+paymentMode+'","'+to_date+'"]', function (err, data) {
            if(err){
                reject(new ErrorResponse(ResponseType.ERROR, ErrorType.something_went_wrong));
            }
            else{
                resolve(data);
            }
            });
        });
    }
           
}

module.exports = SummaryModel;