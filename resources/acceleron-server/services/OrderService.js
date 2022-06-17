"use strict";
let BaseService = ACCELERONCORE._services.BaseService;
let CommonModel = require("../models/CommonModel");
let OrderModel = require("../models/OrderModel");
let SettingsService = require("./SettingsService");
let SummaryService = require("./SummaryService");
let KOTService = require("./KOTService");
let TableService = require("./TableService");
let CustomerManagementService = require("./CustomerManagementService");
var moment = require("moment");

var _ = require("underscore");
var async = require("async");
const ErrorResponse = require("../../acceleron-core/utils/ErrorResponse");
const ErrorType = require("../utils/errorConstants");

class OrderService extends BaseService {
  constructor(request) {
    super(request);
    this.request = request;
    this.CommonModel = new CommonModel(request);
    this.OrderModel = new OrderModel(request);
    this.SettingsService = new SettingsService(request);
    this.SummaryService = new SummaryService(request);
    this.CustomerManagementService = new CustomerManagementService(request);
    this.KOTService = new KOTService(request);
    this.TableService = new TableService(request);
  }

  async generateNewKOT(newOrderData) {
    // hardcoded for now. to be removed once auth is implemented
    var loggedInStaffInfoName = "Default";
    var loggedInStaffInfoCode = "0000000000";
    var accelerate_licencee_branch = "ADYAR";
    var accelerate_licence_machineUID = "Z1500";

    let data = {};

    data = await this.SummaryService.getAllBillingParameters().catch((error) => {
      throw error;
    });
    if (_.isEmpty(data)) {
      throw new ErrorResponse(ResponseType.NO_RECORD_FOUND, ErrorType.bill_param_data_not_found);
    }

    var params = data.value;

    var selectedModeExtrasList = newOrderData.selectedBillingModeInfo.extras;
    var cartExtrasList = [];

    if (selectedModeExtrasList == undefined) {
      throw new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.missing_extras_in_billing_mode);
    }

    var n = 0;
    var m = 0;
    while (selectedModeExtrasList[n]) {
      m = 0;
      while (params[m]) {
        if (selectedModeExtrasList[n].name == params[m].name) {
          params[m].value = parseFloat(selectedModeExtrasList[n].value);
          cartExtrasList.push(params[m]);
        }

        m++;
      }
      n++;
    }

    /*Process Figures*/
    var subTotal = 0;
    var packagedSubTotal = 0;

    var minimum_cooking_time = 0;

    var n = 0;
    let cart_products = newOrderData.cart_products;
    while (cart_products[n]) {
      /* min cooking time */
      if (cart_products[n].cookingTime && cart_products[n].cookingTime > 0) {
        if (minimum_cooking_time <= cart_products[n].cookingTime) {
          minimum_cooking_time = cart_products[n].cookingTime;
        }
      }

      subTotal += cart_products[n].qty * cart_products[n].price;

      if (cart_products[n].isPackaged) {
        packagedSubTotal += cart_products[n].qty * cart_products[n].price;
      }

      n++;
    }

    /*Calculate Taxes and Other Charges*/

    //Note: Skip tax and other extras (with isCompulsary no) on packaged food Pepsi ect. (marked with 'isPackaged' = true)

    var otherCharges = [];
    var k = 0;

    if (cartExtrasList.length > 0) {
      for (k = 0; k < cartExtrasList.length; k++) {
        var tempExtraTotal = 0;

        if (cartExtrasList[k].value != 0) {
          if (cartExtrasList[k].excludePackagedFoods) {
            if (cartExtrasList[k].unit == "PERCENTAGE") {
              tempExtraTotal = (cartExtrasList[k].value * (subTotal - packagedSubTotal)) / 100;
            } else if (cartExtrasList[k].unit == "FIXED") {
              tempExtraTotal = cartExtrasList[k].value;
            }
          } else {
            if (cartExtrasList[k].unit == "PERCENTAGE") {
              tempExtraTotal = (cartExtrasList[k].value * subTotal) / 100;
            } else if (cartExtrasList[k].unit == "FIXED") {
              tempExtraTotal = cartExtrasList[k].value;
            }
          }
        }

        tempExtraTotal = Math.round(tempExtraTotal * 100) / 100;

        otherCharges.push({
          name: cartExtrasList[k].name,
          value: cartExtrasList[k].value,
          unit: cartExtrasList[k].unit,
          amount: tempExtraTotal,
          isPackagedExcluded: cartExtrasList[k].excludePackagedFoods,
        });
      }
    }

    let customerInfo = newOrderData.customerInfo;

    if (customerInfo.mappedAddress == "" && customerInfo.modeType != "PARCEL") {
      switch (customerInfo.modeType) {
        case "TOKEN": {
          throw new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.Token_is_not_set);
          break;
        }
        case "PARCEL": {
          throw new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.Token_is_not_set);
          break;
        }
        case "DELIVERY": {
          throw new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.Delivery_Address_is_not_set);
          break;
        }
        case "DINE": {
          throw new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.Table_not_selected);
          break;
        }
        default: {
          throw new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.Table_Number_or_Address_Missing);
          break;
        }
      }
    }

    /* customerInfo.json
		{
			"name": "Anas Jafry",
			"mobile": "9884179675",
			"mode": "Dine AC",
			"mappedAddress": "T3",
			"reference": "Ref. to any other API (say booking number)"
		}
	*/

    var orderMetaInfo = {};
    orderMetaInfo.mode = customerInfo.mode;
    orderMetaInfo.modeType = customerInfo.modeType;
    orderMetaInfo.reference = customerInfo.reference;
    orderMetaInfo.isOnline = customerInfo.isOnline;

    //User not found in DB ==> Add USER to DB
    var isUserFound = await this.CustomerManagementService.isCustomerExists(customerInfo.mobile);

    if (!isUserFound) {
      if (customerInfo.mobile != "") {
        var customerObject = {
          name: customerInfo.name,
          mobile: customerInfo.mobile,
          savedAddresses: [],
        };

        if (customerInfo.modeType == "DELIVERY") {
          var address = JSON.parse(decodeURI(customerInfo.mappedAddress));

          customerObject.savedAddresses.push({
            id: 1,
            name: address.name,
            flatNo: address.flatNo,
            flatName: address.flatName,
            landmark: address.landmark,
            area: address.area,
            contact: address.contact,
          });
        }

        // addCustomerToDatabase
        try {
          await this.CustomerManagementService.addNewCustomer(customerObject);
        } catch (error) {
          throw error;
        }
      }
    }

    //Precheck if the table is free (for DINE orders alone)
    if (customerInfo.modeType == "DINE") {
      var table_req = customerInfo.mappedAddress;

      if (table_req != "" && table_req != "None") {
        data = await this.OrderModel.getTableStatus(table_req).catch((error) => {
          throw error;
        });
        if (_.isEmpty(data)) {
          throw new ErrorResponse(ResponseType.NO_RECORD_FOUND, ErrorType.Unable_to_read_Table_info);
        } else if (data.rows.length >= 1) {
          throw new ErrorResponse(
            ResponseType.CONFLICT,
            "Table <b>" + table_req + "</b> is not free. Please check in <b>Live Orders</b>"
          );
        }
      }
    }

    //PROCESS KOT --> All set... Punch KOT now!
    data = await this.SettingsService.getSettingsById("ACCELERATE_KOT_INDEX").catch((error) => {
      throw error;
    });
    if (_.isEmpty(data)) {
      throw new ErrorResponse(ResponseType.NO_RECORD_FOUND, ErrorType.KOT_Index_data_not_found);
    }

    var num = parseInt(data.value) + 1;
    var kot = "K" + num;

    var memory_revID = data._rev;

    //Update KOT number on server
    var updateData = {
      _rev: memory_revID,
      identifierTag: "ACCELERATE_KOT_INDEX",
      value: num,
    };

    await this.SettingsService.updateSettingsById("ACCELERATE_KOT_INDEX", updateData).catch((error) => {
      throw new ErrorResponse(ResponseType.ERROR, ErrorType.unable_to_update_kot_index);
    });

    var today = moment().format("DD-MM-YYYY");
    var time = moment().format("HHmm");

    var obj = {};
    obj.KOTNumber = kot;
    obj.orderDetails = orderMetaInfo;
    obj.table = customerInfo.mappedAddress;

    obj.customerName = customerInfo.name;
    obj.customerMobile = customerInfo.mobile;
    obj.guestCount = customerInfo.count && customerInfo.count != "" ? parseInt(customerInfo.count) : "";

    obj.machineName = accelerate_licence_machineUID;

    obj.sessionName = newOrderData.currentSessionName ? newOrderData.currentSessionName : "";

    obj.stewardName = loggedInStaffInfoName;
    obj.stewardCode = loggedInStaffInfoCode;

    obj.date = today;
    obj.timePunch = time;
    obj.timeKOT = "";
    obj.timeBill = "";
    obj.timeSettle = "";

    obj.cart = cart_products;
    obj.specialRemarks = newOrderData.specialRequests_comments ? newOrderData.specialRequests_comments : "";
    obj.allergyInfo = newOrderData.allergicIngredientsData ? newOrderData.allergicIngredientsData : [];

    obj.extras = otherCharges;
    obj.discount = {};
    obj.customExtras = {};

    obj._id = accelerate_licencee_branch + "_KOT_" + kot;
    var responseObj = {
      cart: obj.cart,
      minimum_cooking_time,
    };

    try {
      await this.KOTService.createNewKOT(obj);
      return responseObj;
    } catch (error) {
      throw error;
    }
  }

  async updateOrderItems(KOTNumber, updateData) {
    // hardcoded for now. to be removed once auth is implemented
    var loggedInStaffInfo = {
      name: "Default",
      code: "0000000000",
      role: "ADMIN",
    };
    var accelerate_licencee_branch = "ADYAR";
    var accelerate_licence_machineUID = "Z1500";

    let data = {};
    var kot_id = accelerate_licencee_branch + "_KOT_" + KOTNumber;

    data = await this.KOTService.getKOTById(kot_id).catch((error) => {
      throw error;
    });
    if (_.isEmpty(data) || data._id == "") {
      throw new ErrorResponse(
        ResponseType.NO_RECORD_FOUND,
        "KOT #" + KOTNumber + " not found on the Server, might have billed already."
      );
    }

    var originalData = data;

    // if (originalData.cart != updateData.cart_products) {
    //   throw new ErrorResponse(
    //     ResponseType.CONFLICT,
    //     "KOT #" + KOTNumber + " already billed. Please check in <b>Live Orders</b>"
    //   );
    // }

    var changedCustomerInfo = updateData.customerInfo;
    var changed_cart_products = updateData.cart_products;

    //Check if Item Deleted or Count Decreased (only Admins can do this!)
    var hasRestrictedEdits = false;

    //Track changes in the KOT
    var comparisonResult = [];

    //Compare changes in the Cart
    var original_cart_products = originalData.cart;

    //Search for changes in the existing items
    for (var j = 0; j < original_cart_products.length; j++) {
      this.checkForItemChanges(original_cart_products[j], comparisonResult, changed_cart_products, hasRestrictedEdits);
    }

    //Search for new additions to the Cart
    for (j = 0; j < changed_cart_products.length; j++) {
      this.checkForNewItems(original_cart_products, changed_cart_products[j], comparisonResult);
    }

    var item_delete_track = [];
    var e = 0;
    while (comparisonResult[e]) {
      if (comparisonResult[e].change == "QUANTITY_DECREASE") {
        var trackItem = {
          code: comparisonResult[e].code,
          name: comparisonResult[e].name,
          category: comparisonResult[e].category,
          price: comparisonResult[e].price,
          isCustom: comparisonResult[e].isCustom,
          variant: comparisonResult[e].isCustom ? comparisonResult[e].variant : "",
          qty: comparisonResult[e].oldValue - comparisonResult[e].qty,
        };

        item_delete_track.push(trackItem);
      } else if (comparisonResult[e].change == "ITEM_DELETED") {
        var trackItem = {
          code: comparisonResult[e].code,
          name: comparisonResult[e].name,
          category: comparisonResult[e].category,
          price: comparisonResult[e].price,
          isCustom: comparisonResult[e].isCustom,
          variant: comparisonResult[e].isCustom ? comparisonResult[e].variant : "",
          qty: comparisonResult[e].qty,
        };

        item_delete_track.push(trackItem);
      }

      e++;
    }

    var isUserAnAdmin = false;
    if (loggedInStaffInfo.code != "" && loggedInStaffInfo.role == "ADMIN") {
      isUserAnAdmin = true;
    }

    if (hasRestrictedEdits && !isUserAnAdmin) {
      throw new ErrorResponse(ResponseType.NO_AUTH, ErrorType.only_admin_can_edit_item);
    }

    var kot_request_data = accelerate_licencee_branch + "_KOT_" + originalData.KOTNumber;

    data = await this.KOTService.getKOTById(kot_request_data).catch((error) => {
      throw error;
    });
    if (_.isEmpty(data)) {
      throw new ErrorResponse(ResponseType.NO_RECORD_FOUND, "KOT #" + KOTNumber + " not found on the Server.");
    }

    if (data._id == "") {
      throw new ErrorResponse(ResponseType.NO_RECORD_FOUND, "KOT #" + KOTNumber + " not found on the Server.");
    }

    var kot = data;

    //Updates the KOT
    kot.customerMobile = changedCustomerInfo.mobile;
    kot.customerName = changedCustomerInfo.name;
    kot.guestCount = parseInt(changedCustomerInfo.count);
    kot.timeKOT = moment().format("HHmm");
    kot.cart = changed_cart_products;

    if (!_.isEmpty(updateData.specialRequests_comments)) {
      kot.specialRemarks = updateData.specialRequests_comments;
    }

    kot.allergyInfo = updateData.allergicIngredientsData ? updateData.allergicIngredientsData : [];

    /* RECALCULATE New Figures*/
    var subTotal = 0;
    var packagedSubTotal = 0;

    var n = 0;
    while (kot.cart[n]) {
      subTotal = subTotal + kot.cart[n].qty * kot.cart[n].price;

      if (kot.cart[n].isPackaged) {
        packagedSubTotal += kot.cart[n].qty * kot.cart[n].price;
      }

      n++;
    }

    /*Calculate Discounts if Any*/
    var net_discount_applied = 0;
    if (kot.discount) {
      var tempExtraTotal = 0;
      if (kot.discount.value != 0) {
        if (kot.discount.unit == "PERCENTAGE") {
          tempExtraTotal = (kot.discount.value * subTotal) / 100;
        } else if (kot.discount.unit == "FIXED") {
          tempExtraTotal = kot.discount.value;
        }
      }

      tempExtraTotal = Math.round(tempExtraTotal * 100) / 100;
      net_discount_applied = tempExtraTotal;
      kot.discount.amount = tempExtraTotal;

      if (net_discount_applied > subTotal) {
        tempExtraTotal = subTotal;
        kot.discount.amount = tempExtraTotal;
      }
    }

    var applicable_sum_for_all = subTotal - net_discount_applied;
    var applicable_sum_for_packaged = subTotal - packagedSubTotal - net_discount_applied;

    if (applicable_sum_for_all < 0) {
      applicable_sum_for_all = 0;
    }

    if (applicable_sum_for_packaged < 0) {
      applicable_sum_for_packaged = 0;
    }

    /*Calculate Taxes and Other Charges*/
    var k = 0;
    if (kot.extras.length > 0) {
      for (k = 0; k < kot.extras.length; k++) {
        var tempExtraTotal = 0;

        if (kot.extras[k].isPackagedExcluded) {
          if (kot.extras[k].value != 0) {
            if (kot.extras[k].unit == "PERCENTAGE") {
              tempExtraTotal = (kot.extras[k].value * applicable_sum_for_packaged) / 100;
            } else if (kot.extras[k].unit == "FIXED") {
              tempExtraTotal = kot.extras[k].value;
            }
          }
        } else {
          if (kot.extras[k].value != 0) {
            if (kot.extras[k].unit == "PERCENTAGE") {
              tempExtraTotal = (kot.extras[k].value * applicable_sum_for_all) / 100;
            } else if (kot.extras[k].unit == "FIXED") {
              tempExtraTotal = kot.extras[k].value;
            }
          }
        }

        tempExtraTotal = Math.round(tempExtraTotal * 100) / 100;

        kot.extras[k] = {
          name: kot.extras[k].name,
          value: kot.extras[k].value,
          unit: kot.extras[k].unit,
          amount: tempExtraTotal,
          isPackagedExcluded: kot.extras[k].isPackagedExcluded,
        };
      }
    }

    /*Calculate Custom Extras if Any*/
    if (kot.customExtras) {
      var tempExtraTotal = 0;
      if (kot.customExtras.value != 0) {
        if (kot.customExtras.unit == "PERCENTAGE") {
          tempExtraTotal = (kot.customExtras.value * applicable_sum_for_all) / 100;
        } else if (kot.customExtras.unit == "FIXED") {
          tempExtraTotal = kot.customExtras.value;
        }
      }

      tempExtraTotal = Math.round(tempExtraTotal * 100) / 100;

      kot.customExtras.amount = tempExtraTotal;
    }

    var minimum_cooking_time = 0;

    for (var t = 0; t < comparisonResult.length; t++) {
      if (comparisonResult[t].change == "NEW_ITEM" || comparisonResult[t].change == "QUANTITY_INCREASE") {
        /* min cooking time */
        if (comparisonResult[t].cookingTime && comparisonResult[t].cookingTime > 0) {
          if (minimum_cooking_time <= comparisonResult[t].cookingTime) {
            minimum_cooking_time = comparisonResult[t].cookingTime;
          }
        }
      }
    }

    try {
      await this.KOTService.updateKOTById(kot._id, kot);
      return { minimum_cooking_time };
    } catch (error) {
      throw error;
    }
  }

  async checkForItemChanges(checkingItem, comparisonResult, changed_cart_products, hasRestrictedEdits) {
    //Find each item in original cart in the changed cart
    var itemFound = false;
    for (var i = 0; i < changed_cart_products.length; i++) {
      //same item found, check for its quantity and report changes
      if (
        checkingItem.code == changed_cart_products[i].code &&
        checkingItem.cartIndex == changed_cart_products[i].cartIndex
      ) {
        itemFound = true;

        //Change in Quantity
        if (changed_cart_products[i].qty > checkingItem.qty) {
          //qty increased

          var tempItem = changed_cart_products[i];
          tempItem.change = "QUANTITY_INCREASE";
          tempItem.oldValue = checkingItem.qty;
          if (changed_cart_products[i].comments != "" && checkingItem.comments != changed_cart_products[i].comments) {
            tempItem.newComments = changed_cart_products[i].comments;
          }
          comparisonResult.push(tempItem);
        } else if (changed_cart_products[i].qty < checkingItem.qty) {
          //qty decreased

          var tempItem = changed_cart_products[i];
          tempItem.change = "QUANTITY_DECREASE";
          tempItem.oldValue = checkingItem.qty;
          if (changed_cart_products[i].comments != "" && checkingItem.comments != changed_cart_products[i].comments) {
            tempItem.newComments = changed_cart_products[i].comments;
          }
          comparisonResult.push(tempItem);

          hasRestrictedEdits = true;
        } else {
          //same qty
        }

        break;
      }

      //Last iteration to find the item
      if (i == changed_cart_products.length - 1) {
        if (!itemFound) {
          //Item Deleted

          var tempItem = checkingItem;

          tempItem.change = "ITEM_DELETED";
          tempItem.oldValue = "";
          if (changed_cart_products[i].comments != "" && checkingItem.comments != changed_cart_products[i].comments) {
            tempItem.newComments = changed_cart_products[i].comments;
          }
          comparisonResult.push(tempItem);

          hasRestrictedEdits = true;
        }
      }
    }
  }

  async checkForNewItems(original_cart_products, changed_product, comparisonResult) {
    for (var m = 0; m < original_cart_products.length; m++) {
      //check if item is found, not found implies New Item!
      if (
        changed_product.cartIndex == original_cart_products[m].cartIndex &&
        changed_product.code == original_cart_products[m].code
      ) {
        //Item Found
        break;
      }

      //Last iteration to find the item
      if (m == original_cart_products.length - 1) {
        var tempItem = changed_product;
        tempItem.change = "NEW_ITEM";
        tempItem.oldValue = "";
        if (changed_product.comments != "") {
          tempItem.newComments = changed_product.comments;
        }

        comparisonResult.push(tempItem);
      }
    }
  }

  async saveOrder(newHoldingOrder) {
    newHoldingOrder.timestamp = moment().format("HHmm");
    let data = {}

    try {
      data = await this.SettingsService.addNewEntryToSettings("ACCELERATE_SAVED_ORDERS", newHoldingOrder);
      //renderCustomerInfo()
    }
    catch (error) {
      throw error;
    }

    //Mark the table as 'Reserved' if added to hold list
    if (newHoldingOrder.customerInfo.modeType == "DINE" && newHoldingOrder.customerInfo.mappedAddress != "") {
      await this.TableService.addTableToReserveList(newHoldingOrder.customerInfo.mappedAddress, "Hold Order").catch(
        (error) => {
          throw error;
        }
      );
    }

    return data;
  }

  async clearAllSavedOrders() {
    let data = {};
    data = await this.SettingsService.getSettingsById("ACCELERATE_SAVED_ORDERS").catch((error) => {
      throw error;
    });

    var holding_orders = [];

    //Update
    var updateData = {
      _rev: data._rev,
      identifierTag: "ACCELERATE_SAVED_ORDERS",
      value: holding_orders,
    };

    try {
      data = this.SettingsService.updateSettingsById("ACCELERATE_SAVED_ORDERS", updateData);
      await this.TableService.clearSavedOrderMappingFromTables().catch((error) => {
        throw error;
      });
      //renderCustomerInfo()
    } catch (error) {
      throw error;
    }

    return data;
  }

  async removeSavedOrder(orderId) { 
    let data = {};

    try {
      data = await this.SettingsService.removeEntryFromSettings("ACCELERATE_SAVED_ORDERS", orderId);
      //renderCustomerInfo()
    } catch (error) {
      throw error;
    }

    return data;
  }
}

module.exports = OrderService;
