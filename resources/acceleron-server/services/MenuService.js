"use strict";
let BaseService = ACCELERONCORE._services.BaseService;
let MenuModel = require('../models/MenuModel');
var _ = require('underscore');


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
          if(_.isUndefined(data.value)){
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
          if(_.isUndefined(data.value)){
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
      var categoryList = categoryData.value;

      for (var i=0; i<categoryList.length; i++) {
        if (categoryList[i] == categoryName){
          throw new ErrorResponse(ResponseType.CONFLICT, ErrorType.category_already_exists);
        }
      }
      categoryList.push(categoryName);
      categoryData.value = categoryList;
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
      var locatedPointer = '';
        
      for (var i=0; i<categoryList.length; i++) {
        if (categoryList[i] == newCategoryName){
          throw new ErrorResponse(ResponseType.CONFLICT, ErrorType.category_already_exists);
        }

        if (categoryList[i] == categoryName){
          locatedPointer = i;      
        }
      }
       
      // When no matching category is found
      if(locatedPointer == ''){
        throw new ErrorResponse(ResponseType.NO_RECORD_FOUND, ErrorType.no_matching_results);
      }

      // Updating menu category
      categoryList[locatedPointer] = newCategoryName;
      const data = await this.MenuModel.updateCategoryList(categoryData).catch(error => {
        throw error
      });
      
      //Updating Master Menu
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

      const menuData = await this.getFullMenu().catch(error => {     
        throw error
      });
      var menu = menuData.value;

      // Checking for Duplicate item
      for (var j=0; j<menu.length; j++) {
        var items = menu[j].items
        for (var k=0; k<items.length; k++) {
          if(items[k].code == itemObject.code){
            throw new ErrorResponse(ResponseType.CONFLICT, ErrorType.item_code_already_exists);
          }         
        }          
      }

      /*Beautify item price if Custom item*/
      if (itemObject.isCustom) {
        var min = 0;  //Index of min and max values.
        var max = 0;
        var g = 0;
        while (itemObject.customOptions[g]) {
            if (parseInt(itemObject.customOptions[g].customPrice) > parseInt(itemObject.customOptions[max].customPrice)) {
                max = g;
            }
            if (parseInt(itemObject.customOptions[min].customPrice) > parseInt(itemObject.customOptions[g].customPrice)) {
                min = g;
            }

            //Last iteration
            if(g == itemObject.customOptions.length - 1){
              if (itemObject.customOptions[min].customPrice != itemObject.customOptions[max].customPrice) {
                itemObject.price = itemObject.customOptions[min].customPrice + '-' + itemObject.customOptions[max].customPrice;
              } 
              else {
                itemObject.price = itemObject.customOptions[max].customPrice;
              }
            }

            g++;
        }
      }

      categoryData.items.push(itemObject)

      for (var i=0; i<menu.length; i++) {
        if (menu[i].category == categoryName){
          menu.splice(i,1,categoryData);
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
      const itemsList = await this.getAllItems(categoryName).catch(error => {
        throw error
      });

      for (var i=0; i<itemsList.length; i++) {
        if (itemsList[i].code == itemCode){
        return itemsList[i]; 
      }
    }
    throw new ErrorResponse(ResponseType.NO_RECORD_FOUND, ErrorType.no_matching_results);
    }

    async updateItemByCode(categoryName, itemCode, newItemObject) {

      const menuData = await this.getFullMenu().catch(error => {
        throw error
      });
      var menu = menuData.value;

        /*Beautify item price if Custom item*/
      if (newItemObject.isCustom) {
        var min = 0;  //Index of min and max values.
        var max = 0;
        var g = 0;
        while (newItemObject.customOptions[g]) {
            if (parseInt(newItemObject.customOptions[g].customPrice) > parseInt(newItemObject.customOptions[max].customPrice)) {
              max = g;
            }
            if (parseInt(newItemObject.customOptions[min].customPrice) > parseInt(newItemObject.customOptions[g].customPrice)) {
              min = g;
            }
  
            //Last iteration
            if(g == newItemObject.customOptions.length - 1){
              if (newItemObject.customOptions[min].customPrice != newItemObject.customOptions[max].customPrice) {
                newItemObject.price = newItemObject.customOptions[min].customPrice + '-' + newItemObject.customOptions[max].customPrice;
              } 
              else {
                newItemObject.price = newItemObject.customOptions[max].customPrice;
              }
            }
  
            g++;
        }
      }

      for (var j=0; j<menu.length; j++) {
        if (menu[j].category == categoryName){
          var items = menu[j].items
          for (var k=0; k<items.length; k++) {
            if (items[k].code == itemCode){
                items[k] = newItemObject;
                return await this.MenuModel.updateMenu(menuData).catch(error => {
                  throw error
                });
              }          
          }       
        }
      }
      throw new ErrorResponse(ResponseType.NO_RECORD_FOUND, ErrorType.no_matching_results);
    }

    async deleteItemByCode(categoryName, itemCode) {
      
      const menuData = await this.getFullMenu().catch(error => {
        throw error
      });
      var menu = menuData.value;
      for (var j=0; j<menu.length; j++) {
        if (menu[j].category == categoryName){
          var items = menu[j].items
          for (var k=0; k<items.length; k++) {
            if (items[k].code == itemCode){
                items.splice(k,1);
                return await this.MenuModel.updateMenu(menuData).catch(error => {
                  throw error
                });
              }          
          }       
        }
      }
      throw new ErrorResponse(ResponseType.NO_RECORD_FOUND, ErrorType.no_matching_results);
    }

    //Other APIs
    async toggleAvailability(itemCode, onlineFlag, updateToken) {

      const menuData = await this.getFullMenu().catch(error => {
        throw error
      });
      var menu = menuData.value;
      for (var j=0; j<menu.length; j++) {
        var items = menu[j].items
        for (var k=0; k<items.length; k++) {
          if (items[k].code == itemCode){
              items[k].isAvailable = !items[k].isAvailable;
              var data = {
                "token": updateToken,
                "code": itemCode,
                "status": items[k].isAvailable
              }
              if(onlineFlag == 1){
                $.ajax({
                  type: 'POST',
                  url: 'https://www.accelerateengine.app/apis/itemstatus.php',
                  data: JSON.stringify(data),
                  contentType: "application/json",
                  dataType: 'json',
                  timeout: 10000,
                  success: function(data) { 
                    if(data.status){ 
                    }
                    else{                  
                      showToast('Cloud Server Warning: Online Menu not updated', '#e67e22');
                    }
                  },
                  error: function(data){
                    showToast('Failed to reach Cloud Server. Please check your connection.', '#e74c3c');
                  }
                });
              }
              return await this.MenuModel.updateMenu(menuData).catch(error => {
                throw error
              });
            
          }         
        }       
      
      }
      throw new ErrorResponse(ResponseType.NO_RECORD_FOUND, ErrorType.no_matching_results);
    }

    async markAllMenuAvailable() {
    
      const menuData = await this.getFullMenu().catch(error => {
        throw error
      });
      var menu = menuData.value;
      for (var j=0; j<menu.length; j++) {
        var items = menu[j].items
        for (var k=0; k<items.length; k++) {
          items[k].isAvailable = true;         
        }          
      }
      return await this.MenuModel.updateMenu(menuData).catch(error => {
        throw error
      });

    }

    async getLastItemCode() {
    
      const menuData = await this.getFullMenu().catch(error => {
        throw error
      });
      var highestCode = 0;
      var menu = menuData.value;
      for (var j=0; j<menu.length; j++) {
        var items = menu[j].items
        for (var k=0; k<items.length; k++) {
          if(items[k].code > highestCode){
            highestCode = items[k].code;
          }         
        }          
      }
      return highestCode;

    }

    async markAllAvailableByCategory(categoryName, availOption) {
    
      const menuData = await this.getFullMenu().catch(error => {
        throw error
      });
      var menu = menuData.value;
      for (var j=0; j<menu.length; j++) {
        if (menu[j].category == categoryName){
          var items = menu[j].items
          for (var k=0; k<items.length; k++) {
            items[k].isAvailable = (availOption == 'ALL_AVAIL') ? true : false;         
          }          
        }
      }
      return await this.MenuModel.updateMenu(menuData).catch(error => {
        throw error
      });

    }

    async moveItemToCategory(itemCode, newCategoryName) {
    
      const menuData = await this.getFullMenu().catch(error => {
        throw error
      });
      var menu = menuData.value;
      var itemObject = ''
      var isItemFound = false;
      for (var j=0; j<menu.length; j++) {
        var items = menu[j].items
        for (var k=0; k<items.length; k++) {
          if (items[k].code == itemCode){
            isItemFound = true;
            itemObject = items[k];
            items.splice(k,1);
          }         
        }          
      
      }
      if(isItemFound){
        await this.MenuModel.updateMenu(menuData).catch(error => {
          throw error
        });
        return await this.createNewItem(newCategoryName,itemObject).catch(error => {
          throw error
        });
      }
      else{  
        throw new ErrorResponse(ResponseType.NO_RECORD_FOUND, ErrorType.no_matching_results) 
      }

    }

  //Menu Photos

    async addNewPhoto(itemCode, image) {

      var imageObject = {}
      imageObject._id = itemCode
      imageObject.code = itemCode
      imageObject.data = image

      const menuData = await this.getFullMenu().catch(error => {     
        throw error
      });
      var menu = menuData.value;

      for (var j=0; j<menu.length; j++) {
        var items = menu[j].items
        for (var k=0; k<items.length; k++) {
          if(items[k].code == itemCode){
            imageObject.category = menu[j].category;
            items[k].isPhoto = true;
          }         
        }          
      }
      await this.MenuModel.updateMenu(menuData).catch(error => {
        throw error
      });

      return await this.MenuModel.updateMenuPhoto(itemCode, imageObject).catch(error => {
        throw error
      });

    }
  
    async getPhotoByCode(itemCode) {
      const imageData =  await this.MenuModel.getMenuPhoto(itemCode).catch(error => {
        throw error
      });
      return imageData.data

    }

    async updatePhotoByCode(itemCode, newImage) {
      const imageData =  await this.MenuModel.getMenuPhoto(itemCode).catch(error => {
        throw error
      });
      imageData.data = newImage;
      return await this.MenuModel.updateMenuPhoto(itemCode, imageData).catch(error => {
        throw error
      });
    }

    async deletePhotoByCode(itemCode) {
      const menuData = await this.getFullMenu().catch(error => {     
        throw error
      });
      var menu = menuData.value;

      for (var j=0; j<menu.length; j++) {
        var items = menu[j].items
        for (var k=0; k<items.length; k++) {
          if(items[k].code == itemCode){
            items[k].isPhoto = false;
          }         
        }          
      }
      await this.MenuModel.updateMenu(menuData).catch(error => {
        throw error
      });
      const imageData =  await this.MenuModel.getMenuPhoto(itemCode).catch(error => {
        throw error
      }); 

      return await this.MenuModel.deleteMenuPhoto(itemCode, imageData._rev).catch(error => {
        throw error
      });
    }

  }
  
  module.exports = MenuService;