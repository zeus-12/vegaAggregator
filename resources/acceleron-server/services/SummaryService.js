"use strict";
let BaseService = ACCELERONCORE._services.BaseService;
let SummaryModel = require("../models/SummaryModel");
let SettingsService = require("./SettingsService");

var _ = require("underscore");

class SummaryService extends BaseService {
  constructor(request) {
    super(request);
    this.request = request;
    this.SummaryModel = new SummaryModel(request);
    this.SettingsService = new SettingsService(request);
  }

  async getAllBillingModes() {
    let self = this;
    const data = await self.SettingsService.getSettingsById(
      "ACCELERATE_BILLING_MODES"
    ).catch((error) => {
      throw error;
    });
    if (_.isEmpty(data)) {
      throw new ErrorResponse(
        ResponseType.NO_RECORD_FOUND,
        ErrorType.no_matching_results
      );
    } else {
      return data;
    }
  }

  async getAllPaymentModes() {
    let self = this;
    const data = await self.SettingsService.getSettingsById(
      "ACCELERATE_PAYMENT_MODES"
    ).catch((error) => {
      throw error;
    });
    if (_.isEmpty(data)) {
      throw new ErrorResponse(
        ResponseType.NO_RECORD_FOUND,
        ErrorType.no_matching_results
      );
    } else {
      return data;
    }
  }

  async getAllDiningSessions() {
    let self = this;
    const data = await self.SettingsService.getSettingsById(
      "ACCELERATE_DINE_SESSIONS"
    ).catch((error) => {
      throw error;
    });
    if (_.isEmpty(data)) {
      throw new ErrorResponse(
        ResponseType.NO_RECORD_FOUND,
        ErrorType.no_matching_results
      );
    } else {
      return data;
    }
  }

  async getAllBillingParameters() {
    let self = this;
    const data = await self.SettingsService.getSettingsById(
      "ACCELERATE_BILLING_PARAMETERS"
    ).catch((error) => {
      throw error;
    });
    if (_.isEmpty(data)) {
      throw new ErrorResponse(
        ResponseType.NO_RECORD_FOUND,
        ErrorType.no_matching_results
      );
    } else {
      return data;
    }
  }

  async fetchSummaryByFilter(
    filter_name,
    filter_parameters,
    from_date,
    to_date,
    curr_date
  ) {
    let self = this;
    let responseList = [
      {
        type: `${filter_name}`,
        summary: [],
      },
    ];
    let i = 0;
    let data = {};

    switch (filter_name) {
      case "BILLING_MODE": {
        //For a given BILLING MODE, the total Sales in the given DATE RANGE

        while (i < filter_parameters.length) {
          data = await self.SummaryModel.getSalesByBillingMode(
            filter_parameters[i].name,
            from_date,
            to_date
          ).catch((error) => {
            throw error;
          });
          if (_.isEmpty(data)) {
            throw new ErrorResponse(
              ResponseType.NO_RECORD_FOUND,
              ErrorType.no_matching_results
            );
          } else if (_.isEmpty(data.rows[0])) {
            responseList[0].summary.push({
              mode: filter_parameters[i].type,
              name: filter_parameters[i].name,
              sum: 0,
              count: 0,
            });
          } else {
            responseList[0].summary.push({
              mode: filter_parameters[i].type,
              name: filter_parameters[i].name,
              sum: data.rows[0].value.sum,
              count: data.rows[0].value.count,
            });
          }

          //Check for any refunds in this mode.

          data = await self.SummaryModel.getRefundsByBillingMode(
            filter_parameters[i].name,
            from_date,
            to_date
          ).catch((error) => {
            throw error;
          });
          if (_.isEmpty(data)) {
            throw new ErrorResponse(
              ResponseType.NO_RECORD_FOUND,
              ErrorType.no_matching_results
            );
          } else if (_.isEmpty(data.rows[0])) {
            responseList[0].summary[i] = {
              ...responseList[0].summary[i],
              refunds: 0,
            };
          } else {
            responseList[0].summary[i] = {
              ...responseList[0].summary[i],
              refunds: data.rows[0].value.sum,
            };
          }
          i++;
        }

        // To fetch live orders

        if (from_date == to_date && from_date == curr_date) {
          data = await self.SummaryModel.getUnbilledKOT().catch((error) => {
            throw error;
          });
          if (_.isEmpty(data)) {
            throw new ErrorResponse(
              ResponseType.NO_RECORD_FOUND,
              ErrorType.no_matching_results
            );
          } else if (_.isEmpty(data.rows[0])) {
            responseList.push({
              type: "Live_Orders",
              sum: 0,
              count: 0,
            });
          } else {
            responseList.push({
              type: "Live_Orders",
              sum: data.rows[0].value.sum,
              count: data.rows[0].value.count,
            });
          }

          //Check for any extras

          data = await self.SummaryModel.getUnbilledKOTExtras().catch(
            (error) => {
              throw error;
            }
          );
          if (_.isEmpty(data)) {
            throw new ErrorResponse(
              ResponseType.NO_RECORD_FOUND,
              ErrorType.no_matching_results
            );
          } else if (_.isEmpty(data.rows[0])) {
            responseList[1] = { ...responseList[1], extras: 0 };
          } else {
            responseList[1] = {
              ...responseList[1],
              extras: data.rows[0].value.sum,
            };
          }

          //check for unsettled bills

          data = await self.SummaryModel.getUnbilledBills(
            from_date,
            to_date
          ).catch((error) => {
            throw error;
          });
          if (_.isEmpty(data)) {
            throw new ErrorResponse(
              ResponseType.NO_RECORD_FOUND,
              ErrorType.no_matching_results
            );
          } else if (_.isEmpty(data.rows[0])) {
            responseList.push({
              type: "Pending_Settlement",
              sum: 0,
              count: 0,
            });
          } else {
            responseList.push({
              type: "Pending_Settlement",
              sum: data.rows[0].value.sum,
              count: data.rows[0].value.count,
            });
          }
          return responseList;
        } else {
          return responseList;
        }
        break;
      }
      case "PAYMENT_MODE": {
        while (i < filter_parameters.length) {
          //For a given PAYMENT MODE, the total Sales in the given DATE RANGE

          data = await self.SummaryModel.getSalesByPaymentMode(
            filter_parameters[i].code,
            from_date,
            to_date
          ).catch((error) => {
            throw error;
          });
          if (_.isEmpty(data)) {
            throw new ErrorResponse(
              ResponseType.NO_RECORD_FOUND,
              ErrorType.no_matching_results
            );
          } else if (_.isEmpty(data.rows[0])) {
            responseList[0].summary.push({
              mode: filter_parameters[i].code,
              name: filter_parameters[i].name,
              sum: 0,
              count: 0,
            });
          } else {
            responseList[0].summary.push({
              mode: filter_parameters[i].code,
              name: filter_parameters[i].name,
              sum: data.rows[0].value.sum,
              count: data.rows[0].value.count,
            });
          }

          //Now check in split payments

          data = await self.SummaryModel.getSplitPaymentsByPaymentMode(
            filter_parameters[i].code,
            from_date,
            to_date
          ).catch((error) => {
            throw error;
          });
          if (_.isEmpty(data)) {
            throw new ErrorResponse(
              ResponseType.NO_RECORD_FOUND,
              ErrorType.no_matching_results
            );
          } else if (_.isEmpty(data.rows[0])) {
            responseList[0].summary[i] = {
              ...responseList[0].summary[i],
              splitSum: 0,
              splitCount: 0,
            };
          } else {
            responseList[0].summary[i] = {
              ...responseList[0].summary[i],
              splitSum: data.rows[0].value.sum,
              splitCount: data.rows[0].value.count,
            };
          }

          //Check if any refunds issued

          data = await self.SummaryModel.getRefundsByPaymentMode(
            filter_parameters[i].code,
            from_date,
            to_date
          ).catch((error) => {
            throw error;
          });
          if (_.isEmpty(data)) {
            throw new ErrorResponse(
              ResponseType.NO_RECORD_FOUND,
              ErrorType.no_matching_results
            );
          } else if (_.isEmpty(data.rows[0])) {
            responseList[0].summary[i] = {
              ...responseList[0].summary[i],
              refunds: 0,
            };
          } else {
            responseList[0].summary[i] = {
              ...responseList[0].summary[i],
              refunds: data.rows[0].value.sum,
            };
          }
          i++;
        }
        return responseList;

        break;
      }
      case "SESSIONS": {
        let j = 0;
        var tempSum;
        var tempCount;
        var tempGuests;

        filter_parameters.push({ name: "Unknown" });

        //For a given SESSION, the total Sales in the given DATE RANGE

        data = await self.SummaryModel.getSalesBySessions(
          from_date,
          to_date
        ).catch((error) => {
          throw error;
        });
        if (_.isEmpty(data)) {
          throw new ErrorResponse(
            ResponseType.NO_RECORD_FOUND,
            ErrorType.no_matching_results
          );
        } else {
          while (i < filter_parameters.length) {
            tempSum = 0;
            tempCount = 0;
            tempGuests = 0;
            j = 0;
            while (j < data.rows.length) {
              if (filter_parameters[i].name == data.rows[j].key[1]) {
                tempSum = tempSum + data.rows[j].value;
                tempCount = tempCount + 1;
                tempGuests = tempGuests + data.rows[j].key[2];
              }
              j++;
            }
            responseList[0].summary.push({
              session: filter_parameters[i].name,
              sum: tempSum,
              count: tempCount,
              guests: tempGuests,
            });
            i++;
          }
        }

        return responseList;
        break;
      }
    }
  }

  async fetchSummaryByFilterDetailed(
    filter_name,
    filter_parameter,
    split_parameters,
    from_date,
    to_date
  ) {
    let self = this;
    let responseList = [
      {
        type: `${filter_name}`,
        summary: [],
      },
    ];
    let i = 0;
    let data = {};

    switch (filter_name) {
      case "BILLING_MODE": {
        while (i < split_parameters.length) {
          //For a given PAYMENT MODE and BILLING MODE, the total Sales in the given DATE RANGE

          data = await self.SummaryModel.getSalesByBillingAndPaymentMode(
            filter_parameter,
            split_parameters[i].code,
            from_date,
            to_date
          ).catch((error) => {
            throw error;
          });
          if (_.isEmpty(data)) {
            throw new ErrorResponse(
              ResponseType.NO_RECORD_FOUND,
              ErrorType.no_matching_results
            );
          } else if (_.isEmpty(data.rows[0])) {
            responseList[0].summary.push({
              mode: split_parameters[i].code,
              name: split_parameters[i].name,
              sum: 0,
              count: 0,
            });
          } else {
            responseList[0].summary.push({
              mode: split_parameters[i].code,
              name: split_parameters[i].name,
              sum: data.rows[0].value.sum,
              count: data.rows[0].value.count,
            });
          }

          //Now check in split payments

          data =
            await self.SummaryModel.getSplitPaymentsByBillingAndPaymentMode(
              filter_parameter,
              split_parameters[i].code,
              from_date,
              to_date
            ).catch((error) => {
              throw error;
            });
          if (_.isEmpty(data)) {
            throw new ErrorResponse(
              ResponseType.NO_RECORD_FOUND,
              ErrorType.no_matching_results
            );
          } else if (_.isEmpty(data.rows[0])) {
            responseList[0].summary[i] = {
              ...responseList[0].summary[i],
              splitSum: 0,
              splitCount: 0,
            };
          } else {
            responseList[0].summary[i] = {
              ...responseList[0].summary[i],
              splitSum: data.rows[0].value.sum,
              splitCount: data.rows[0].value.count,
            };
          }
          i++;
        }
        return responseList;
        break;
      }
      case "PAYMENT_MODE": {
        while (i < split_parameters.length) {
          //For a given EXTRAS, the total Sales in the given DATE RANGE

          data = await self.SummaryModel.getSalesByPaymentModeAndExtras(
            filter_parameter,
            split_parameters[i].name,
            from_date,
            to_date
          ).catch((error) => {
            throw error;
          });
          if (_.isEmpty(data)) {
            throw new ErrorResponse(
              ResponseType.NO_RECORD_FOUND,
              ErrorType.no_matching_results
            );
          } else if (_.isEmpty(data.rows[0])) {
            responseList[0].summary.push({
              name: split_parameters[i].name,
              sum: 0,
              count: 0,
            });
          } else {
            responseList[0].summary.push({
              name: split_parameters[i].name,
              sum: data.rows[0].value.sum,
              count: data.rows[0].value.count,
            });
          }

          //Now check in custom Extras

          data = await self.SummaryModel.getCustomExtrasByPaymentModeAndExtras(
            filter_parameter,
            split_parameters[i].name,
            from_date,
            to_date
          ).catch((error) => {
            throw error;
          });
          if (_.isEmpty(data)) {
            throw new ErrorResponse(
              ResponseType.NO_RECORD_FOUND,
              ErrorType.no_matching_results
            );
          } else if (_.isEmpty(data.rows[0])) {
            responseList[0].summary[i] = {
              ...responseList[0].summary[i],
              customExtrasSum: 0,
              customExtrasCount: 0,
            };
          } else {
            responseList[0].summary[i] = {
              ...responseList[0].summary[i],
              customExtrasSum: data.rows[0].value.sum,
              customExtrasCount: data.rows[0].value.count,
            };
          }

          //Now check in split payments

          data = await self.SummaryModel.getSplitPaymentsByPaymentModeAndExtras(
            filter_parameter,
            split_parameters[i].name,
            from_date,
            to_date
          ).catch((error) => {
            throw error;
          });
          if (_.isEmpty(data)) {
            throw new ErrorResponse(
              ResponseType.NO_RECORD_FOUND,
              ErrorType.no_matching_results
            );
          } else if (_.isEmpty(data.rows[0])) {
            responseList[0].summary[i] = {
              ...responseList[0].summary[i],
              splitSum: 0,
            };
          } else {
            responseList[0].summary[i] = {
              ...responseList[0].summary[i],
              splitSum: data.rows[0].value.sum,
            };
          }

          //Now check in split payments with custom extras

          data =
            await self.SummaryModel.getSplitPaymentsWithCustomExtrasByPaymentModeAndExtras(
              filter_parameter,
              split_parameters[i].name,
              from_date,
              to_date
            ).catch((error) => {
              throw error;
            });
          if (_.isEmpty(data)) {
            throw new ErrorResponse(
              ResponseType.NO_RECORD_FOUND,
              ErrorType.no_matching_results
            );
          } else if (_.isEmpty(data.rows[0])) {
            responseList[0].summary[i] = {
              ...responseList[0].summary[i],
              splitWithCustomExtrasSum: 0,
            };
          } else {
            responseList[0].summary[i] = {
              ...responseList[0].summary[i],
              splitWithCustomExtrasSum: data.rows[0].value.sum,
            };
          }

          i++;
        }
        return responseList;
        break;
      }
    }
  }
}

module.exports = SummaryService;
