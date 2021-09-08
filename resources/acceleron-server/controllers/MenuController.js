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
        throw new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.category_name_is_empty_or_invalid)
      }

      return await this.MenuService.createNewCategory(categoryName).catch(error => {
        throw error
      });
    }
      
    async getCategoryByName() {
      const categoryName = this.request.params.categoryName;

      if(_.isEmpty(categoryName)){
        throw new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.category_name_is_empty_or_invalid)
      }

      return await this.MenuService.getCategoryByName(categoryName).catch(error => {
        throw error
      });
    }
  
    async updateCategoryByName() {
      const categoryName = this.request.params.categoryName;
      const newCategoryName = this.request.body.categoryName;

      if(_.isEmpty(categoryName) || _.isEmpty(newCategoryName)){
        throw new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.category_name_is_empty_or_invalid)
      }

      return await this.MenuService.updateCategoryByName(categoryName, newCategoryName)
      .catch(error => {
          throw error
        });
    }
  
    async deleteCategoryByName() {
      const categoryName = this.request.params.categoryName;

      if(_.isEmpty(categoryName)){
        throw new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.category_name_is_empty_or_invalid)
      }

      return await this.MenuService.deleteCategoryByName(categoryName).catch(error => {
        throw error
      });
    }

    async getAllItems() {
      const categoryName = this.request.params.categoryName;

      if(_.isEmpty(categoryName)){
        throw new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.category_name_is_empty_or_invalid)
      }
      return await this.MenuService.getAllItems(categoryName).catch(error => {
        throw error
      });
    }

    async createNewItem() {
      const categoryName = this.request.params.categoryName;
      const itemObject = this.request.body;

      if(_.isEmpty(categoryName)){
        throw new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.category_name_is_empty_or_invalid)
      }
      if( _.isEmpty(itemObject.code)){
        throw new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.item_code_is_empty_or_invalid)
      }
      if( _.isEmpty(itemObject.name)){
        throw new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.item_name_is_empty_or_invalid)
      }
      if(_.isEmpty(itemObject.price)){
        throw new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.item_price_is_empty_or_invalid)
      }


      return await this.MenuService.createNewItem(categoryName,itemObject).catch(error => {
        throw error
      });
    }
  
    async getItemByCode() {
      const categoryName = this.request.params.categoryName;
      const itemCode = this.request.params.itemCode;

      if(_.isEmpty(categoryName)){
        throw new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.category_name_is_empty_or_invalid)
      }
      if(_.isEmpty(itemCode)){
        throw new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.item_code_is_empty_or_invalid)
      }

      return await this.MenuService.getItemByCode(categoryName, itemCode).catch(error => {
        throw error
      });
    }

    async updateItemByCode() {
      const categoryName = this.request.params.categoryName;
      const itemCode = this.request.params.itemCode;
      const newItemObject = this.request.body;
      if(_.isEmpty(categoryName)){
        throw new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.category_name_is_empty_or_invalid)
      }
      if( _.isEmpty(itemCode) ){
        throw new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.item_code_is_empty_or_invalid)
      }
      if( _.isEmpty(newItemObject.code)){
        throw new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.item_code_is_empty_or_invalid)
      }
      if( _.isEmpty(newItemObject.name)){
        throw new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.item_name_is_empty_or_invalid)
      }
      if(_.isEmpty(newItemObject.price)){
        throw new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.item_price_is_empty_or_invalid)
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
        throw new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.category_name_is_empty_or_invalid)
      }
      if(_.isEmpty(itemCode)){
        throw new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.item_code_is_empty_or_invalid)
      }
      
      return await this.MenuService.deleteItemByCode(categoryName, itemCode).catch(error => {
        throw error
      });
    }


// Other APIs

    async toggleAvailability() {

      const itemCode = this.request.params.itemCode;
      const updateToken = this.request.query.updateToken;
      const onlineFlag = this.request.query.onlineFlag;

      if(_.isEmpty(itemCode) ){
        throw new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.item_code_is_empty_or_invalid)
      }
      if(_.isNull(onlineFlag) ){
        throw new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.online_flag_empty)
      }
      if(_.isEmpty(updateToken) ){
        throw new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.update_token_empty)
      }

      return await this.MenuService.toggleAvailability(itemCode, onlineFlag, updateToken)
      .catch(error => {
          throw error
        });
    }

    async markAllMenuAvailable() {
      return await this.MenuService.markAllMenuAvailable()
      .catch(error => {
          throw error
        });
    }

    async getLastItemCode() {
      return await this.MenuService.getLastItemCode()
      .catch(error => {
          throw error
        });
    }

    async markAllAvailableByCategory() {
      const categoryName = this.request.params.categoryName;
      const availOption = this.request.query.option;

      if(_.isEmpty(categoryName)){
        throw new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.category_name_is_empty_or_invalid)
      }
      if(_.isEmpty(availOption)){
        throw new ErrorResponse(ResponseType.ERROR, ErrorType.avail_option_empty)
      }
      
      return await this.MenuService.markAllAvailableByCategory(categoryName, availOption).catch(error => {
        throw error
      });
    }

    async moveItemToCategory() {
      const itemCode = this.request.params.itemCode;
      const newCategoryName = this.request.body.categoryName;

      if(_.isEmpty(itemCode)){
        throw new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.item_code_is_empty_or_invalid)
      }
      if(_.isEmpty(newCategoryName) ){
        throw new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.category_name_is_empty_or_invalid)
      }

      return await this.MenuService.moveItemToCategory(itemCode, newCategoryName)
      .catch(error => {
          throw error
        });
    }

  // Menu Photos

  async addNewPhoto() {
    const itemCode = this.request.body.code;
    const image = this.request.body.data;

    if( _.isEmpty(itemCode)){
      throw new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.item_code_is_empty_or_invalid)
    }
    if( _.isEmpty(image)){
      throw new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.image_is_empty_or_invalid)
    }

    return await this.MenuService.addNewPhoto(itemCode, image).catch(error => {
      throw error
    });
  }

  async getPhotoByCode() {
    const itemCode = this.request.params.itemCode;

    if(_.isEmpty(itemCode)){
      throw new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.item_code_is_empty_or_invalid)
    }

    return await this.MenuService.getPhotoByCode(itemCode).catch(error => {
      throw error
    });
  }

  async updatePhotoByCode() {
    const itemCode = this.request.params.itemCode;
    const newImage = this.request.body.data;

    if( _.isEmpty(itemCode) ){
      throw new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.item_code_is_empty_or_invalid)
    }
    if( _.isEmpty(newImage)){
      throw new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.image_is_empty_or_invalid)
    }

    return await this.MenuService.updatePhotoByCode(itemCode, newImage)
    .catch(error => {
        throw error
      });
  }

  async deletePhotoByCode() {
    const itemCode = this.request.params.itemCode;

    if(_.isEmpty(itemCode)){
      throw new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.item_code_is_empty_or_invalid)
    }
    
    return await this.MenuService.deletePhotoByCode(itemCode).catch(error => {
      throw error
    });
  }


}
  
module.exports = MenuController;