"use strict";
let BaseController = ACCELERONCORE._controllers.BaseController;
let KOTService = require('../services/KOTService');

var _ = require('underscore');

class KOTController extends BaseController {
  constructor(request) {
    super(request);
    this.KOTService = new KOTService(request);
  }

  async getKOTById() {
    var kot_id = this.request.params.id;
    if (_.isEmpty(kot_id)) {
      throw new ErrorResponse(
        ResponseType.BAD_REQUEST,
        ErrorType.kot_id_is_empty_or_invalid
      );
    }
    return await this.KOTService.getKOTById(kot_id).catch((error) => {
      throw error;
    });
  }

  async createNewKOT() {
    var new_KOT_data = this.request.body.new_KOT_data;
    var accelerate_licencee_branch =
      this.request.body.accelerate_licencee_branch;

    if (_.isEmpty(new_KOT_data)) {
      throw new ErrorResponse(
        ResponseType.BAD_REQUEST,
        ErrorType.missing_new_KOT_data
      );
    }
    return await this.KOTService.createNewKOT(
      accelerate_licencee_branch,
      new_KOT_data
    ).catch((error) => {
      throw error;
    });
  }

  async updateKOTById() {
    var kot_id = this.request.params.id;
    var updateData = this.request.body;
    if (_.isEmpty(kot_id)) {
      throw new ErrorResponse(
        ResponseType.BAD_REQUEST,
        ErrorType.kot_id_is_empty_or_invalid
      );
    }
    return await this.KOTService.updateKOTById(kot_id, updateData).catch(
      (error) => {
        throw error;
      }
    );
  }

  async deleteKOTById() {
    var kot_id = this.request.params.id;
    if (_.isEmpty(kot_id)) {
      throw new ErrorResponse(
        ResponseType.BAD_REQUEST,
        ErrorType.kot_id_is_empty_or_invalid
      );
    }
    return await this.KOTService.deleteKOTById(kot_id).catch((error) => {
      throw error;
    });
  }

  async fetchKOTsByFilter() {
    var filter_key = this.request.query.key;
    if (_.isEmpty(filter_key)) {
      throw new ErrorResponse(
        ResponseType.BAD_REQUEST,
        ErrorType.filter_key_is_empty_or_invalid
      );
    }

    let ALLOWED_FILTER_KEYS = ["all", "dine", "nondine"];
    if (!ALLOWED_FILTER_KEYS.includes(filter_key)) {
      throw new ErrorResponse(
        ResponseType.BAD_REQUEST,
        ErrorType.invalid_filter
      );
    }
    return await this.KOTService.fetchKOTsByFilter(filter_key).catch(
      (error) => {
        throw error;
      }
    );
  }
}

module.exports = KOTController;

