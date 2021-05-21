"use strict";
let BaseModel = ACCELERONCORE._models.BaseModel;

var _ = require('underscore');

class SummaryModel extends BaseModel{

    constructor(request) {
        super(request);
        this.couch = ACCELERONCORE._connectors.CouchDBAsync;
    }

    async getSalesByBillingMode(SELECTED_INVOICE_SOURCE_DB, billingMode, from_date, to_date) {
        const data = await this.couch.get('/'+SELECTED_INVOICE_SOURCE_DB+'/_design/invoice-summary/_view/sumbybillingmode?startkey=["'+billingMode+'","'+from_date+'"]&endkey=["'+billingMode+'","'+to_date+'"]').catch(error => {
            throw error;
        });

        return data;
    }

    async getRefundsByBillingMode(SELECTED_INVOICE_SOURCE_DB, billingMode, from_date, to_date) {
        const data = await this.couch.get('/'+SELECTED_INVOICE_SOURCE_DB+'/_design/invoice-summary/_view/sumbybillingmode_refundedamounts?startkey=["'+billingMode+'","'+from_date+'"]&endkey=["'+billingMode+'","'+to_date+'"]').catch(error => {
            throw error;
        });

        return data;
    }

    async getUnbilledKOT() {
        const data = await this.couch.get('/accelerate_kot/_design/kot-summary/_view/sumbycart').catch(error => {
            throw error;
        });

        return data;
    }

    async getUnbilledKOTExtras() {
        const data = await this.couch.get('/accelerate_kot/_design/kot-summary/_view/sumbyextras').catch(error => {
            throw error;
        });

        return data;
    }

    async getUnbilledBills(from_date, to_date) {
        const data = await this.couch.get('/accelerate_bills/_design/bill-summary/_view/sumbytotalpayable?startkey=["'+from_date+'"]&endkey=["'+to_date+'"]').catch(error => {
            throw error;
        });

        return data;
    }

    async getSalesByBillingAndPaymentMode(SELECTED_INVOICE_SOURCE_DB, billing_mode, paymentMode, from_date, to_date) {
        const data = await this.couch.get('/'+SELECTED_INVOICE_SOURCE_DB+'/_design/invoice-summary/_view/sumbybillingandpaymentmodes?startkey=["'+billing_mode+'","'+paymentMode+'","'+from_date+'"]&endkey=["'+billing_mode+'","'+paymentMode+'","'+to_date+'"]').catch(error => {
            throw error;
        });

        return data;
    }

    async getSplitPaymentsByBillingAndPaymentMode(SELECTED_INVOICE_SOURCE_DB, billing_mode, paymentMode, from_date, to_date) {
        const data = await this.couch.get('/'+SELECTED_INVOICE_SOURCE_DB+'/_design/invoice-summary/_view/sumbybillingandpaymentmodes_multiple?startkey=["'+billing_mode+'","'+paymentMode+'","'+from_date+'"]&endkey=["'+billing_mode+'","'+paymentMode+'","'+to_date+'"]').catch(error => {
            throw error;
        });

        return data;
    }

    async getSalesByPaymentMode(SELECTED_INVOICE_SOURCE_DB, paymentMode, from_date, to_date) {
        const data = await this.couch.get('/'+SELECTED_INVOICE_SOURCE_DB+'/_design/invoice-summary/_view/sumbypaymentmode?startkey=["'+paymentMode+'","'+from_date+'"]&endkey=["'+paymentMode+'","'+to_date+'"]').catch(error => {
            throw error;
        });

        return data;
    }

    async getSplitPaymentsByPaymentMode(SELECTED_INVOICE_SOURCE_DB, paymentMode, from_date, to_date) {
        const data = await this.couch.get('/'+SELECTED_INVOICE_SOURCE_DB+'/_design/invoice-summary/_view/sumbypaymentmode_multiple?startkey=["'+paymentMode+'","'+from_date+'"]&endkey=["'+paymentMode+'","'+to_date+'"]').catch(error => {
            throw error;
        });

        return data;
    }

    async getRefundsByPaymentMode(SELECTED_INVOICE_SOURCE_DB, paymentMode, from_date, to_date) {
        const data = await this.couch.get('/'+SELECTED_INVOICE_SOURCE_DB+'/_design/invoice-summary/_view/sumbypaymentmode_refundedamounts?startkey=["'+paymentMode+'","'+from_date+'"]&endkey=["'+paymentMode+'","'+to_date+'"]').catch(error => {
            throw error;
        });

        return data;
    }
           
}

module.exports = SummaryModel;