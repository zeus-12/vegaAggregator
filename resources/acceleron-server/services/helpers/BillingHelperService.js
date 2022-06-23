"use strict";
let BaseService = ACCELERONCORE._services.BaseService;
let SettingsService = require("../SettingsService");

class BillingHelperService extends BaseService {
    constructor(request) {
        super(request);
        this.request = request;
        this.SettingsService = new SettingsService(request);
    }

    async getDetailedBillingModeByName(billingModeName) {
        let billingModeResponse = await this.SettingsService.getSettingsById("ACCELERATE_BILLING_MODES");
        var billingMode = billingModeResponse.value.find(
            (billingMode) => billingMode.name === billingModeName
        );

        let billingParamsData = await this.SettingsService.getSettingsById("ACCELERATE_BILLING_PARAMETERS");
        let billingParamsMap = [];
        billingParamsData.value.filter(
            billingParam => billingParamsMap[billingParam.name] = billingParam
        );

        for(let i = 0; i < billingMode.extras.length; i++) {
            const value = billingMode.extras[i].value;
            const applicableBillingParams = billingParamsMap[billingMode.extras[i].name];
            if(applicableBillingParams) {
                billingMode.extras[i] = applicableBillingParams;
                billingMode.extras[i].value = value;
            }
        }
        
        return billingMode;
    }

    async acquireBillNumber() {
        return await this.SettingsService.generateNextIndex("BILL");
    }
}

module.exports = BillingHelperService;