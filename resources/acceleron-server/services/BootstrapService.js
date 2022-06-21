"use strict";
const BaseService = ACCELERONCORE._services.BaseService;
const SettingsService = require("../services/SettingsService");

class BootstrapService extends BaseService {
  constructor(request) {
    super(request);
    this.request = request;
    this.SettingsService = new SettingsService(request);
  }

  async initialiseAcceleronPOS(licenseKey) {
    try {
      const [
        { data: licenceObject },
        { data: systemOptions },
        { data: personalisationData },
        {
          data: { value: billLayout },
        },
        { data: shortcutsData },
        {
          data: { value: KOTRelayData },
        },
        {
          data: { value: sessionsData },
        },
        { data: configuredPrintersData },
        {
          data: { value: orderSourcesData },
        },
      ] = await Promise.all([
        this.SettingsService.filterItemFromSettingsList(
          "ACCELERATE_CONFIGURED_MACHINES",
          licenseKey
        ),
        this.SettingsService.filterItemFromSettingsList(
          "ACCELERATE_CONFIGURED_MACHINES",
          licenseKey
        ),
        this.SettingsService.filterItemFromSettingsList(
          "ACCELERATE_PERSONALIZATIONS",
          licenseKey
        ),
        this.SettingsService.getSettingsById("ACCELERATE_BILL_LAYOUT"),
        this.SettingsService.filterItemFromSettingsList(
          "ACCELERATE_SHORTCUT_KEYS",
          licenseKey
        ),
        this.SettingsService.getSettingsById("ACCELERATE_KOT_RELAYING"),
        this.SettingsService.getSettingsById("ACCELERATE_DINE_SESSIONS"),
        this.SettingsService.filterItemFromSettingsList(
          "ACCELERATE_CONFIGURED_PRINTERS",
          licenseKey
        ),
        this.SettingsService.getSettingsById("ACCELERATE_ORDER_SOURCES"),
      ]);

      return {
        licenceObject,
        systemOptions,
        personalisationData,
        billLayout,
        shortcutsData,
        KOTRelayData,
        sessionsData,
        configuredPrintersData,
        orderSourcesData,
      };
    } catch (error) {
      if (error.data == ErrorType.no_matching_results) {
        try {
          const [
            { data: licenceObject },
            { data: systemOptions },
            { data: personalisationData },
            {
              data: { value: billLayout },
            },
            { data: shortcutsData },
            {
              data: { value: KOTRelayData },
            },
            {
              data: { value: sessionsData },
            },
            { data: configuredPrintersData },
            {
              data: { value: orderSourcesData },
            },
          ] = await Promise.all([
            this.SettingsService.filterItemFromSettingsList(
              "ACCELERATE_CONFIGURED_MACHINES",
              "Any"
            ),
            this.SettingsService.filterItemFromSettingsList(
              "ACCELERATE_CONFIGURED_MACHINES",
              "Any"
            ),
            this.SettingsService.filterItemFromSettingsList(
              "ACCELERATE_PERSONALIZATIONS",
              "Any"
            ),
            this.SettingsService.getSettingsById("ACCELERATE_BILL_LAYOUT"),
            this.SettingsService.filterItemFromSettingsList(
              "ACCELERATE_SHORTCUT_KEYS",
              "Any"
            ),
            this.SettingsService.getSettingsById("ACCELERATE_KOT_RELAYING"),
            this.SettingsService.getSettingsById("ACCELERATE_DINE_SESSIONS"),
            this.SettingsService.filterItemFromSettingsList(
              "ACCELERATE_CONFIGURED_PRINTERS",
              "Any"
            ),
            this.SettingsService.getSettingsById("ACCELERATE_ORDER_SOURCES"),
          ]);

          return {
            licenceObject,
            systemOptions,
            personalisationData,
            billLayout,
            shortcutsData,
            KOTRelayData,
            sessionsData,
            configuredPrintersData,
            orderSourcesData,
          };
        } catch (error) {
          throw error;
        }
      } else {
        throw error;
      }
    }
  }
}

module.exports = BootstrapService;
