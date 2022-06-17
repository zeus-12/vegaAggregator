"use strict";
let BaseController = ACCELERONCORE._controllers.BaseController;
let SettingsService = require("../services/SettingsService");
let QuickFixesService = require("../services/QuickFixesService");

var _ = require("underscore");

class SettingsController extends BaseController {
  constructor(request) {
    super(request);
    this.SettingsService = new SettingsService(request);
    this.QuickFixesService = new QuickFixesService(request);
  }

  async getSettingsById() {
    var settings_id = this.request.params.id;

    if (_.isEmpty(settings_id)) {
      throw new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.settings_id_is_empty_or_invalid);
    }

    var ALLOWED_SETTINGS = [
      "ACCELERATE_BILLING_MODES",
      "ACCELERATE_BILLING_PARAMETERS",
      "ACCELERATE_BILL_INDEX",
      "ACCELERATE_BILL_LAYOUT",
      "ACCELERATE_CANCELLATION_REASONS",
      "ACCELERATE_CONFIGURED_MACHINES",
      "ACCELERATE_CONFIGURED_PRINTERS",
      "ACCELERATE_COOKING_INGREDIENTS",
      "ACCELERATE_DINE_SESSIONS",
      "ACCELERATE_DISCOUNT_TYPES",
      "ACCELERATE_KOT_INDEX",
      "ACCELERATE_KOT_RELAYING",
      "ACCELERATE_MENU_CATALOG",
      "ACCELERATE_MENU_CATEGORIES",
      "ACCELERATE_MASTER_MENU",
      "ACCELERATE_ORDER_SOURCES",
      "ACCELERATE_PAYMENT_MODES",
      "ACCELERATE_PERSONALISATIONS",
      "ACCELERATE_REGISTERED_DEVICES",
      "ACCELERATE_SAVED_COMMENTS",
      "ACCELERATE_SAVED_ORDERS",
      "ACCELERATE_SHORTCUT_KEYS",
      "ACCELERATE_STAFF_PROFILES",
      "ACCELERATE_TABLE_SECTIONS",
      "ACCELERATE_TEXT_TO_KITCHEN_LOG",
      "ACCELERATE_TOKEN_INDEX",
    ];

    if (!ALLOWED_SETTINGS.includes(settings_id)) {
      throw new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.invalid_settings_name);
    }

    return await this.SettingsService.getSettingsById(settings_id).catch((error) => {
      throw error;
    });
  }

  async updateSettingsById() {
    var settings_id = this.request.params.id;
    var new_entry = this.request.body;

    if (_.isEmpty(settings_id)) {
      throw new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.settings_id_is_empty_or_invalid);
    }

    var ALLOWED_SETTINGS = ["ACCELERATE_KOT_INDEX"];

    if (!ALLOWED_SETTINGS.includes(settings_id)) {
      throw new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.invalid_settings_name);
    }

    switch (settings_id) {
      case "ACCELERATE_KOT_INDEX": {
        if (_.isEmpty(new_entry._rev)) {
          throw new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.update_rev_empty);
        }

        if (_.isEmpty(new_entry.identifierTag)) {
          throw new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.identifier_tag_empty);
        }

        if (_.isEmpty(new_entry.value)) {
          throw new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.value_is_empty);
        }
        break;
      }
    }

    return await this.SettingsService.updateSettingsById(settings_id, new_entry).catch((error) => {
      throw error;
    });
  }

  async addNewEntryToSettings() {
    var settings_id = this.request.params.id;
    var new_entry = this.request.body;

    if (_.isEmpty(settings_id)) {
      throw new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.settings_id_is_empty_or_invalid);
    }

    var ALLOWED_SETTINGS = [
      "ACCELERATE_BILLING_MODES",
      "ACCELERATE_BILLING_PARAMETERS",
      "ACCELERATE_CANCELLATION_REASONS",
      "ACCELERATE_CONFIGURED_MACHINES",
      "ACCELERATE_COOKING_INGREDIENTS",
      "ACCELERATE_DINE_SESSIONS",
      "ACCELERATE_DISCOUNT_TYPES",
      "ACCELERATE_MENU_CATALOG",
      "ACCELERATE_MENU_CATEGORIES",
      "ACCELERATE_ORDER_SOURCES",
      "ACCELERATE_PAYMENT_MODES",
      "ACCELERATE_REGISTERED_DEVICES",
      "ACCELERATE_SAVED_COMMENTS",
      "ACCELERATE_SAVED_ORDERS",
      "ACCELERATE_STAFF_PROFILES",
      "ACCELERATE_TABLE_SECTIONS",
      "ACCELERATE_TEXT_TO_KITCHEN_LOG",
      "ACCELERATE_TOKEN_INDEX",
    ];

    if (!ALLOWED_SETTINGS.includes(settings_id)) {
      throw new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.invalid_settings_name);
    }

    //Validate new_entry
    switch (settings_id) {
      case "ACCELERATE_COOKING_INGREDIENTS": {
        if (_.isEmpty(new_entry.new_ingredient_name)) {
          throw new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.ingredient_name_empty);
        }
        break;
      }
      case "ACCELERATE_DINE_SESSIONS": {
        if (_.isEmpty(new_entry.name)) {
          throw new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.session_name_empty_or_invalid);
        }
        if (_.isEmpty(new_entry.startTime)) {
          throw new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.start_time_empty_or_invalid);
        }
        if (_.isEmpty(new_entry.endTime)) {
          throw new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.end_time_empty_or_invalid);
        }
        break;
      }
      case "ACCELERATE_CANCELLATION_REASONS": {
        if (_.isEmpty(new_entry.new_reason_name)) {
          throw new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.reason_name_empty_or_invalid);
        }
        break;
      }
      case "ACCELERATE_SAVED_COMMENTS": {
        if (_.isEmpty(new_entry.new_comment)) {
          throw new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.comment_empty_or_invalid);
        }
        break;
      }
      case "ACCELERATE_BILLING_PARAMETERS": {
        if (_.isEmpty(new_entry.name)) {
          throw new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.bill_param_name_empty_or_invalid);
        }
        if (!_.isBoolean(new_entry.excludePackagedFoods)) {
          throw new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.bill_param_excludePackagedFoods_empty_or_invalid);
        }
        if (_.isNaN(new_entry.value)) {
          throw new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.bill_param_value_empty_or_invalid);
        }
        if (_.isEmpty(new_entry.unit)) {
          throw new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.bill_param_unit_empty_or_invalid);
        }
        if (_.isEmpty(new_entry.unitName)) {
          throw new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.bill_param_unit_name_empty_or_invalid);
        }
        break;
      }
      case "ACCELERATE_DISCOUNT_TYPES": {
        if (_.isEmpty(new_entry.name)) {
          throw new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.discount_name_empty_or_invalid);
        }
        if (_.isEmpty(new_entry.maxDiscountUnit)) {
          throw new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.discount_unit_empty_or_invalid);
        }
        if (_.isNaN(new_entry.maxDiscountValue)) {
          throw new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.discount_value_empty_or_invalid);
        }

        break;
      }
      case "ACCELERATE_BILLING_MODES": {
        if (_.isEmpty(new_entry.name)) {
          throw new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.bill_mode_name_empty_or_invalid);
        }
        if (_.isEmpty(new_entry.type)) {
          throw new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.bill_mode_type_empty_or_invalid);
        }
        if (_.isBoolean(new_entry.isDiscountable)) {
          if (new_entry.isDiscountable) {
            if (_.isNaN(new_entry.maxDiscount)) {
              throw new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.bill_mode_discount_empty_or_invalid);
            }
            if (!new_entry.maxDiscount) {
              throw new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.bill_mode_discount_is_zero);
            }
          } else {
            new_entry.maxDiscount = "";
          }
        } else {
          throw new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.bill_mode_discountable_empty_or_invalid);
        }
        break;
      }
      case "ACCELERATE_PAYMENT_MODES": {
        if (_.isEmpty(new_entry.name)) {
          throw new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.payment_name_empty_or_invalid);
        }
        if (_.isEmpty(new_entry.code)) {
          throw new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.payment_code_empty_or_invalid);
        }

        break;
      }
      case "ACCELERATE_ORDER_SOURCES": {
        if (_.isEmpty(new_entry.name)) {
          throw new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.order_source_name_empty_or_invalid);
        }
        if (_.isEmpty(new_entry.code)) {
          throw new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.order_source_code_empty_or_invalid);
        }
        break;
      }
      case "ACCELERATE_SAVED_ORDERS": {
        if (_.isEmpty(new_entry.cart_products)) {
          throw new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.empty_cart);
        }
        if (_.isEmpty(new_entry.customerInfo)) {
          throw new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.missing_customer_info);
        }
        if (_.isEmpty(new_entry.timestamp)) {
          throw new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.saved_time_missing);
        }
        break;
      }
    }

    return await this.SettingsService.addNewEntryToSettings(settings_id, new_entry).catch((error) => {
      throw error;
    });
  }

  async removeEntryFromSettings() {
    var settings_id = this.request.params.id;
    var entry_to_remove = this.request.body;

    if (_.isEmpty(settings_id)) {
      throw new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.settings_id_is_empty_or_invalid);
    }

    var ALLOWED_SETTINGS = [
      "ACCELERATE_BILLING_MODES",
      "ACCELERATE_BILLING_PARAMETERS",
      "ACCELERATE_CANCELLATION_REASONS",
      "ACCELERATE_CONFIGURED_MACHINES",
      "ACCELERATE_CONFIGURED_PRINTERS",
      "ACCELERATE_COOKING_INGREDIENTS",
      "ACCELERATE_DINE_SESSIONS",
      "ACCELERATE_DISCOUNT_TYPES",
      "ACCELERATE_MENU_CATALOG",
      "ACCELERATE_MENU_CATEGORIES",
      "ACCELERATE_ORDER_SOURCES",
      "ACCELERATE_PAYMENT_MODES",
      "ACCELERATE_REGISTERED_DEVICES",
      "ACCELERATE_SAVED_COMMENTS",
      "ACCELERATE_SAVED_ORDERS",
      "ACCELERATE_STAFF_PROFILES",
      "ACCELERATE_TABLE_SECTIONS",
      "ACCELERATE_TEXT_TO_KITCHEN_LOG",
      "ACCELERATE_TOKEN_INDEX",
    ];

    if (!ALLOWED_SETTINGS.includes(settings_id)) {
      throw new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.invalid_settings_name);
    }

    //Validate new_entry
    switch (settings_id) {
      case "ACCELERATE_COOKING_INGREDIENTS": {
        if (_.isEmpty(entry_to_remove.ingredient_name)) {
          throw new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.ingredient_name_empty);
        }
        break;
      }
      case "ACCELERATE_DINE_SESSIONS": {
        if (_.isEmpty(entry_to_remove.session_name)) {
          throw new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.session_name_empty_or_invalid);
        }
        break;
      }
      case "ACCELERATE_CANCELLATION_REASONS": {
        if (_.isEmpty(entry_to_remove.reason_name)) {
          throw new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.reason_name_empty_or_invalid);
        }
        break;
      }
      case "ACCELERATE_SAVED_COMMENTS": {
        if (_.isEmpty(entry_to_remove.saved_comment)) {
          throw new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.comment_empty_or_invalid);
        }
        break;
      }
      case "ACCELERATE_MENU_CATALOG": {
        if (_.isEmpty(entry_to_remove.categoryName)) {
          throw new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.category_name_is_empty_or_invalid);
        }
        break;
      }
      case "ACCELERATE_BILLING_PARAMETERS": {
        if (_.isEmpty(entry_to_remove.name)) {
          throw new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.bill_param_name_empty_or_invalid);
        }
        break;
      }
      case "ACCELERATE_DISCOUNT_TYPES": {
        if (_.isEmpty(entry_to_remove.name)) {
          throw new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.discount_name_empty_or_invalid);
        }
        break;
      }
      case "ACCELERATE_BILLING_MODES": {
        if (_.isEmpty(entry_to_remove.name)) {
          throw new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.bill_mode_name_empty_or_invalid);
        }
        break;
      }
      case "ACCELERATE_PAYMENT_MODES": {
        if (_.isEmpty(entry_to_remove.name)) {
          throw new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.payment_name_empty_or_invalid);
        }
        break;
      }
      case "ACCELERATE_ORDER_SOURCES": {
        if (_.isEmpty(entry_to_remove.name)) {
          throw new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.order_source_name_empty_or_invalid);
        }
        break;
      }
      case "ACCELERATE_CONFIGURED_PRINTERS": {
        if (_.isEmpty(entry_to_remove.name)) {
          throw new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.printer_name_empty_or_invalid);
        }
        break;
      }
      case "ACCELERATE_KOT_RELAYING": {
        if (_.isEmpty(entry_to_remove.printer)) {
          throw new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.printer_name_empty_or_invalid);
        }
        break;
      }
    }

    return await this.SettingsService.removeEntryFromSettings(settings_id, entry_to_remove).catch((error) => {
      throw error;
    });
  }

  async filterItemFromSettingsList() {
    var settings_id = this.request.params.id;
    var filter_key = this.request.query.uniqueKey;

    if (_.isEmpty(settings_id)) {
      throw new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.settings_id_is_empty_or_invalid);
    }
    if (_.isEmpty(filter_key)) {
      throw new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.filter_key_is_empty_or_invalid);
    }

    /*
            These types of settings has list of entries, and any of the entries can be
            retrieved against a given unique identifier. 
            For ex. Shortcut keys for a given machine
        */

    var ALLOWED_SETTINGS = [
      "ACCELERATE_CONFIGURED_MACHINES",
      "ACCELERATE_CONFIGURED_PRINTERS",
      "ACCELERATE_SHORTCUT_KEYS",
      "ACCELERATE_SYSTEM_OPTIONS",
      "ACCELERATE_PERSONALISATIONS",
    ];

    if (!ALLOWED_SETTINGS.includes(settings_id)) {
      throw new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.invalid_settings_name);
    }

    return await this.SettingsService.filterItemFromSettingsList(settings_id, filter_key).catch((error) => {
      throw error;
    });
  }

  async updateItemFromSettingsList() {
    var settings_id = this.request.params.id;
    var filter_key = this.request.query.uniqueKey;
    var entry_to_update = this.request.body;

    if (_.isEmpty(settings_id)) {
      throw new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.settings_id_is_empty_or_invalid);
    }
    if (_.isEmpty(filter_key)) {
      throw new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.filter_key_is_empty_or_invalid);
    }

    /*
            These types of settings has list of entries, and any of the entries can be
            retrieved against a given unique identifier. 
            For ex. Shortcut keys for a given machine
        */

    let ALLOWED_SETTINGS = [
      "ACCELERATE_CONFIGURED_MACHINES",
      "ACCELERATE_CONFIGURED_PRINTERS",
      "ACCELERATE_KOT_RELAYING",
      "ACCELERATE_MENU_CATALOG",
      "ACCELERATE_PAYMENT_MODES",
      "ACCELERATE_PERSONALISATIONS",
      "ACCELERATE_SHORTCUT_KEYS",
      "ACCELERATE_SYSTEM_OPTIONS",
      "ACCELERATE_BILL_LAYOUT",
    ];

    if (!ALLOWED_SETTINGS.includes(settings_id)) {
      throw new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.invalid_settings_name);
    }

    //Validate entry_to_update
    switch (settings_id) {
      case "ACCELERATE_CONFIGURED_MACHINES": {
        if (_.isEmpty(entry_to_update.new_system_name)) {
          throw new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.system_name_is_empty_or_invalid);
        }
        break;
      }
      case "ACCELERATE_KOT_RELAYING": {
        if (_.isEmpty(entry_to_update.categoryName)) {
          throw new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.category_name_is_empty_or_invalid);
        }
        break;
      }
      case "ACCELERATE_MENU_CATALOG": {
        if (_.isEmpty(entry_to_update.mainType)) {
          throw new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.main_type_is_empty_or_invalid);
        }
        break;
      }
      case "ACCELERATE_PAYMENT_MODES": {
        if (_.isEmpty(entry_to_update.paymentName)) {
          throw new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.payment_name_is_empty_or_invalid);
        }
        break;
      }
      case "ACCELERATE_PERSONALISATIONS": {
        if (_.isEmpty(entry_to_update.updateField)) {
          throw new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.update_field_is_empty_or_invalid);
        }
        if (_.isEmpty(entry_to_update.newValue)) {
          throw new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.new_Value_is_empty_or_invalid);
        }
        break;
      }
      case "ACCELERATE_SHORTCUT_KEYS": {
        if (_.isEmpty(entry_to_update.updateField)) {
          throw new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.update_field_is_empty_or_invalid);
        }
        if (!_.isEmpty(entry_to_update.selectedTriggerKey) && _.isEmpty(entry_to_update.selectedNormalKey)) {
          throw new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.select_one_more_key);
        }
        break;
      }
      case "ACCELERATE_SYSTEM_OPTIONS": {
        if (_.isEmpty(entry_to_update.updateField)) {
          throw new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.update_field_is_empty_or_invalid);
        }
        break;
      }
      case "ACCELERATE_CONFIGURED_PRINTERS": {
        if (_.isEmpty(entry_to_update.name)) {
          throw new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.printer_name_empty_or_invalid);
        }
        if (_.isEmpty(entry_to_update.type)) {
          throw new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.printer_type_empty_or_invalid);
        }
        if (_.isNaN(entry_to_update.width)) {
          throw new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.printer_width_empty_or_invalid);
        }
        if (_.isEmpty(entry_to_update.actions)) {
          throw new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.printer_actions_empty_or_invalid);
        }
        if (_.isEmpty(entry_to_update.machineName)) {
          throw new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.machine_name_is_empty_or_invalid);
        }
        break;
      }
    }

    return await this.SettingsService.updateItemFromSettingsList(settings_id, filter_key, entry_to_update).catch(
      (error) => {
        throw error;
      }
    );
  }

  async applyQuickFix() {
    var fix_key = this.request.query.fixKey;

    if (_.isEmpty(fix_key)) {
      throw new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.fix_key_is_empty_or_invalid);
    }

    fix_key = fix_key.toUpperCase();
    let ALLOWED_FIXES = ["KOT", "BILL", "TABLE"];

    if (!ALLOWED_FIXES.includes(fix_key)) {
      throw new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.invalid_fix_key);
    }

    return await this.QuickFixesService.applyQuickFix(fix_key).catch((error) => {
      throw error;
    });
  }

  async renameCategoryKOTRelays() {
    var machineName = this.request.query.machineName;
    var categoryName = this.request.body.categoryName;
    var newCategoryName = this.request.body.newCategoryName;

    if (_.isEmpty(machineName)) {
      throw new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.machine_name_is_empty_or_invalid);
    }
    if (_.isEmpty(categoryName)) {
      throw new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.category_name_is_empty_or_invalid);
    }
    if (_.isEmpty(newCategoryName)) {
      throw new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.category_name_is_empty_or_invalid);
    }

    return await this.SettingsService.renameCategoryKOTRelays(machineName, categoryName, newCategoryName).catch(
      (error) => {
        throw error;
      }
    );
  }

  async deleteCategoryKOTRelays() {
    var machineName = this.request.query.machineName;
    var categoryName = this.request.body.categoryName;

    if (_.isEmpty(machineName)) {
      throw new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.machine_name_is_empty_or_invalid);
    }
    if (_.isEmpty(categoryName)) {
      throw new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.category_name_is_empty_or_invalid);
    }

    return await this.SettingsService.deleteCategoryKOTRelays(machineName, categoryName).catch((error) => {
      throw error;
    });
  }

  async resetBillingIndex() {
    var settings_id = this.request.params.id;

    let ALLOWED_SETTINGS = ["ACCELERATE_KOT_INDEX", "ACCELERATE_TOKEN_INDEX"];

    if (!ALLOWED_SETTINGS.includes(settings_id)) {
      throw new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.invalid_settings_name);
    }

    return await this.SettingsService.resetBillingIndex(settings_id).catch((error) => {
      throw error;
    });
  }
}

module.exports = SettingsController;
