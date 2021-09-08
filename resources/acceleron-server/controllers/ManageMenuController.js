"use strict";
let BaseController = ACCELERONCORE._controllers.BaseController;
let ManageMenuService = require('../services/ManageMenuService');
var _ = require('underscore');

class ManageMenuController extends BaseController {
    constructor(request) {
      super(request);
      this.ManageMenuService = new ManageMenuService(request);
    }
  
    async createNewMappedMenu() {
      const newData = this.request.body;
      
      if(_.isEmpty(newData.code)){
        throw new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.mapped_menu_type_is_empty_or_invalid)
      }

      return await this.ManageMenuService.createNewMappedMenu(newData).catch(error => {
        throw error
      });
    }

    async getMappedMenuByType() {
      const menuTypeCode = this.request.params.menuTypeCode;

      if(_.isEmpty(menuTypeCode)){
        throw new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.mapped_menu_type_is_empty_or_invalid)
      }

      return await this.ManageMenuService.getMappedMenuByType(menuTypeCode).catch(error => {
        throw error
      });
    }
  
    async updateMappedMenuByType() {
      const menuTypeCode = this.request.params.menuTypeCode;
      const itemIndex = parseInt(this.request.params.itemIndex);
      const updateItemObject = this.request.body;

      if(_.isEmpty(menuTypeCode)){
        throw new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.mapped_menu_type_is_empty_or_invalid)
      }

      return await this.ManageMenuService.updateMappedMenuByType(menuTypeCode, itemIndex, updateItemObject)
      .catch(error => {
          throw error
        });
    }

    async createNewMappedItem() {
      const menuTypeCode = this.request.params.menuTypeCode;
      const newItemData = this.request.body;

      if(_.isEmpty(menuTypeCode)){
        throw new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.mapped_menu_type_is_empty_or_invalid)
      }

      return await this.ManageMenuService.createNewMappedItem(menuTypeCode,newItemData)
      .catch(error => {
          throw error
        });
    }

    async createMappedItemsWithArray() {
      const menuTypeCode = this.request.params.menuTypeCode;
      const newItemsList = this.request.body;

      if(_.isEmpty(menuTypeCode)){
        throw new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.mapped_menu_type_is_empty_or_invalid)
      }

      return await this.ManageMenuService.createMappedItemsWithArray(menuTypeCode,newItemsList)
      .catch(error => {
          throw error
        });
    }
  
  }
  
module.exports = ManageMenuController;