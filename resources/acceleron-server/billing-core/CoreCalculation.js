"use strict";
let BillingCoreUtils = require("./BillingCoreUtils");

class CoreCalculation {

    constructor() {

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

module.exports = CoreCalculation;