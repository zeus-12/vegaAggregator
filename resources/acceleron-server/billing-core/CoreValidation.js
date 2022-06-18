"use strict";
let BillingCoreUtils = require("./BillingCoreUtils");

class CoreValidation {

    constructor() {

    }

    //Check if all the menu items, are in sync with master menu
    validateCartAgainstMasterMenu(masterMenu, orderCart) {
        return orderCart;
    }
}

module.exports = CoreValidation;