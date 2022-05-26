"use strict";
let BaseController = ACCELERONCORE._controllers.BaseController;
let CustomerManagementService = require("../services/CustomerManagementService");

var _ = require("underscore");

class CustomerManagementController extends BaseController {
  constructor(request) {
    super(request);
    this.CustomerManagementService = new CustomerManagementService(request);
  }

  async getCustomerData() {
    var mobile = this.request.params.id;

    if (_.isEmpty(mobile)) {
      throw new ErrorResponse(
        ResponseType.BAD_REQUEST,
        ErrorType.mobile_number_is_missing
      );
    }
      return await this.CustomerManagementService.getCustomerData(mobile).catch((error) => {
        throw error;
      });
    }

  async addNewCustomer() {
    var new_customer_data = this.request.body.new_customer_data;
    var accelerate_licencee_branch =
      this.request.body.accelerate_licencee_branch;

    if (_.isEmpty(new_customer_data)) {
      throw new ErrorResponse(
        ResponseType.BAD_REQUEST,
        ErrorType.missing_new_customer_data
      );
    }

    return await this.CustomerManagementService.addNewCustomer(
      accelerate_licencee_branch,
      new_customer_data
    ).catch((error) => {
      throw error;
    });
  }

  async updateCustomerAddress() {
    var newAddress = this.request.body;
    var mobile = this.request.params.id;

    if (_.isEmpty(newAddress) || _.isEmpty(mobile)) {
      throw new ErrorResponse(
        ResponseType.BAD_REQUEST,
        ErrorType.missing_required_parameters
      );
    }

    return await this.CustomerManagementService.updateCustomerAddress(
      mobile,
      newAddress
    ).catch((error) => {
      throw error;
    });
  }
}

module.exports = CustomerManagementController;
