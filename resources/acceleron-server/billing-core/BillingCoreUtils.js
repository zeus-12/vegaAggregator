"use strict";
var BillingCoreUtils = {};

BillingCoreUtils.floatSafeNumber = function (number) {
   return Math.round(number * 100) / 100;
}

module.exports = BillingCoreUtils;
