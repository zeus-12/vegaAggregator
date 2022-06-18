"use strict";
let BillingCoreUtils = require("./BillingCoreUtils");

class BillingCore {

    /*
        1. Generate a bill from a given BILLING MODE, CART, CUSTOM EXTRAS, DISCOUNTS
        2. Ensure the generated bill is in compatible with the standard master menu
        3. Only BillingCore can add / modify figures in a bill (all the other meta data can be set by downstream services or modules)
     */

    constructor() {

    }

    generateBill(masterMenu, orderCart, billingMode, customExtras, discounts) {
        var verifiedOrderCart = this.validateCartAgainstMasterMenu(masterMenu, orderCart);
        var { totalCartAmount, totalPackagedAmount } = this.calculateCartTotals(verifiedOrderCart);
        var { taxesAndExtrasList, taxesAndExtrasSum } = this.calculateTaxesAndExtras(billingMode, totalCartAmount, totalPackagedAmount);
        var { customExtraList, customExtraSum } = this.calculateCustomExtras(customExtras, totalCartAmount, totalPackagedAmount);
        var { discountList, discountSum } = this.calculateDiscounts(discounts, totalCartAmount, totalPackagedAmount);

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


    //Check if all the menu items, are in sync with master menu
    validateCartAgainstMasterMenu(masterMenu, orderCart) {
        return orderCart;
    }


    //Calculate the total cart amount and total amount of all packaged items (for which taxes might not be applicable)
    calculateCartTotals(orderCart) {
        var totalCartAmount = 0;
        var totalPackagedAmount = 0;

        var n = 0;
        while (orderCart[n]) {
            totalCartAmount += orderCart[n].price * orderCart[n].qty;
            if (orderCart[n].isPackaged)
                totalPackagedAmount += orderCart[n].qty * orderCart[n].price;
            n++;
        }

        return { totalPackagedAmount, totalCartAmount };
    }


    //Calculate the applicable taxes and extras based on the billing mode
    calculateTaxesAndExtras(billingMode, totalCartAmount, totalPackagedAmount) {
        var applicableExtras = billingMode.taxesAndExtras;
        let taxesAndExtrasSum = 0;

        //Note: Skip tax and other extras (with isCompulsary no) on packaged food Pepsi ect. (marked with 'isPackaged' = true)
        var taxesAndExtrasList = [];
        var k = 0;
        if(applicableExtras.length > 0){
            for(k = 0; k < applicableExtras.length; k++){
                let extraComponent = applicableExtras[k];
                let extraSum = 0;

                if(extraComponent.value != 0){
                    if(extraComponent.excludePackagedFoods){
                        if(applicableExtras[k].unit == 'PERCENTAGE'){
                            extraSum = (applicableExtras[k].value * (totalCartAmount - totalPackagedAmount)) / 100;
                        }
                        else if(applicableExtras[k].unit == 'FIXED'){
                            extraSum = applicableExtras[k].value;
                        }
                    }
                    else{
                        if(extraComponent.unit == 'PERCENTAGE'){
                            extraSum = applicableExtras[k].value * totalCartAmount / 100;
                        }
                        else if(extraComponent.unit == 'FIXED'){
                            extraSum = applicableExtras[k].value;
                        }
                    }
                }

                extraSum = BillingCoreUtils.floatSafeNumber(extraSum);

                taxesAndExtrasList.push({
                    "name": extraComponent.name,
                    "value": extraComponent.value,
                    "unit": extraComponent.unit,
                    "isPackagedExcluded": extraComponent.excludePackagedFoods,
                    "amount": extraSum
                })

                taxesAndExtrasSum += extraSum;
            }
        }

        return { taxesAndExtrasList, taxesAndExtrasSum }
    }


    //Calculate the custom extras based on the given extras details
    calculateCustomExtras(customExtrasComponent, totalCartAmount, totalPackagedAmount) {
        var customExtraSum = 0;
        if(customExtrasComponent.unit == 'PERCENTAGE'){
            customExtraSum = customExtrasComponent.value * totalCartAmount / 100;
        }
        else if(customExtrasComponent == 'FIXED'){
            customExtraSum = customExtrasComponent.value;
        }

        customExtraSum = BillingCoreUtils.floatSafeNumber(customExtraSum);
        var customExtraList = {
            "name": customExtrasComponent.name,
            "value": customExtrasComponent.value,
            "unit": customExtrasComponent.unit,
            "isPackagedExcluded": false, //TODO: Consider making it configurable
            "amount": customExtraSum
        };

        return { customExtraList, customExtraSum }
    }


    //Calculate the effective discount based on the given discount details
    calculateDiscounts(discountComponent, totalCartAmount, totalPackagedAmount) {
        var discountSum = 0;
        if(discountComponent.unit == 'PERCENTAGE'){
            discountSum = discountComponent.value * totalCartAmount / 100;
        }
        else if(kot.discount.unit == 'FIXED'){
            discountSum = discountComponent.value;
        }

        discountSum = BillingCoreUtils.floatSafeNumber(discountSum);
        var discountList = {
            "type" : discountComponent.type,
            "unit" : discountComponent.unit,
            "value" : discountComponent.value,
            "reference": "", //TODO: Where to set comments?
            "amount": discountSum
        }

        return { discountList, discountSum };
    }
}

module.exports = BillingCore;