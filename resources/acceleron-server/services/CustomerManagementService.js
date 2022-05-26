"use strict";
let BaseService = ACCELERONCORE._services.BaseService;
let CustomerManagementModel = require("../models/CustomerManagementModel");

var _ = require("underscore");
var async = require("async");

class CustomerManagementService extends BaseService {
  constructor(request) {
    super(request);
    this.request = request;
    this.CustomerManagementModel = new CustomerManagementModel(request);
  }

  async getCustomerData(mobile) {
    const data = await this.CustomerManagementModel.getCustomerData(mobile).catch((error) => {
      throw error;
    });

    if (_.isEmpty(data)) {
      throw new ErrorResponse(ResponseType.NO_RECORD_FOUND, ErrorType.no_matching_results);
    }

    if ((data._id == "")) {
      throw new ErrorResponse(ResponseType.NO_RECORD_FOUND, ErrorType.Customer_not_found);
    }

    return data;
  }

  async isCustomerExists(mobile) {
    const data = await this.CustomerManagementModel.getCustomerData(mobile).catch((error) => {
      return false;
    });

    if (!_.isEmpty(data) && data._id != "") {
      return true;
    }
    else {
      return false;
    }
  }

  async addNewCustomer(newCustomerData) {
    // hardcoded for now. to be removed once auth is implemented
    var accelerate_licencee_branch = "ADYAR";

    newCustomerData._id = newCustomerData.mobile;
    newCustomerData.branch = accelerate_licencee_branch;

    return await this.CustomerManagementModel.addNewCustomer(newCustomerData).catch((error) => {
      throw error;
    });
  }

  async updateCustomerAddress(mobile, newAddress) {
    const data = await this.CustomerManagementModel.getCustomerData(mobile).catch((error) => {
      throw error;
    });

    if (_.isEmpty(data)) {
      throw new ErrorResponse(ResponseType.NO_RECORD_FOUND, ErrorType.no_matching_results);
    }

    if ((data._id = "")) {
      throw new ErrorResponse(ResponseType.NO_RECORD_FOUND, ErrorType.customer_address_on_the_server_was_not_updated);
    }

    var userData = data;
    userData.savedAddresses.push(newAddress);

    return await this.CustomerManagementModel.updateCustomerData(mobile, userData).catch((error) => {
      throw error;
    });
  }
}

module.exports = CustomerManagementService;
