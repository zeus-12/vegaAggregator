"use strict";
let BillingCoreUtils = require("./BillingCoreUtils");

class CoreValidation {

    constructor() {

    }

    //Check if all the menu items, are in sync with master menu
    validateCartAgainstMasterMenu(masterMenu, orderCart) {
        return orderCart;
    }

    validateRefundDetails(invoice, refundDetails) {
        let discountAmount = BillingCoreUtils.isValidPaymentAmount(invoice.discount.amount) ? invoice.discount.amount : 0;
        let maxRefundableAmount = invoice.totalAmountPaid - discountAmount;
        if(refundDetails.amount > maxRefundableAmount) {
            throw new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.refund_greater_than_paid_amount);
        }
    }
}

module.exports = CoreValidation;