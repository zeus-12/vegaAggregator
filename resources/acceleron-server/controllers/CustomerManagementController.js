"use strict";
let BaseController = ACCELERONCORE._controllers.BaseController;
let CustomerManangementService = require("../services/CustomerManangementService");

var _ = require("underscore");

class CustomerManangementController extends BaseController {
  constructor(request) {
    super(request);
    this.CustomerManangementService = new CustomerManangementService(request);
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

    return await this.CustomerManangementService.addNewCustomer(
      accelerate_licencee_branch,
      new_customer_data
    ).catch((error) => {
      throw error;
    });
  }

  async updateCustomerAddress() {
    var newAddress = this.request.body;
    var mobile = this.request.query.id;

    if (_.isEmpty(newAddress) || _.isEmpty(mobile)) {
      throw new ErrorResponse(
        ResponseType.BAD_REQUEST,
        ErrorType.missing_required_parameters
      );
    }

    return await this.CustomerManangementService.updateCustomerAddress(
      mobile,
      newAddress
    ).catch((error) => {
      throw error;
    });
  }
}

module.exports = CustomerManangementController;
