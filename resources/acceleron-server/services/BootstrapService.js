"use strict";
const BaseService = ACCELERONCORE._services.BaseService;
const SettingsService = require("../services/SettingsService");
const ManageMenuService = require("../services/ManageMenuService");
const DEFAULT_KEY_FOR_GENERIC_SETTINGS = "Any";

class BootstrapService extends BaseService {

    constructor(request) {
        super(request);
        this.request = request;
        this.SettingsService = new SettingsService(request);
        this.ManageMenuService = new ManageMenuService(request);
    }

    async initialiseAcceleronPOS(machineName) {

        let configuredMachinesData = await this.SettingsService.getSettingsById("ACCELERATE_CONFIGURED_MACHINES").catch(error => {
            throw new ErrorResponse(
                ResponseType.BAD_REQUEST,
                ErrorType.license_validation_failed
            );
        });

        var licenceObject = configuredMachinesData.value.find(
            (license) => license.machineUID === machineName
        );

        if(!licenceObject) {
            throw new ErrorResponse(
                ResponseType.BAD_REQUEST,
                ErrorType.license_validation_failed
            );
        }


        let systemOptionsData = await this.SettingsService.filterItemFromSettingsList("ACCELERATE_SYSTEM_OPTIONS", machineName).catch(async () => {
            return await this.SettingsService.filterItemFromSettingsList("ACCELERATE_SYSTEM_OPTIONS", DEFAULT_KEY_FOR_GENERIC_SETTINGS).catch(error => {
                throw new ErrorResponse(
                    ResponseType.NOT_FOUND,
                    ErrorType.settings_not_found_system_options
                );
            });
        });

        let personalisationData = await this.SettingsService.filterItemFromSettingsList("ACCELERATE_PERSONALISATIONS", machineName).catch(async () => {
            return await this.SettingsService.filterItemFromSettingsList("ACCELERATE_PERSONALISATIONS", DEFAULT_KEY_FOR_GENERIC_SETTINGS).catch(error => {
                console.log(error)
                throw new ErrorResponse(
                    ResponseType.NOT_FOUND,
                    ErrorType.settings_not_found_personalisations
                );
            });
        });

        let billLayout = await this.SettingsService.getSettingsById("ACCELERATE_BILL_LAYOUT").catch(error => {
            throw new ErrorResponse(
                ResponseType.BAD_REQUEST,
                ErrorType.settings_not_found_bill_layout
            );
        });

        let shortcutsData = await this.SettingsService.filterItemFromSettingsList("ACCELERATE_SHORTCUT_KEYS", machineName).catch(async () => {
            return await this.SettingsService.filterItemFromSettingsList("ACCELERATE_SHORTCUT_KEYS", DEFAULT_KEY_FOR_GENERIC_SETTINGS).catch(error => {
                throw new ErrorResponse(
                    ResponseType.NOT_FOUND,
                    ErrorType.settings_not_found_shortcuts
                );
            });
        });

        let KOTRelayData = await this.SettingsService.filterItemFromSettingsList("ACCELERATE_KOT_RELAYING", machineName).catch(async () => {
            return await this.SettingsService.filterItemFromSettingsList("ACCELERATE_KOT_RELAYING", DEFAULT_KEY_FOR_GENERIC_SETTINGS).catch(error => {
                throw new ErrorResponse(
                    ResponseType.NOT_FOUND,
                    ErrorType.settings_not_found_kot_relays
                );
            });
        });

        let sessionsData = await this.SettingsService.getSettingsById("ACCELERATE_DINE_SESSIONS").catch(error => {
            throw new ErrorResponse(
                ResponseType.BAD_REQUEST,
                ErrorType.settings_not_found_dine_sessions
            );
        });

        let configuredPrintersData = await this.SettingsService.filterItemFromSettingsList("ACCELERATE_CONFIGURED_PRINTERS", machineName).catch(async () => {
            return await this.SettingsService.filterItemFromSettingsList("ACCELERATE_CONFIGURED_PRINTERS", DEFAULT_KEY_FOR_GENERIC_SETTINGS).catch(error => {
                throw new ErrorResponse(
                    ResponseType.NOT_FOUND,
                    ErrorType.settings_not_found_configured_printers
                );
            });
        });

        let orderSourcesData = await this.SettingsService.getSettingsById("ACCELERATE_ORDER_SOURCES").catch(error => {
            throw new ErrorResponse(
                ResponseType.BAD_REQUEST,
                ErrorType.settings_not_found_order_sources
            );
        });

        const initData = {
            "licenceObject" : licenceObject,
            "systemOptions" : systemOptionsData,
            "personalisationData" : personalisationData,
            "billLayout" : billLayout.value,
            "shortcutsData" : shortcutsData,
            "KOTRelayData" : KOTRelayData,
            "sessionsData" : sessionsData.value,
            "configuredPrintersData" : configuredPrintersData,
            "orderSourcesData" : orderSourcesData.value
        };

        return initData;
    }


  async getDataForAggregatorInitialisation() {
      
    let otherMenuData = await this.ManageMenuService.getAllMenuMappings().catch((error)=>{throw new ErrorResponse(
        ResponseType.BAD_REQUEST,
        ErrorType.mapped_menu_type_is_empty_or_invalid
      );})
      
    let billingModesData = await this.SettingsService.getSettingsById("ACCELERATE_BILLING_MODES").catch((error) => { throw new ErrorResponse(
        ResponseType.BAD_REQUEST,
        ErrorType.bill_mode_name_empty_or_invalid 
    );
    })
      
    let orderSourcesData = await this.SettingsService.getSettingsById("ACCELERATE_ORDER_SOURCES").catch((error) => { throw new ErrorResponse(
        ResponseType.BAD_REQUEST,
        ErrorType.order_source_name_empty_or_invalid 
    );
    })
      
    let registeredDevicesData = await this.SettingsService.getSettingsById("ACCELERATE_REGISTERED_DEVICES").catch((error) => { throw new ErrorResponse(
        ResponseType.BAD_REQUEST,
        ErrorType.registered_devices_empty_or_invalid
    );
    })
      
    let billingParametersData = await this.SettingsService.getSettingsById("ACCELERATE_BILLING_PARAMETERS").catch((error) => { throw new ErrorResponse(
        ResponseType.BAD_REQUEST,
        ErrorType.bill_param_name_empty_or_invalid
    );
    })
      
    let masterMenuData = await this.SettingsService.getSettingsById("ACCELERATE_MASTER_MENU").catch((error) => { throw new ErrorResponse(
        ResponseType.BAD_REQUEST,
        ErrorType.menu_is_empty
      ); })
    
    let masterMenu = masterMenuData.value
    

    return {otherMenuData,billingModesData,orderSourcesData,registeredDevicesData,billingParametersData,masterMenu}


  }
  
}

module.exports = BootstrapService;
