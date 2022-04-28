"use strict";
let BaseService = ACCELERONCORE._services.BaseService;
let CustomerManangementModel = require("../models/CustomerManangementModel");

var _ = require("underscore");
var async = require("async");

class CustomerManangementService extends BaseService {
  constructor(request) {
    super(request);
    this.request = request;
    this.CustomerManangementModel = new CustomerManangementModel(request);
  }

  async addNewCustomer(newCustomerData) {
    // hardcoded for now. to be removed once auth is implemented
    var accelerate_licencee_branch = "ADYAR";

    newCustomerData._id = newCustomerData.mobile;
    newCustomerData.branch = accelerate_licencee_branch;

    return await this.CustomerManangementModel.addNewCustomer(
      newCustomerData
    ).catch((error) => {
      throw error;
    });
  }

  async updateCustomerAddress(mobile, newAddress) {
    const data = await this.CustomerManangementModel.getCustomerData(
      mobile
    ).catch((error) => {
      throw error;
    });

    if (_.isEmpty(data)) {
      throw new ErrorResponse(
        ResponseType.NO_RECORD_FOUND,
        ErrorType.no_matching_results
      );
    }

    if ((data._id = "")) {
      throw new ErrorResponse(
        ResponseType.NO_RECORD_FOUND,
        ErrorType.customer_address_on_the_server_was_not_updated
      );
    }

    var userData = data;
    userData.savedAddresses.push(newAddress);

    return await this.CustomerManangementModel.updateCustomerData(
      mobile,
      userData
    ).catch((error) => {
      throw error;
    });
  }
}

module.exports = CustomerManangementService;
