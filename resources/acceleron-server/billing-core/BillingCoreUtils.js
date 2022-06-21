"use strict";
var BillingCoreUtils = {};

BillingCoreUtils.floatSafeNumber = function (number) {
   return Math.round(number * 100) / 100;
}

BillingCoreUtils.isEmpty = function (value) {
   return !value || value == "" || value == undefined || value == null;
}

BillingCoreUtils.isValidPaymentAmount = function (value) {
   return !BillingCoreUtils.isEmpty(value) && value > 0;
}

BillingCoreUtils.toPercentage = function (number) {
   return number / 100;
}

BillingCoreUtils.roundToFloor = function (number) {
   return Math.floor(number)
}

BillingCoreUtils.calculateDifferenceToClosestInteger = function (number) {
   const number_rounded = Math.round(number);
   const number_with_decimals = BillingCoreUtils.floatSafeNumber(number);
   return BillingCoreUtils.floatSafeNumber(number_rounded - number_with_decimals);
}

module.exports = BillingCoreUtils;
