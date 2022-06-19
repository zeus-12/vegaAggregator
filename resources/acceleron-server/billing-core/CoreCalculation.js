"use strict";
let BillingCoreUtils = require("./BillingCoreUtils");

class CoreCalculation {

    constructor() {

    }

    /************************************************************
                        * BILL GENERATION *
     ************************************************************/

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


    /************************************************************
                    * INVOICE (BILL SETTLEMENT) *
     ************************************************************/

    calculatePaymentSettlement(splitPayList, totalPayableAmount) {

        var paymentMode = '';
        var paymentReference = '';
        var paymentSplits = [];
        var totalAmountPaid = 0;
        var excessAmountPaid = 0;
        var shortageInPaidAmount = 0;

        var totalSplitSum = 0;
        var validSplitPaymentsCount = 0;

        if(splitPayList.length > 1){
            paymentMode = 'MULTIPLE';
        }
        else{
            paymentMode = splitPayList[0].code;
            if(!BillingCoreUtils.isEmpty(splitPayList[0].reference))
                paymentReference = splitPayList[0].reference;
        }

        var n = 0;
        while(splitPayList[n]){
            if(BillingCoreUtils.isValidPaymentAmount(splitPayList[n].amount)){
                totalSplitSum += parseFloat(splitPayList[n].amount);
                paymentSplits.push(splitPayList[n]);
                validSplitPaymentsCount++;
            }
            n++;
        }
        totalSplitSum = BillingCoreUtils.floatSafeNumber(totalSplitSum);

        //In case multiple selected but value added only for one, all others kept empty
        if(splitPayList.length > 1 && validSplitPaymentsCount == 1){
            paymentMode = paymentSplits[0].code;
            if(!BillingCoreUtils.isEmpty(paymentSplits[0].reference))
                paymentReference = paymentSplits[0].reference;
        }

        totalAmountPaid = totalSplitSum;
        if(paymentMode != 'MULTIPLE') {
            paymentSplits = [];
        }

        const MAX_ROUNDOFF_TOLERANCE_PERCENTAGE = 5;
        var maxAllowedTolerance = totalPayableAmount * BillingCoreUtils.toPercentage(MAX_ROUNDOFF_TOLERANCE_PERCENTAGE);
        if(totalSplitSum < totalPayableAmount && (totalPayableAmount - totalSplitSum) > maxAllowedTolerance){
            //TODO: Throw Error? (Do this in validateClass)
        }

        //Round Off (shortageInPaidAmount) or Tips (excessAmountPaid) calculation
        if(totalSplitSum < totalPayableAmount){
            shortageInPaidAmount = BillingCoreUtils.floatSafeNumber(totalPayableAmount - totalSplitSum);
        }
        else if(totalSplitSum > totalPayableAmount){
            excessAmountPaid = BillingCoreUtils.floatSafeNumber(totalSplitSum - totalPayableAmount);
        }

        return { paymentMode, paymentReference, paymentSplits, totalAmountPaid, excessAmountPaid, shortageInPaidAmount };
    }


    calculateTaxableSumOnRefund(invoice, refundDetails) {
        var totalCartAmount = invoice.grossCartAmount;
        var discountAmount = BillingCoreUtils.isValidPaymentAmount(invoice.discount.amount) ? invoice.discount.amount : 0;
        var requestedRefund = refundDetails.amount;

        return totalCartAmount - requestedRefund - discountAmount;
    }


    calculateEffectiveRefund(invoice, billingMode, refundDetails) {
        var requestedRefund = refundDetails.amount;
        var adjustedRefundAmount = 0;
        var newTotalPayableAfterRefund = 0;
        var newCalculatedRoundOff = 0;
        var updatedTaxesAndExtrasList = [];
        var updatedCustomExtraList = {};

        if (refundDetails.status == 2) { //Partial Refund
            var taxableCartAmountAfterRefund = this.calculateTaxableSumOnRefund(invoice, refundDetails);
            var totalPackagedAmount = 0; //TODO: How to tackle this?
            var customExtras = invoice.customExtras;
            var { taxesAndExtrasList, taxesAndExtrasSum} = this.calculateTaxesAndExtras(billingMode, taxableCartAmountAfterRefund, totalPackagedAmount);
            var { customExtraList, customExtraSum } = this.calculateCustomExtras(customExtras, taxableCartAmountAfterRefund, totalPackagedAmount);

            newTotalPayableAfterRefund = taxableCartAmountAfterRefund + taxesAndExtrasSum + customExtraSum;

            adjustedRefundAmount = BillingCoreUtils.roundToFloor(invoice.totalAmountPaid - newTotalPayableAfterRefund);
            newCalculatedRoundOff = BillingCoreUtils.calculateDifferenceToClosestInteger(newTotalPayableAfterRefund);
            updatedTaxesAndExtrasList = taxesAndExtrasList;
            updatedCustomExtraList = customExtraList;
        } else if (refundDetails.status == 3) { //Full Refund
            adjustedRefundAmount = requestedRefund;
            newTotalPayableAfterRefund = invoice.grossCartAmount;
            newCalculatedRoundOff = invoice.calculatedRoundOff; //TODO: Check what happens with calculatedRoundOff in case of full refund
        }

        return { requestedRefund, adjustedRefundAmount, newTotalPayableAfterRefund, newCalculatedRoundOff, updatedTaxesAndExtrasList, updatedCustomExtraList };
    }
}

module.exports = CoreCalculation;