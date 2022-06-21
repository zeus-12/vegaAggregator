"use strict";

class DataFactoryManager {

    constructor() {
        this.DATA_FACTORY = [];
        this.initialiseData();
    }

    getDefaultSettingsData = function (settingsId) {
        const ALLOWED_OPTIONS = ["ACCELERATE_SHORTCUT_KEYS","ACCELERATE_PERSONALISATIONS","ACCELERATE_SYSTEM_OPTIONS"];
        if(!ALLOWED_OPTIONS.includes(settingsId)){
            return [];
        } else {
            return this.DATA_FACTORY["defaultSettingsData"][settingsId];
        }
    }

    initialiseData = function () {
        var defaultSettingsData = [];
        defaultSettingsData["ACCELERATE_SHORTCUT_KEYS"] = require("./data/ACCELERATE_SHORTCUT_KEYS.json");
        defaultSettingsData["ACCELERATE_PERSONALISATIONS"] = require("./data/ACCELERATE_PERSONALISATIONS.json");
        defaultSettingsData["ACCELERATE_SYSTEM_OPTIONS"] = require("./data/ACCELERATE_SYSTEM_OPTIONS.json");

        this.DATA_FACTORY["defaultSettingsData"] = defaultSettingsData;
    }
}

module.exports = DataFactoryManager;