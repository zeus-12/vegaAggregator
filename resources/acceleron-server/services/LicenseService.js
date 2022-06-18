'use strict';
let BaseService = ACCELERONCORE._services.BaseService;
let SettingsService = require('./SettingsService');
let LicenseModel = require("../models/LicenseModel");


var _ = require('underscore');
var async = require('async');
const { json } = require('express');

class LicenseService extends BaseService {
  constructor(request) {
    super(request);
    this.request = request;
    this.SettingsService = new SettingsService(request);
    this.LicenseModel = new LicenseModel(request);
  }
  async addNewLicense(newLicenseObject) {
    machine = newLicenseObject.machineUID;

    await this.SettingsService.addNewEntryToSettings(
      'ACCELERATE_CONFIGURED_MACHINES',
      newLicenseObject,
    ).catch((error) => {
      throw error;
    });

    var newEntry = {
      systemName: machine,
      data: [
        {name: 'theme', value: 'skin-green'},
        {name: 'menuImages', value: 'NO'},
        {name: 'punchingRightScreen', value: 'TABLE'},
        {name: 'virtualKeyboard', value: 0},
        {name: 'screenLockOptions', value: 'SCREENSAVER'},
        {name: 'screenLockDuration', value: '2700'},
        {name: 'securityPasscodeProtection', value: 'NO'},
        {name: 'pagesPasscodeProtection', value: 'NO'},
      ],
    };

    await this.SettingsService.addNewEntryToSettings(
      'ACCELERATE_PERSONALISATIONS',
      newEntry,
    ).catch((error) => {
      throw error;
    });

    var newEntry = {
      systemName: machine,
      data: [
        {name: 'notifications', value: 'ALL'},
        {name: 'syncOnlineMenu', value: 'NO'},
        {name: 'minimumCookingTime', value: 'NO'},
        {name: 'expectedReadyTime', value: 'NO'},
        {name: 'ServerBasedKOTPrinting', value: 'YES'},
        {name: 'KOTJammingWarning', value: 'NO'},
        {name: 'orderEditingAllowed', value: 'YES'},
        {name: 'itemShiftingAllowed', value: 'YES'},
        {name: 'onlineOrders', value: 'YES'},
        {name: 'defaultPrepaidName', value: 'Razorpay'},
        {name: 'onlineOrdersNotification', value: 'YES'},
        {name: 'deliverySMS', value: 'YES'},
        {name: 'billSettleLater', value: 'NO'},
        {name: 'adminIdleLogout', value: 'NO'},
        {name: 'idleUserPopup', value: 'NO'},
        {name: 'resetCountersAfterReport', value: 'NO'},
        {name: 'hideAmountFromItemReport', value: 'NO'},
        {name: 'reportEmailList', value: 'abhijithcs1993@gmail.com'},
        {name: 'defaultDeliveryMode', value: ''},
        {name: 'defaultTakeawayMode', value: ''},
        {name: 'defaultDineMode', value: ''},
        {name: 'KOTRelayEnabled', value: 'YES'},
        {name: 'KOTRelayEnabledDefaultKOT', value: 'NO'},
        {name: 'defaultKOTPrinter', value: 'Main Kitchen'},
        {name: 'scanPayEnabled', value: 'NO'},
        {name: 'scanPayAPI', value: ''},
        {name: 'showDefaultQRCode', value: 'NO'},
        {name: 'showDefaultQRTarget', value: 'https://www.accelerate.net.in'},
        {name: 'sendMetadataToQR', value: 'NO'},
      ],
    };
    await this.SettingsService.addNewEntryToSettings(
      'ACCELERATE_SYSTEM_OPTIONS',
      newEntry,
    ).catch((error) => {
      throw error;
    });

    var newEntry = {
      systemName: machine,
      data: [
        {name: 'Show Spotlight Search', value: 'shift+f'},
        {name: 'Show Recent Bills', value: 'shift+r'},
        {name: 'Start Text To Kitchen', value: ''},
        {name: 'Select Billing Mode', value: 'shift+m'},
        {name: 'Set Table/Address', value: 'shift+t'},
        {name: 'Focus Guest Details', value: ''},
        {name: 'Focus Item Search', value: ''},
        {name: 'Set Special Comments', value: ''},
        {name: 'Save Current Order', value: ''},
        {name: 'Close Order', value: ''},
        {name: 'Cancel Order', value: ''},
        {name: 'Print KOT', value: 'shift+k'},
        {name: 'Generate KOT Silently', value: ''},
        {name: 'Print Item View', value: 'shift+v'},
        {name: 'Print Bill', value: 'shift+b'},
        {name: 'Generate Bill Silently', value: ''},
        {name: 'Print Duplicate Bill', value: 'shift+d'},
        {name: 'Settle Bill', value: ''},
        {name: 'Assign Delivery Agent', value: ''},
        {name: 'Issue Refund', value: ''},
        {name: 'Cancel Invoice', value: ''},
        {name: 'Refresh Application', value: ''},
        {name: 'Refresh Online Orders', value: ''},
        {name: 'Go to All Bills', value: ''},
        {name: 'Switch User', value: 'shift+u'},
      ],
    };

    await this.SettingsService.addNewEntryToSettings(
      'ACCELERATE_SHORTCUT_KEYS',
      newEntry,
    ).catch((error) => {
      throw error;
    });

    var newEntry = {
      systemName: machine,
      data: [],
    };

    await this.SettingsService.addNewEntryToSettings(
      'ACCELERATE_CONFIGURED_PRINTERS',
      newEntry,
    ).catch((error) => {
      throw error;
    });

    await this.SettingsService.addNewEntryToSettings(
      'ACCELERATE_KOT_RELAYING',
      newEntry,
    ).catch((error) => {
      throw error;
    });
  }

  async preloadData() {
    var result = {}
    var otherMenuData = []

    let data = await this.LicenseModel.fetchAllMenuMappings()
    const menuMappings = data.rows

    menuMappings.map((menu) => {
      otherMenuData.push({ source: menu.doc.orderSource, menu })
    })

    result.otherMenuData = otherMenuData


    const ptr = this
    const settingsRequestsToBeMade = [
      { variableName: 'DATA_BILLING_MODES', settingsId: 'ACCELERATE_BILLING_MODES' },
      { variableName: 'DATA_ORDER_SOURCES', settingsId: 'ACCELERATE_ORDER_SOURCES' },
      { variableName: 'DATA_REGISTERED_DEVICES', settingsId: 'ACCELERATE_REGISTERED_DEVICES' },
      { variableName: 'DATA_BILLING_PARAMETERS', settingsId: 'ACCELERATE_BILLING_PARAMETERS' },
    ]

    async function assignSettings() {
      await Promise.all(settingsRequestsToBeMade.map(async (item) => {
        let settingsData = await ptr.SettingsService.getSettingsById(item.settingsId).catch((error) => { throw error })
        result[item.variableName] = settingsData.value
      }));
    }
    await assignSettings()

    let masterMenuData = await this.SettingsService.getSettingsById("ACCELERATE_MASTER_MENU").catch((error) => { throw error })
    let mastermenu = masterMenuData.value
    let list = [];
    //populating menu based on category
    for (let i=0; i<mastermenu.length; i++){
      for(let j=0; j<mastermenu[i].items.length; j++){
        list[mastermenu[i].items[j].code] = mastermenu[i].items[j];
        list[mastermenu[i].items[j].code].category = mastermenu[i].category;
      }
    }

    result.MENU_DATA_SYSTEM_ORIGINAL = list

    return JSON.stringify(result)


  }
  async fetchSingleMenuMapping(source) {
    const menuMappings = await this.LicenseModel.fetchSingleMenuMapping(source)
    return menuMappings
  }
}

module.exports = LicenseService;
