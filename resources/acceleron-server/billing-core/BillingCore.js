"use strict";
let CoreCalculation = require("./CoreCalculation");
let CoreValidation = require("./CoreValidation");

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

        return this.createBillSkeleton(verifiedOrderCart, billingMode, totalCartAmount, totalPackagedAmount, taxesAndExtrasList, taxesAndExtrasSum, customExtraList, customExtraSum, discountList, discountSum);
    }


    //Create a bill out of given data
    createBillSkeleton(verifiedOrderCart, billingMode, totalCartAmount, totalPackagedAmount, taxesAndExtrasList, taxesAndExtrasSum, customExtraList, customExtraSum, discountList, discountSum) {

        const totalPayableAmount = totalCartAmount + taxesAndExtrasSum + customExtraSum - discountSum;

        const GENERATED_BILL = {
            "_id": "",
            "KOTNumber": "",
            "orderDetails": billingMode.orderDetails,
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
            "discount": discountList,
            "customExtras": customExtraList,
            "billNumber": "",
            "outletCode": "",
            "payableAmount": totalPayableAmount,
            "grossCartAmount": totalCartAmount,
            "grossPackagedAmount": totalPackagedAmount,
            "calculatedRoundOff": ""
        };
        
        return GENERATED_BILL;
    }
}

module.exports = BillingCore;