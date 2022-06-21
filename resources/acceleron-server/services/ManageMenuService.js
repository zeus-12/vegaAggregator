"use strict";
let BaseService = ACCELERONCORE._services.BaseService;
let ManageMenuModel = require('../models/ManageMenuModel');
var _ = require('underscore');

class ManageMenuService extends BaseService {
    constructor(request) {
      super(request);
      this.ManageMenuModel = new ManageMenuModel(request);
    }
  
    async getAllMenuMappings(menuTypeCode) {
      var otherMenuData = []
  
      let menuMappingsData = await this.ManageMenuModel.fetchAllMenuMappings().catch(error => {
        throw error
      });
      const menuMappings = menuMappingsData.rows
  
      menuMappings.map((menu) => {
        otherMenuData.push({ source: menu.doc.orderSource, menu })
      })
      return otherMenuData

    }


    async createNewMappedMenu(newData) {
      const id = 'MENU_'+newData.code
      const newMappedMenu = {
        _id: id,
        orderSource: newData.orderSource,
        metaData: {
          billingPrice: newData.billingPrice,
          mappedVariantAvailable: false,
          mappedCodeAvailable: false
        },
        value: []
      }
      return await this.ManageMenuModel.createNewMappedMenu(newMappedMenu).catch(error => {
        throw error
      });
    }
  
    async getMappedMenuByType(menuTypeCode) {
      const result = await this.ManageMenuModel.getMappedMenu(menuTypeCode).catch(error => {
        throw error
      });
      return result
    }
  
    async updateMappedMenuByType(menuTypeCode, itemIndex, updateItemObject) {
      const mappedMenuData = await this.ManageMenuModel.getMappedMenu(menuTypeCode).catch(error => {
        throw error
      });
      var mappedMenu = mappedMenuData.value
      mappedMenu[itemIndex] = updateItemObject
      return await this.ManageMenuModel.updateMappedMenu(menuTypeCode, mappedMenuData).catch(error => {
        throw error
      });
    }

    async createNewMappedItem(menuTypeCode,newItemData) {
      const mappedMenuData = await this.ManageMenuModel.getMappedMenu(menuTypeCode).catch(error => {
        throw error
      });
      var mappedMenu = mappedMenuData.value
      mappedMenu.append(newItemData)
      return await this.ManageMenuModel.updateMappedMenu(menuTypeCode, mappedMenuData).catch(error => {
        throw error
      });
    }
    async createMappedItemsWithArray(menuTypeCode,newItemsList) {
      const mappedMenuData = await this.ManageMenuModel.getMappedMenu(menuTypeCode).catch(error => {
        throw error
      });
      var mappedMenu = mappedMenuData.value
      mappedMenu = [...mappedMenu,...newItemsList]
      return await this.ManageMenuModel.updateMappedMenu(menuTypeCode, mappedMenuData).catch(error => {
        throw error
      });
    }
  
  }
  
  module.exports = ManageMenuService;