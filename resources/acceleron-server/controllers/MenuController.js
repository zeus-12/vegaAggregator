"use strict";
let BaseController = ACCELERONCORE._controllers.BaseController;
let MenuService = require('../services/MenuService');
var _ = require('underscore');

class MenuController extends BaseController {
    constructor(request) {
      super(request);
      this.MenuService = new MenuService(request);
    }
  
    async getFullMenu() {
      try{
      const data = await this.MenuService.getFullMenu();
      return data.value
      }
      catch(error){
        throw error
      };

    }
    async getCategoryList() {
      try{
        const data = await this.MenuService.getCategoryList();
        return data.value
        }
        catch(error){
          throw error
        };
      }
  
    async createNewCategory() {
      const categoryName = this.request.body.categoryName;

      if(_.isEmpty(categoryName)){
        throw new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.invalid_data_format)
      }

      return await this.MenuService.createNewCategory(categoryName).catch(error => {
        throw error
      });
    }
    
    
  
    async getCategoryByName() {
      const categoryName = this.request.params.categoryName;

      if(_.isEmpty(categoryName)){
        throw new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.invalid_data_format)
      }

      return await this.MenuService.getCategoryByName(categoryName).catch(error => {
        throw error
      });
    }
  
    async updateCategoryByName() {
      const categoryName = this.request.params.categoryName;
      const newCategoryName = this.request.body.categoryName;

      if(_.isEmpty(categoryName) || _.isEmpty(newCategoryName)){
        throw new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.invalid_data_format)
      }

      return await this.MenuService.updateCategoryByName(categoryName, newCategoryName)
      .catch(error => {
          throw error
        });
    }
  
    async deleteCategoryByName() {
      const categoryName = this.request.params.categoryName;

      if(_.isEmpty(categoryName)){
        throw new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.invalid_data_format)
      }

      return await this.MenuService.deleteCategoryByName(categoryName).catch(error => {
        throw error
      });
    }

    async getAllItems() {
      const categoryName = this.request.params.categoryName;

      if(_.isEmpty(categoryName)){
        throw new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.invalid_data_format)
      }
      return await this.MenuService.getAllItems(categoryName).catch(error => {
        throw error
      });
    }

  async createNewItem() {
    const categoryName = this.request.params.categoryName;
    const itemObject = this.request.body;
    if(_.isEmpty(categoryName) || _.isNull(itemObject.code) || _.isEmpty(itemObject.name) || _.isEmpty(itemObject.price) ){
      throw new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.invalid_data_format)
    }

    return await this.MenuService.createNewItem(categoryName,itemObject).catch(error => {
      throw error
    });
  }
  
  

  async getItemByCode() {
    const categoryName = this.request.params.categoryName;
    const itemCode = this.request.params.itemCode;

    if(_.isEmpty(categoryName) || _.isEmpty(itemCode)){
      throw new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.invalid_data_format)
    }

    return await this.MenuService.getItemByCode(categoryName, itemCode).catch(error => {
      throw error
    });
  }

  async updateItemByCode() {
    const categoryName = this.request.params.categoryName;
    const itemCode = this.request.params.itemCode;
    const newItemObject = this.request.body;

    if(_.isEmpty(categoryName) || _.isEmpty(itemCode) || _.isEmpty(newItemObject.code) || _.isEmpty(newItemObject.name) || _.isEmpty(newItemObject.price)){
      throw new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.invalid_data_format)
    }

    return await this.MenuService.updateItemByCode(categoryName, itemCode, newItemObject)
    .catch(error => {
        throw error
      });
  }

  async deleteItemByCode() {
    const categoryName = this.request.params.categoryName;
    const itemCode = this.request.params.itemCode;

    if(_.isEmpty(categoryName)){
      throw new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.invalid_data_format)
    }
    
    return await this.MenuService.deleteItemByCode(categoryName, itemCode).catch(error => {
      throw error
    });
  }
  }
  
  module.exports = MenuController;