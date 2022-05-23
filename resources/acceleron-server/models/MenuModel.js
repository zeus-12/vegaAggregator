'use strict';
let BaseModel = ACCELERONCORE._models.BaseModel;
var _ = require('underscore');

class MenuModel extends BaseModel {
  constructor(request) {
    super(request);
    this.couch = ACCELERONCORE._connectors.CouchDBAsync;
  }

  async getMenu() {
    const data = await this.couch
      .get('/accelerate_settings/ACCELERATE_MASTER_MENU')
      .catch((error) => {
        throw error;
      });

    return data;
  }

  async updateMenu(updateData) {
    const data = await this.couch
      .put('/accelerate_settings/ACCELERATE_MASTER_MENU', updateData)
      .catch((error) => {
        throw error;
      });

    return data;
  }

  async getCategoryList() {
    const data = await this.couch
      .get('/accelerate_settings/ACCELERATE_MENU_CATEGORIES')
      .catch((error) => {
        throw error;
      });

    return data;
  }

  async updateCategoryList(updateData) {
    const data = await this.couch
      .put('/accelerate_settings/ACCELERATE_MENU_CATEGORIES', updateData)
      .catch((error) => {
        throw error;
      });

    return data;
  }

  //Menu Photos

  async getMenuPhoto(itemCode) {
    const data = await this.couch
      .get('/accelerate_menu_images/' + itemCode)
      .catch((error) => {
        throw error;
      });

    return data;
  }

  async updateMenuPhoto(itemCode, updateData) {
    const data = await this.couch
      .put('/accelerate_menu_images/' + itemCode, updateData)
      .catch((error) => {
        throw error;
      });

    return data;
  }

  async deleteMenuPhoto(itemCode, photoRev) {
    const data = await this.couch
      .delete('/accelerate_menu_images/' + itemCode + '?rev=' + photoRev)
      .catch((error) => {
        throw error;
      });

    return data;
  }
}

module.exports = MenuModel;
