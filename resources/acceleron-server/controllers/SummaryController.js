"use strict";
let BaseController = ACCELERONCORE._controllers.BaseController;
let SummaryService = require("../services/SummaryService");
var _ = require("underscore");
var moment = require("moment");

// a function to do initial validation
function initialValidator(ALLOWED_FILTERS, filter_name, from_date, to_date) {
  if (!ALLOWED_FILTERS.includes(filter_name)) {
    throw new ErrorResponse(
      ResponseType.BAD_REQUEST,
      ErrorType.filter_name_is_empty_or_invalid
    );
  }
  if (_.isEmpty(from_date) || _.isEmpty(to_date)) {
    throw new ErrorResponse(
      ResponseType.BAD_REQUEST,
      ErrorType.missing_required_parameters
    );
  }
  if (from_date > to_date) {
    throw new ErrorResponse(
      ResponseType.BAD_REQUEST,
      ErrorType.from_date_should_be_greater_than_to_date
    );
  }
}
class SummaryController extends BaseController {
  constructor(request) {
    super(request);
    this.SummaryService = new SummaryService(request);
  }

  async fetchSummaryByFilter() {
    let self = this;
    var from_date = self.request.query.startdate;
    var to_date = self.request.query.enddate;
    var curr_date = moment().format("YYYYMMDD");
    var filter_name = self.request.params.filterName;
    var filter_parameters = [];

    var ALLOWED_FILTERS = ["BILLING_MODE", "PAYMENT_MODE", "SESSIONS"];

    initialValidator(ALLOWED_FILTERS, filter_name, from_date, to_date);

    switch (filter_name) {
      case "BILLING_MODE": {
        try {
          const data = await self.SummaryService.getAllBillingModes();
          filter_parameters = data.value;
        } catch (error) {
          throw error;
        }
        break;
      }
      case "PAYMENT_MODE": {
        try {
          const data = await self.SummaryService.getAllPaymentModes();
          filter_parameters = data.value;
        } catch (error) {
          throw error;
        }
        break;
      }
      case "SESSIONS": {
        try {
          const data = await self.SummaryService.getAllDiningSessions();
          filter_parameters = data.value;
        } catch (error) {
          throw error;
        }
        break;
      }
    }
    try {
      const data = await self.SummaryService.fetchSummaryByFilter(
        filter_name,
        filter_parameters,
        from_date,
        to_date,
        curr_date
      );
      return data;
    } catch (error) {
      throw error;
    }
  }

  async fetchSummaryByFilterDetailed() {
    let self = this;
    var from_date = self.request.query.startdate;
    var to_date = self.request.query.enddate;
    var filter_name = self.request.params.filterName;
    var filter_parameter = self.request.params.filterParameter;
    var split_parameters = [];
    var ALLOWED_FILTER_PARAMETERS = [];

    var ALLOWED_FILTERS = ["BILLING_MODE", "PAYMENT_MODE"];

    initialValidator(ALLOWED_FILTERS, filter_name, from_date, to_date);

    switch (filter_name) {
      case "BILLING_MODE": {
        if (_.isEmpty(filter_parameter)) {
          throw new ErrorResponse(
            ResponseType.BAD_REQUEST,
            ErrorType.missing_required_parameters
          );
        }

        try {
          const data = await self.SummaryService.getAllBillingModes();
          for (var i = 0; i < data.value.length; i++) {
            ALLOWED_FILTER_PARAMETERS = [
              ...ALLOWED_FILTER_PARAMETERS,
              data.value[i].name,
            ];
          }
        } catch (error) {
          throw error;
        }

        if (!ALLOWED_FILTER_PARAMETERS.includes(filter_parameter)) {
          throw new ErrorResponse(
            ResponseType.BAD_REQUEST,
            "Not a valid billing mode"
          );
        }

        try {
          const data = await self.SummaryService.getAllPaymentModes();
          split_parameters = data.value;
        } catch (error) {
          throw error;
        }
        break;
      }
      case "PAYMENT_MODE": {
        if (_.isEmpty(filter_parameter)) {
          throw new ErrorResponse(
            ResponseType.BAD_REQUEST,
            ErrorType.missing_required_parameters
          );
        }

        try {
          const data = await self.SummaryService.getAllPaymentModes();
          for (var i = 0; i < data.value.length; i++) {
            ALLOWED_FILTER_PARAMETERS = [
              ...ALLOWED_FILTER_PARAMETERS,
              data.value[i].code,
            ];
          }
        } catch (error) {
          throw error;
        }

        if (!ALLOWED_FILTER_PARAMETERS.includes(filter_parameter)) {
          throw new ErrorResponse(
            ResponseType.BAD_REQUEST,
            "Not a valid payment mode"
          );
        }

        try {
          const data = await self.SummaryService.getAllBillingParameters();
          split_parameters = data.value;
        } catch (error) {
          throw error;
        }
        break;
      }
    }
    try {
      const data = await self.SummaryService.fetchSummaryByFilterDetailed(
        filter_name,
        filter_parameter,
        split_parameters,
        from_date,
        to_date
      );
      return data;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = SummaryController;
