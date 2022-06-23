"use strict";
let CoreCalculation = require("./CoreCalculation");
let CoreValidation = require("./CoreValidation");
let BillingCoreUtils = require("./BillingCoreUtils");

class BillingCore {

    /*
        1. Generate a bill from a given BILLING MODE, CART, CUSTOM EXTRAS, DISCOUNTS
        2. Ensure the generated bill is in compatible with the standard master menu
        3. Only BillingCore can add / modify figures in a bill (all the other meta data can be set by downstream services or modules)
     */

    constructor() {
        this.CoreCalculation = new CoreCalculation();
        this.CoreValidation = new CoreValidation();
    }

    generateBill(masterMenu, orderCart, billingMode, customExtras, discounts) {
        var verifiedOrderCart = this.CoreValidation.validateCartAgainstMasterMenu(masterMenu, orderCart);
        var { totalCartAmount, totalPackagedAmount } = this.CoreCalculation.calculateCartTotals(verifiedOrderCart);
        var { taxesAndExtrasList, taxesAndExtrasSum } = this.CoreCalculation.calculateTaxesAndExtras(billingMode, totalCartAmount, totalPackagedAmount);
        var { customExtraList, customExtraSum } = this.CoreCalculation.calculateCustomExtras(customExtras, totalCartAmount, totalPackagedAmount);
        var { discountList, discountSum } = this.CoreCalculation.calculateDiscounts(discounts, totalCartAmount, totalPackagedAmount);

        return this.frameBill(verifiedOrderCart, totalCartAmount, totalPackagedAmount, taxesAndExtrasList, taxesAndExtrasSum, customExtraList, customExtraSum, discountList, discountSum);
    }

    //Create a bill out of given data
    frameBill(verifiedOrderCart, totalCartAmount, totalPackagedAmount, taxesAndExtrasList, taxesAndExtrasSum, customExtraList, customExtraSum, discountList, discountSum) {

        var totalPayableAmount = totalCartAmount + taxesAndExtrasSum + customExtraSum - discountSum;
        const calculatedRoundOff = BillingCoreUtils.calculateDifferenceToClosestInteger(totalPayableAmount);
        totalPayableAmount = BillingCoreUtils.roundOffTotalPayable(totalPayableAmount);

        const GENERATED_BILL = {
            "_id": "",
            "KOTNumber": "",
            "orderDetails": "",
            "table": "",
            "customerName": "",
            "customerMobile": "",
            "guestCount": "",
            "machineName": "",
            "sessionName": "",
            "stewardName": "",
            "stewardCode": "",
            "date": "",
            "timePunch": "",
            "timeKOT": "",
            "timeBill": "",
            "cart": verifiedOrderCart,
            "extras": taxesAndExtrasList,
            "discount": BillingCoreUtils.isValidPaymentAmount(discountSum) ? discountList : {},
            "customExtras": BillingCoreUtils.isValidPaymentAmount(customExtraSum) ? customExtraList : {},
            "billNumber": "",
            "outletCode": "",
            "payableAmount": totalPayableAmount,
            "grossCartAmount": totalCartAmount,
            "grossPackagedAmount": totalPackagedAmount,
            "calculatedRoundOff": calculatedRoundOff,
            "paymentMode": "",
            "totalAmountPaid": "",
            "paymentReference": ""
        };
        
        return GENERATED_BILL;
    }

    //Transform bill to invoice by attaching the payment details
    generateInvoice(bill, paymentMode, paymentDetails, splitPayList) {
        //TODO: Validate max discount allowed in paymentMode
        var totalPayableAmount = bill.payableAmount;
        var { paymentMode, paymentReference, paymentSplits, totalAmountPaid, excessAmountPaid, shortageInPaidAmount } = this.CoreCalculation.calculatePaymentSettlement(splitPayList, totalPayableAmount);

        const GENERATED_INVOICE = bill;
        GENERATED_INVOICE.totalAmountPaid = totalAmountPaid;
        GENERATED_INVOICE.paymentMode = paymentMode;
        GENERATED_INVOICE.paymentReference = paymentReference;
        GENERATED_INVOICE.dateStamp = ""; //Settlement date
        GENERATED_INVOICE.timeSettle = "";

        if(paymentSplits.length > 0)
            GENERATED_INVOICE.paymentSplits = paymentSplits;

        if(shortageInPaidAmount > 0)
            GENERATED_INVOICE.roundOffAmount = shortageInPaidAmount;
        else if(excessAmountPaid > 0)
            GENERATED_INVOICE.tipsAmount = excessAmountPaid;

        return GENERATED_INVOICE;
    }

    //Issue refund to an invoice
    issueRefund(invoice, billingModeExtras, refundDetails) {
        this.CoreValidation.validateRefundDetails(invoice, refundDetails);
        var { requestedRefund, adjustedRefundAmount, newTotalPayableAfterRefund, newCalculatedRoundOff, updatedTaxesAndExtrasList, updatedCustomExtraList} = this.CoreCalculation.calculateEffectiveRefund(invoice, billingModeExtras, refundDetails);

        const UPDATED_INVOICE = invoice;
        UPDATED_INVOICE.extras = updatedTaxesAndExtrasList;
        UPDATED_INVOICE.customExtras = updatedCustomExtraList;
        UPDATED_INVOICE.payableAmount = newTotalPayableAfterRefund;
        UPDATED_INVOICE.calculatedRoundOff = newCalculatedRoundOff;
        UPDATED_INVOICE.refundDetails.amount = adjustedRefundAmount;
        UPDATED_INVOICE.refundDetails.netAmount = requestedRefund;

        if(refundDetails.status == 3) { //Full Refund
            UPDATED_INVOICE.discount = {}; //TODO: Validate what happens to discount in full refund case
        }

        return UPDATED_INVOICE;
    }

}

module.exports = BillingCore;