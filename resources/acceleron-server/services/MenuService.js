"use strict";
let BaseService = ACCELERONCORE._services.BaseService;
let MenuModel = require('../models/MenuModel');
var _ = require('underscore');
const { result } = require('underscore');

class MenuService extends BaseService {
    constructor(request) {
      super(request);
      this.MenuModel = new MenuModel(request);
    }
  
    async getFullMenu() {

      const data = await this.MenuModel.getMenu().catch(error => {
        throw error
      });

      if(_.isEmpty(data)){
        throw new ErrorResponse(ResponseType.NO_RECORD_FOUND, ErrorType.no_matching_results);
      }
      else{
          if(data.value == undefined){
              throw new ErrorResponse(ResponseType.ERROR, ErrorType.server_data_corrupted);
          }
          else{
              return data; 
          }
      }
    }
    async getCategoryList() {
      const data = await this.MenuModel.getCategoryList().catch(error => {
        throw error
      });

      if(_.isEmpty(data)){
        throw new ErrorResponse(ResponseType.NO_RECORD_FOUND, ErrorType.no_matching_results);
      }
      else{
          if(data.value == undefined){
              throw new ErrorResponse(ResponseType.ERROR, ErrorType.server_data_corrupted);
          }
          else{
              return data; 
          }
      }
      }
  
    async createNewCategory(categoryName) {
      const categoryData = await this.getCategoryList().catch(error => {
        throw error
      });
      // const menuData = await this.getFullMenu().catch(error => {
      //   throw error
      // });

        var categoryList = categoryData.value;
        // var menu = menuData.value;

        for (var i=0; i<categoryList.length; i++) {
          if (categoryList[i] == categoryName){
             throw new ErrorResponse(ResponseType.CONFLICT, "Category already exists");
          }
        }
        categoryList.push(categoryName);
        categoryData.value = categoryList;

        // const newCategoryObject = {
        //   category:categoryName,
        //   items:[]
        // }
        // menu.push(newCategoryObject);
        // menuData.value = menu;

        // await this.MenuModel.updateMenu(menuData).catch(error => {
        //   throw error
        // });

        return await this.MenuModel.updateCategoryList(categoryData).catch(error => {
          throw error
        });

    }
    
     
    async getCategoryByName(categoryName) {
      const categoryData = await this.getCategoryList().catch(error => {
        throw error
      });
      var categoryList = categoryData.value;
        
      for (var i=0; i<categoryList.length; i++) {
        if (categoryList[i] == categoryName){

          const menuData = await this.getFullMenu().catch(error => {
            throw error
          });
          var menu = menuData.value;
          for (var j=0; j<menu.length; j++) {
            if (menu[j].category == categoryName){
              return menu[j];
            }          
        }        
        const categoryObject = {
          category: categoryName,
          items: []
        }
        return categoryObject; 
      }
    }
    throw new ErrorResponse(ResponseType.NO_RECORD_FOUND, ErrorType.no_matching_results);
    }
  
    async updateCategoryByName(categoryName, newCategoryName) {
      const categoryData = await this.getCategoryList().catch(error => {
        throw error
      });
      var categoryList = categoryData.value;
        
      for (var i=0; i<categoryList.length; i++) {
        if (categoryList[i] == categoryName){

          categoryList[i] = newCategoryName;
          const data = await this.MenuModel.updateCategoryList(categoryData).catch(error => {
            throw error
          });
          const menuData = await this.getFullMenu().catch(error => {
            throw error
          });
          var menu = menuData.value;
          for (var j=0; j<menu.length; j++) {
            if (menu[j].category == categoryName){
              menu[j].category = newCategoryName;
              return await this.MenuModel.updateMenu(menuData).catch(error => {
                throw error
              });
            }          
        }
        return data;        
      }
    }
    throw new ErrorResponse(ResponseType.NO_RECORD_FOUND, ErrorType.no_matching_results);
    }
  
    async deleteCategoryByName(categoryName) {
      const categoryData = await this.getCategoryList().catch(error => {
        throw error
      });
      var categoryList = categoryData.value;
        
      for (var i=0; i<categoryList.length; i++) {
        if (categoryList[i] == categoryName){
          categoryList.splice(i,1);
          const data = await this.MenuModel.updateCategoryList(categoryData).catch(error => {
            throw error
          });
          const menuData = await this.getFullMenu().catch(error => {
            throw error
          });
          var menu = menuData.value;
          for (var j=0; j<menu.length; j++) {
            if (menu[j].category == categoryName){
              menu.splice(j,1);
              return await this.MenuModel.updateMenu(menuData).catch(error => {
                throw error
              });
            }          
        }
        return data;        
      }
    }
    throw new ErrorResponse(ResponseType.NO_RECORD_FOUND, ErrorType.no_matching_results);
    }

    async getAllItems(categoryName) {
      const categoryData = await this.getCategoryByName(categoryName).catch(error => {
        throw error
      });
      return categoryData.items;
    }

  async createNewItem(categoryName,itemObject) {
    const categoryData = await this.getCategoryByName(categoryName).catch(error => {
      throw error
    });
    categoryData.items.push(itemObject)
    const menuData = await this.getFullMenu().catch(error => {
      throw error
    });
    var menu = menuData.value;
    for (var j=0; j<menu.length; j++) {
      if (menu[j].category == categoryName){
        menu.splice(j,1,categoryData);
        return await this.MenuModel.updateMenu(menuData).catch(error => {
          throw error
        });
      }          
    }
    menu.push(categoryData);
    return await this.MenuModel.updateMenu(menuData).catch(error => {
      throw error
    });

  }
  
  

  async getItemByCode(categoryName, itemCode) {
    return await this.MenuModel.getItemByCode(categoryName, itemCode).catch(error => {
      throw error
    });
  }

  async updateItemByCode(categoryName, itemCode, newItemObject) {

    return await this.MenuModel.updateItemByCode(categoryName, itemCode, newItemObject)
    .catch(error => {
        throw error
      });
  }

  async deleteItemByCode(categoryName, itemCode) {
    
    return await this.MenuModel.deleteItemByCode(categoryName, itemCode).catch(error => {
      throw error
    });
  }
  }
  
  module.exports = MenuService;