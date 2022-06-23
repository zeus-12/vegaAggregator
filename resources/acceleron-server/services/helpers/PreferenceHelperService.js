"use strict";
let BaseService = ACCELERONCORE._services.BaseService;
let SettingsService = require("../SettingsService");

class PreferenceHelperService extends BaseService {
    constructor(request) {
        super(request);
        this.request = request;
        this.SettingsService = new SettingsService(request);
    }

    async getPreference(systemId, preferenceKey) {
        var preferenceResponse = await this.SettingsService.filterItemFromSettingsList("ACCELERATE_SYSTEM_OPTIONS", systemId);
        var preferenceData = preferenceResponse.find(
            (item) => item.name === preferenceKey
        );
        return preferenceData.value;
    }
}

module.exports = PreferenceHelperService;