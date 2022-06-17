"use strict";
let BaseController = ACCELERONCORE._controllers.BaseController;
let OrderService = require("../services/OrderService");

var _ = require("underscore");
const ErrorType = require("../utils/errorConstants");

class OrderController extends BaseController {
  constructor(request) {
    super(request);
    this.OrderService = new OrderService(request);
  }
  async newOrder() {
    var newOrderData = this.request.body;

    if (_.isEmpty(newOrderData)) {
      throw new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.missing_required_parameters);
    }

    if (newOrderData.cart_products.length == 0) {
      throw new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.empty_cart);
    }

    if (_.isEmpty(newOrderData.selectedBillingModeInfo)) {
      throw new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.missing_billing_mode_info);
    }

    if (_.isEmpty(newOrderData.customerInfo)) {
      throw new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.missing_customer_info);
    }

    return await this.OrderService.generateNewKOT(newOrderData).catch((error) => {
      throw error;
    });
  }

  async updateOrderItems() {
    var KOTNumber = this.request.params.id;
    var updateData = this.request.body;

    if (_.isEmpty(KOTNumber) || _.isEmpty(updateData)) {
      throw new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.missing_required_parameters);
    }

    if (updateData.cart_products.length == 0) {
      throw new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.empty_cart);
    }

    if (_.isEmpty(updateData.customerInfo)) {
      throw new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.missing_customer_info);
    }

    return await this.OrderService.updateOrderItems(KOTNumber, updateData).catch((error) => {
      throw error;
    });
  }

  async saveOrder() {
    var newHoldingOrder = this.request.body;

    if (_.isEmpty(newHoldingOrder)) {
      throw new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.missing_required_parameters);
    }

    if (newHoldingOrder.cart_products.length == 0) {
      throw new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.empty_cart);
    }

    if (newHoldingOrder.customerInfo.length == 0) {
      throw new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.missing_customer_info);
    }

    return await this.OrderService.saveOrder(newHoldingOrder).catch((error) => {
      throw error;
    });
  }

  async clearAllSavedOrders() {
    return await this.OrderService.clearAllSavedOrders().catch((error) => {
      throw error;
    });
  }

  async removeSavedOrder() {
    var orderId = this.request.params.id;

    if (_.isEmpty(orderId)) {
      throw new ErrorResponse(ResponseType.BAD_REQUEST, ErrorType.missing_required_parameters);
    }

    return await this.OrderService.removeSavedOrder(orderId).catch((error) => {
      throw error;
    });
  }
}

module.exports = OrderController;
