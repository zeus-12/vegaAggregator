"use strict";
let BaseService = ACCELERONCORE._services.BaseService;
let SummaryModel = require("../models/SummaryModel");
let SettingsService = require("./SettingsService");
var moment = require("moment");
var _ = require("underscore");

class SummaryService extends BaseService {
  constructor(request) {
    super(request);
    this.request = request;
    this.SummaryModel = new SummaryModel(request);
    this.SettingsService = new SettingsService(request);
  }

  // function to fetch all the available billing modes
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

  // function to fetch all the available payment modes
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

  // function to fetch all the available menu items
  async getAllMenuItems() {
    let self = this;
    const data = await self.SettingsService.getSettingsById(
      "ACCELERATE_MASTER_MENU"
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

  // function to fetch the menu catalog
  async getMenuCatalog() {
    let self = this;
    const data = await self.SettingsService.getSettingsById(
      "ACCELERATE_MENU_CATALOG"
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

  // function to fetch all the available dining sessions
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

  // function to fetch all the available billing parameters
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

  // function to fetch all the available discount types
  async getAllDiscountTypes() {
    let self = this;
    const data = await self.SettingsService.getSettingsById(
      "ACCELERATE_DISCOUNT_TYPES"
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

  //For a given BILLING MODE, the total Sales in the given DATE RANGE
  async fetchSummaryBySalesfilteredByBillingMode(
    from_date,
    to_date,
    curr_date
  ) {
    let self = this;
    let responseList = {};
    let i = 0;
    let data = {};
    var filter_parameters = [];

    try {
      data = await self.getAllBillingModes();
      filter_parameters = data.value;
    } catch (error) {
      throw error;
    }
    responseList["SALES_BY_BILLING_MODE"] = {};
    responseList["SALES_BY_BILLING_MODE"]["grandSum"] = 0;
    responseList["SALES_BY_BILLING_MODE"]["grandCount"] = 0;
    responseList["SALES_BY_BILLING_MODE"]["summary"] = [];
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
          ErrorType.no_record_found_for_a_billing_mode
        );
      } else if (_.isEmpty(data.rows[0])) {
        responseList["SALES_BY_BILLING_MODE"]["summary"].push({
          mode: filter_parameters[i].type,
          name: filter_parameters[i].name,
          sum: 0,
          count: 0,
        });
      } else {
        responseList["SALES_BY_BILLING_MODE"]["summary"].push({
          mode: filter_parameters[i].type,
          name: filter_parameters[i].name,
          sum: data.rows[0].value.sum,
          count: data.rows[0].value.count,
        });
        responseList["SALES_BY_BILLING_MODE"]["grandSum"] +=
          data.rows[0].value.sum;
        responseList["SALES_BY_BILLING_MODE"]["grandCount"] +=
          data.rows[0].value.count;
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
          ErrorType.no_refund_record_found_for_a_billing_mode
        );
      } else if (_.isEmpty(data.rows[0])) {
        responseList["SALES_BY_BILLING_MODE"]["summary"][i]["refunds"] = 0;
      } else {
        responseList["SALES_BY_BILLING_MODE"]["summary"][i]["refunds"] =
          data.rows[0].value.sum;
        responseList["SALES_BY_BILLING_MODE"]["grandSum"] -=
          data.rows[0].value.sum;
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
          ErrorType.no_record_found_for_live_orders
        );
      } else if (_.isEmpty(data.rows[0])) {
        responseList["LIVE_ORDERS"] = {
          sum: 0,
          count: 0,
        };
      } else {
        responseList["LIVE_ORDERS"] = {
          sum: data.rows[0].value.sum,
          count: data.rows[0].value.count,
        };
      }

      //Check for any extras

      data = await self.SummaryModel.getUnbilledKOTExtras().catch((error) => {
        throw error;
      });
      if (_.isEmpty(data)) {
        throw new ErrorResponse(
          ResponseType.NO_RECORD_FOUND,
          ErrorType.no_extras_record_found_for_live_orders
        );
      } else if (_.isEmpty(data.rows[0])) {
        responseList["LIVE_ORDERS"]["extras"] = 0;
      } else {
        responseList["LIVE_ORDERS"]["extras"] = data.rows[0].value.sum;
      }

      //check for unsettled bills

      //dates expected as DD-MM-YYYY
      from_date = moment(from_date, "YYYYMMDD").format("DD-MM-YYYY");
      to_date = moment(to_date, "YYYYMMDD").format("DD-MM-YYYY");

      data = await self.SummaryModel.getUnbilledBills(from_date, to_date).catch(
        (error) => {
          throw error;
        }
      );
      if (_.isEmpty(data)) {
        throw new ErrorResponse(
          ResponseType.NO_RECORD_FOUND,
          ErrorType.no_record_found_for_unsettled_bills
        );
      } else if (_.isEmpty(data.rows[0])) {
        responseList["PENDING_SETTLEMENT"] = {
          sum: 0,
          count: 0,
        };
      } else {
        responseList["PENDING_SETTLEMENT"] = {
          sum: data.rows[0].value.sum,
          count: data.rows[0].value.count,
        };
      }
      return responseList;
    } else {
      return responseList;
    }
  }

  //For a given PAYMENT MODE and BILLING MODE, the total Sales in the given DATE RANGE
  async fetchSummaryBySalesfilteredByBillingModeDetailed(
    detailed_by,
    from_date,
    to_date
  ) {
    let self = this;
    let responseList = [
      {
        type: `DETAILED_SALES_OF_${detailed_by
          .toUpperCase()
          .replace(/ /g, "_")}`,
        summary: [],
      },
    ];
    let i = 0;
    let data = {};
    var filter_parameters = [];

    try {
      data = await self.getAllPaymentModes();
      filter_parameters = data.value;
    } catch (error) {
      throw error;
    }

    while (i < filter_parameters.length) {
      data = await self.SummaryModel.getSalesByBillingAndPaymentMode(
        detailed_by,
        filter_parameters[i].code,
        from_date,
        to_date
      ).catch((error) => {
        throw error;
      });

      if (_.isEmpty(data)) {
        throw new ErrorResponse(
          ResponseType.NO_RECORD_FOUND,
          ErrorType.no_record_found_for_a_billing_parameter
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

      data = await self.SummaryModel.getSplitPaymentsByBillingAndPaymentMode(
        detailed_by,
        filter_parameters[i].code,
        from_date,
        to_date
      ).catch((error) => {
        throw error;
      });

      if (_.isEmpty(data)) {
        throw new ErrorResponse(
          ResponseType.NO_RECORD_FOUND,
          ErrorType.no_split_payments_record_found_for_a_billing_parameter
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
  }

  //For a given EXTRAS and BILLING MODE, the total Sales in the given DATE RANGE
  async fetchSummaryBySalesfilteredByBillingModeDetailedByExtras(
    detailed_by,
    from_date,
    to_date
  ) {
    let self = this;
    let responseList = [
      {
        type: `DETAILED_SALES_OF_${detailed_by
          .toUpperCase()
          .replace(/ /g, "_")}`,
        summary: [],
      },
    ];
    let i = 0;
    let data = {};
    var filter_parameters = [];

    try {
      data = await self.getAllBillingParameters();
      filter_parameters = data.value;
    } catch (error) {
      throw error;
    }

    while (i < filter_parameters.length) {
      data = await self.SummaryModel.getSalesByBillingModeAndExtras(
        detailed_by,
        filter_parameters[i].name,
        from_date,
        to_date
      ).catch((error) => {
        throw error;
      });
      if (_.isEmpty(data)) {
        throw new ErrorResponse(
          ResponseType.NO_RECORD_FOUND,
          ErrorType.no_extras_record_found_for_a_billing_mode
        );
      } else if (_.isEmpty(data.rows[0])) {
        responseList[0].summary.push({
          name: filter_parameters[i].name,
          sum: 0,
          count: 0,
        });
      } else {
        responseList[0].summary.push({
          name: filter_parameters[i].name,
          sum: data.rows[0].value.sum,
          count: data.rows[0].value.count,
        });
      }

      //Now check in custom Extras

      data = await self.SummaryModel.getCustomExtrasByBillingModeAndExtras(
        detailed_by,
        filter_parameters[i].name,
        from_date,
        to_date
      ).catch((error) => {
        throw error;
      });
      if (_.isEmpty(data)) {
        throw new ErrorResponse(
          ResponseType.NO_RECORD_FOUND,
          ErrorType.no_custom_extras_record_found_for_a_billing_mode
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
      i++;
    }
    return responseList;
  }

  //For a given PAYMENT MODE, the total Sales in the given DATE RANGE
  async fetchSummaryBySalesfilteredByPaymentMode(from_date, to_date) {
    let self = this;
    let responseList = [
      {
        type: "SALES_BY_PAYMENT_MODE",
        summary: [],
      },
    ];
    let i = 0;
    let data = {};
    var filter_parameters = [];

    try {
      data = await self.getAllPaymentModes();
      filter_parameters = data.value;
    } catch (error) {
      throw error;
    }

    while (i < filter_parameters.length) {
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
          ErrorType.no_record_found_for_a_payment_mode
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
          ErrorType.no_split_payments_record_found_for_a_payment_mode
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
          ErrorType.no_refunds_record_found_for_a_payment_mode
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
  }

  //For a given EXTRAS and PAYMENT MODE, the total Sales in the given DATE RANGE
  async fetchSummaryBySalesfilteredByPaymentModeDetailed(
    detailed_by,
    from_date,
    to_date
  ) {
    let self = this;
    let responseList = [
      {
        type: `DETAILED_SALES_OF_${detailed_by
          .toUpperCase()
          .replace(/ /g, "_")}`,
        summary: [],
      },
    ];
    let i = 0;
    let data = {};
    var filter_parameters = [];

    try {
      data = await self.getAllBillingParameters();
      filter_parameters = data.value;
    } catch (error) {
      throw error;
    }

    while (i < filter_parameters.length) {
      data = await self.SummaryModel.getSalesByPaymentModeAndExtras(
        detailed_by,
        filter_parameters[i].name,
        from_date,
        to_date
      ).catch((error) => {
        throw error;
      });
      if (_.isEmpty(data)) {
        throw new ErrorResponse(
          ResponseType.NO_RECORD_FOUND,
          ErrorType.no_extras_record_found_for_a_payment_mode
        );
      } else if (_.isEmpty(data.rows[0])) {
        responseList[0].summary.push({
          name: filter_parameters[i].name,
          sum: 0,
          count: 0,
        });
      } else {
        responseList[0].summary.push({
          name: filter_parameters[i].name,
          sum: data.rows[0].value.sum,
          count: data.rows[0].value.count,
        });
      }

      //Now check in custom Extras

      data = await self.SummaryModel.getCustomExtrasByPaymentModeAndExtras(
        detailed_by,
        filter_parameters[i].name,
        from_date,
        to_date
      ).catch((error) => {
        throw error;
      });
      if (_.isEmpty(data)) {
        throw new ErrorResponse(
          ResponseType.NO_RECORD_FOUND,
          ErrorType.no_custom_extras_record_found_for_a_payment_mode
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
        detailed_by,
        filter_parameters[i].name,
        from_date,
        to_date
      ).catch((error) => {
        throw error;
      });
      if (_.isEmpty(data)) {
        throw new ErrorResponse(
          ResponseType.NO_RECORD_FOUND,
          ErrorType.no_splt_payments_record_found_for_a_payment_mode
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
          detailed_by,
          filter_parameters[i].name,
          from_date,
          to_date
        ).catch((error) => {
          throw error;
        });
      if (_.isEmpty(data)) {
        throw new ErrorResponse(
          ResponseType.NO_RECORD_FOUND,
          ErrorType.no_split_payments_with_custom_extras_record_found_for_a_payment_mode
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
  }

  //For a given SESSION, the total Sales in the given DATE RANGE
  async fetchSummaryBySalesfilteredBySessions(from_date, to_date) {
    let self = this;
    let responseList = [
      {
        type: `SALES_BY_SESSIONS`,
        summary: [],
      },
    ];
    let i = 0;
    let data = {};

    data = await self.SummaryModel.getSalesBySessions(from_date, to_date).catch(
      (error) => {
        throw error;
      }
    );

    if (_.isEmpty(data)) {
      throw new ErrorResponse(
        ResponseType.NO_RECORD_FOUND,
        ErrorType.no_record_found_for_sales_by_sessions
      );
    } else if (_.isEmpty(data.rows[0])) {
      return responseList;
    } else {
      var reduced_list = data.rows.reduce(function (accumulator, item) {
        if (accumulator[item.key[1]]) {
          accumulator[item.key[1]].amount += item.value; //total amount
          accumulator[item.key[1]].number_of_guests += item.key[2]; //number of guests
          accumulator[item.key[1]].count++; //number of orders
        } else {
          accumulator[item.key[1]] = {
            session: item.key[1],
            amount: item.value,
            count: 1,
            number_of_guests: item.key[2],
          };
        }

        return accumulator;
      }, {});

      var formattedList = [];
      var keysCount = Object.keys(reduced_list);

      var counter = 1;
      for (var x in reduced_list) {
        formattedList.push({
          number_of_guests: reduced_list[x].number_of_guests,
          count: reduced_list[x].count,
          amount: reduced_list[x].amount,
          session: reduced_list[x].session,
        });

        if (counter == keysCount.length) {
          //last iteration
          // Ascending: Sorting
          formattedList.sort(function (obj1, obj2) {
            return obj2.count - obj1.count;
          });

          responseList[0].summary = formattedList;

          return responseList;
        }

        counter++;
      }
    }
  }

  //For a given ITEM, the total Sales in the given DATE RANGE
  async fetchSummaryBySalesfilteredByItems(from_date, to_date) {
    let self = this;
    let responseList = [
      {
        type: "SALES_BY_ITEMS",
        summary: [],
      },
    ];
    let i = 0;
    let j = 0;
    var itemPos = null;
    let data = {};

    data = await self.SummaryModel.getSalesByItems(from_date, to_date).catch(
      (error) => {
        throw error;
      }
    );

    if (_.isEmpty(data)) {
      throw new ErrorResponse(
        ResponseType.NO_RECORD_FOUND,
        ErrorType.no_matching_results
      );
    } else {
      while (i < data.rows.length) {
        if (_.isEmpty(data.rows[i])) {
          responseList[0].summary.push({
            category: "Missing",
            name: "Missing",
            sum: 0,
            count: 0,
          });
        } else {
          itemPos = null;
          for (j = 0; j < responseList[0].summary.length; j++) {
            if (
              responseList[0].summary[j].category == data.rows[i].key[1] &&
              responseList[0].summary[j].name == data.rows[i].key[2]
            ) {
              itemPos = j;
            }
          }
          if (itemPos != null) {
            responseList[0].summary[itemPos].sum =
              parseFloat(responseList[0].summary[itemPos].sum) +
              parseFloat(data.rows[i].key[4]);
            responseList[0].summary[itemPos].count += data.rows[i].value;
          } else {
            responseList[0].summary.push({
              category: data.rows[i].key[1],
              name: data.rows[i].key[2],
              sum: data.rows[i].key[4],
              count: data.rows[i].value,
            });
          }
        }
        i++;
      }

      // Ascending: Sorting
      responseList[0].summary.sort(function (obj1, obj2) {
        return obj2.count - obj1.count;
      });
    }
    return responseList;
  }

  //For a given ITEM, the total Sales in the given DATE RANGE detailed
  async fetchSummaryBySalesfilteredByItemsDetailed(from_date, to_date) {
    let self = this;
    let responseList = [
      {
        type: `SALES_BY_ITEMS_DETAILED`,
        summary: [],
      },
    ];

    let data = {};

    data = await self.SummaryModel.getSalesByItems(from_date, to_date).catch(
      (error) => {
        throw error;
      }
    );

    if (_.isEmpty(data)) {
      throw new ErrorResponse(
        ResponseType.NO_RECORD_FOUND,
        ErrorType.no_matching_results
      );
    }

    var reduced_list = data.rows.reduce(function (accumulator, item) {
      var accumulator_item_name =
        item.key[3] && item.key[3] != ""
          ? item.key[2] + " (" + item.key[3] + ")"
          : item.key[2];

      if (accumulator[accumulator_item_name]) {
        accumulator[accumulator_item_name].count += item.value;
      } else {
        accumulator[accumulator_item_name] = {
          category: item.key[1],
          count: item.value,
          price: item.key[4],
        };
      }

      return accumulator;
    }, {});

    var formattedList = [];
    var keysCount = Object.keys(reduced_list);

    var counter = 1;
    var x;
    for (x in reduced_list) {
      formattedList.push({
        name: x,
        count: reduced_list[x].count,
        saleAmount: reduced_list[x].count * reduced_list[x].price,
        category: reduced_list[x].category,
      });

      if (counter == keysCount.length) {
        break;
      }

      counter++;
    }

    // Ascending: Sorting
    formattedList.sort(function (obj1, obj2) {
      return obj2.count - obj1.count;
    });

    var categorySortedList = formattedList.reduce(function (accumulator, item) {
      if (accumulator[item.category]) {
        accumulator[item.category].push({
          name: item.name,
          count: item.count,
          saleAmount: item.saleAmount,
        });
      } else {
        accumulator[item.category] = [];
        accumulator[item.category].push({
          name: item.name,
          count: item.count,
          saleAmount: item.saleAmount,
        });
      }

      return accumulator;
    }, {});

    var categoryCount = Object.keys(categorySortedList);

    counter = 1;
    for (x in categorySortedList) {
      var n = 0;
      var sub_list = [];
      while (categorySortedList[x][n]) {
        sub_list.push({
          name: categorySortedList[x][n].name,
          count: categorySortedList[x][n].count,
          saleAmount: categorySortedList[x][n].saleAmount,
        });
        n++;
      }

      responseList[0].summary.push({
        category: x,
        items: sub_list,
      });

      if (counter == categoryCount.length) {
        break;
      }

      counter++;
    }

    return responseList;
  }

  //For a given HOUR, the total Sales in the given DATE RANGE
  async fetchSummaryBySalesfilteredByHour(filter_type, from_date, to_date) {
    let self = this;
    let responseList = [
      {
        type: `${filter_type.toUpperCase().replace(/ /g, "_")}_SALES_BY_HOUR`,
        summary: [],
      },
    ];
    let i = 0;
    let j = 0;
    let data = {};
    var isFound = false;

    data = await self.SummaryModel.getHourlySales(
      filter_type,
      from_date,
      to_date
    ).catch((error) => {
      throw error;
    });

    if (_.isEmpty(data)) {
      throw new ErrorResponse(
        ResponseType.NO_RECORD_FOUND,
        ErrorType.no_record_found_for_hourly_sales
      );
    } else {
      while (i < data.rows.length) {
        j = 0;
        isFound = false;
        do {
          if (
            responseList[0].summary[j] &&
            responseList[0].summary[j].hour_slot == data.rows[i].key[2]
          ) {
            responseList[0].summary[j].count++;
            responseList[0].summary[j].number_of_guests += data.rows[i].value;
            isFound = true;
            break;
          }
          j++;
        } while (j < responseList[0].summary.length);

        if (!isFound) {
          responseList[0].summary.push({
            hour_slot: data.rows[i].key[2],
            count: 1,
            number_of_guests: data.rows[i].value,
          });
        }
        i++;
      }
      for (i = 0; i < 24; i++) {
        j = 0;
        while (responseList[0].summary[j]) {
          if (responseList[0].summary[j].hour_slot == i) {
            break;
          }

          if (j == responseList[0].summary.length - 1) {
            responseList[0].summary.push({
              hour_slot: i,
              count: 0,
              number_of_guests: 0,
            });
          }

          j++;
        }
      }

      responseList[0].summary.sort(function (obj1, obj2) {
        return obj1.hour_slot - obj2.hour_slot;
      });

      //Remove 12:00 Midnight to 11:00 Midnight (if all zeros in between)
      var midnightEmptyCheck = true;
      var m = 0;
      while (responseList[0].summary[m] && m <= 11) {
        if (responseList[0].summary[m].count != 0) {
          midnightEmptyCheck = false;
          break;
        }
        m++;
      }

      if (midnightEmptyCheck) {
        responseList[0].summary = responseList[0].summary.splice(11, 23);
      }
    }
    return responseList;
  }

  //summary of different type of discounts offered in the given DATE RANGE
  async fetchSummaryByDiscounts(from_date, to_date) {
    let self = this;
    let responseList = [
      {
        type: "DISCOUNTS",
        summary: [],
      },
    ];
    let i = 0;
    let data = {};
    var filter_parameters = [];

    try {
      data = await self.getAllDiscountTypes();
      filter_parameters = data.value;
    } catch (error) {
      throw error;
    }

    filter_parameters.push(
      {
        name: "COUPON",
        maxDiscountUnit: "AMOUNT",
        maxDiscountValue: 10000,
      },
      {
        name: "VOUCHER",
        maxDiscountUnit: "AMOUNT",
        maxDiscountValue: 10000,
      },
      {
        name: "REWARDS",
        maxDiscountUnit: "AMOUNT",
        maxDiscountValue: 10000,
      },
      {
        name: "NOCOSTBILL",
        maxDiscountUnit: "AMOUNT",
        maxDiscountValue: 10000,
      },
      {
        name: "ONLINE",
        maxDiscountUnit: "AMOUNT",
        maxDiscountValue: 10000,
      }
    );

    while (i < filter_parameters.length) {
      data = await self.SummaryModel.getDiscounts(
        filter_parameters[i].name,
        from_date,
        to_date
      ).catch((error) => {
        throw error;
      });

      //beautify name
      if (filter_parameters[i].name == "COUPON") {
        filter_parameters[i].name = "Coupons";
      }
      if (filter_parameters[i].name == "VOUCHER") {
        filter_parameters[i].name = "Vouchers";
      }
      if (filter_parameters[i].name == "REWARDS") {
        filter_parameters[i].name = "Reward Points";
      }
      if (filter_parameters[i].name == "NOCOSTBILL") {
        filter_parameters[i].name = "No Cost Bill";
      }
      if (filter_parameters[i].name == "ONLINE") {
        filter_parameters[i].name = "Pre-applied Online Discounts";
      }

      if (_.isEmpty(data)) {
        throw new ErrorResponse(
          ResponseType.NO_RECORD_FOUND,
          ErrorType.no_record_found_for_the_discounts_of_a_discount_type
        );
      } else if (_.isEmpty(data.rows[0])) {
        responseList[0].summary.push({
          name: filter_parameters[i].name,
          sum: 0,
          count: 0,
        });
      } else {
        responseList[0].summary.push({
          name: filter_parameters[i].name,
          sum: data.rows[0].value.sum,
          count: data.rows[0].value.count,
        });
      }
      i++;
    }
    return responseList;
  }

  //summary of refunds in the given DATE RANGE
  async fetchSummaryByRefunds(from_date, to_date) {
    let self = this;
    let responseList = [
      {
        type: "REFUNDS",
        summary: [],
      },
    ];
    let i = 0;
    let data = {};
    var filter_parameters = [];

    try {
      data = await self.getAllPaymentModes();
      filter_parameters = data.value;
    } catch (error) {
      throw error;
    }

    while (i < filter_parameters.length) {
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
          ErrorType.no_refunds_record_found_for_a_payment_mode
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
      i++;
    }
    return responseList;
  }

  //summary of cancelled bills in the given DATE RANGE
  async fetchSummaryByBillCancellations(from_date, to_date) {
    let self = this;
    let responseList = {};
    let i = 0;
    let data = {};
    var filter_parameters = [];

    responseList["BILL_CANCELLATIONS"] = {};
    responseList["BILL_CANCELLATIONS"]["grandSum"] = 0;
    responseList["BILL_CANCELLATIONS"]["grandCount"] = 0;
    responseList["BILL_CANCELLATIONS"]["summary"] = [];

    try {
      data = await self.getAllBillingModes();
      filter_parameters = data.value;
    } catch (error) {
      throw error;
    }

    while (i < filter_parameters.length) {
      data = await self.SummaryModel.getCancelledBills(
        filter_parameters[i].name,
        from_date,
        to_date
      ).catch((error) => {
        throw error;
      });
      if (_.isEmpty(data)) {
        throw new ErrorResponse(
          ResponseType.NO_RECORD_FOUND,
          ErrorType.no_cancelled_bills_recors_found_for_a_billing_mode
        );
      } else if (_.isEmpty(data.rows[0])) {
        responseList["BILL_CANCELLATIONS"]["summary"].push({
          mode: filter_parameters[i].type,
          name: filter_parameters[i].name,
          sum: 0,
          count: 0,
        });
      } else {
        responseList["BILL_CANCELLATIONS"]["summary"].push({
          mode: filter_parameters[i].type,
          name: filter_parameters[i].name,
          sum: data.rows[0].value.sum,
          count: data.rows[0].value.count,
        });

        responseList["BILL_CANCELLATIONS"]["grandSum"] +=
          data.rows[0].value.sum;
        responseList["BILL_CANCELLATIONS"]["grandCount"] +=
          data.rows[0].value.count;
      }
      i++;
    }

    const payment_status = ["UNPAID", "PAID"];
    i = 0;

    while (i < payment_status.length) {
      data = await self.SummaryModel.getCancelledBillsByPaymentStatus(
        payment_status[i],
        from_date,
        to_date
      ).catch((error) => {
        throw error;
      });
      if (_.isEmpty(data)) {
        throw new ErrorResponse(
          ResponseType.NO_RECORD_FOUND,
          ErrorType.no_records_found_for_paid_or_unpaid_bills
        );
      } else if (_.isEmpty(data.rows[0])) {
        responseList[`${payment_status[i]}_BILLS`] = {
          sum: 0,
          count: 0,
        };
      } else {
        responseList[`${payment_status[i]}_BILLS`] = {
          sum: data.rows[0].value.sum,
          count: data.rows[0].value.count,
        };
      }
      i++;
    }
    return responseList;
  }

  //summary of cancelled items in the given DATE RANGE
  async fetchSummaryByItemCancellations(from_date, to_date) {
    let self = this;
    let responseList = [
      {
        type: "ITEM_CANCELLATIONS",
        summary: [],
      },
    ];
    let i = 0;
    let j = 0;
    var itemPos = null;
    let data = {};

    data = await self.SummaryModel.getCancelledItems(from_date, to_date).catch(
      (error) => {
        throw error;
      }
    );

    if (_.isEmpty(data)) {
      throw new ErrorResponse(
        ResponseType.NO_RECORD_FOUND,
        ErrorType.no_record_found_for_cancelled_items
      );
    } else {
      while (i < data.rows.length) {
        if (_.isEmpty(data.rows[i])) {
          responseList[0].summary.push({
            category: "Missing",
            name: "Missing",
            sum: 0,
            count: 0,
          });
        } else {
          itemPos = null;
          for (j = 0; j < responseList[0].summary.length; j++) {
            if (
              responseList[0].summary[j].category == data.rows[i].key[1] &&
              responseList[0].summary[j].name == data.rows[i].key[2]
            ) {
              itemPos = j;
            }
          }
          if (itemPos != null) {
            responseList[0].summary[itemPos].sum =
              parseFloat(responseList[0].summary[itemPos].sum) +
              parseFloat(data.rows[i].key[4]);
            responseList[0].summary[itemPos].count += data.rows[i].value;
          } else {
            responseList[0].summary.push({
              category: data.rows[i].key[1],
              name: data.rows[i].key[2],
              sum: data.rows[i].key[4],
              count: data.rows[i].value,
            });
          }
        }
        i++;
      }
      // Ascending: Sorting
      responseList[0].summary.sort(function (obj1, obj2) {
        return obj2.count - obj1.count;
      });
    }
    return responseList;
  }

  //Deatailed summary of cancelled items in the given DATE RANGE
  async fetchSummaryByItemCancellationsDetailed(from_date, to_date) {
    let self = this;
    let responseList = [
      {
        type: "ITEM_CANCELLATIONS_DETAILED",
        summary: [],
      },
    ];
    let i = 0;
    let data = {};

    data = await self.SummaryModel.getCancelledItemsDetailed(
      from_date,
      to_date
    ).catch((error) => {
      throw error;
    });

    if (_.isEmpty(data)) {
      throw new ErrorResponse(
        ResponseType.NO_RECORD_FOUND,
        ErrorType.no_record_found_for_cancelled_items
      );
    } else if (_.isEmpty(data.rows)) {
      return responseList;
    } else {
      while (i < data.rows.length) {
        delete data.rows[i].value._id;
        delete data.rows[i].value._rev;
        responseList[0].summary.push(data.rows[i].value);
        i++;
      }
    }
    return responseList;
  }

  //overall quick summary
  async fetchOverAllTurnOver(from_date, to_date) {
    let self = this;
    let responseList = {};
    let i = 0;
    let data = {};
    let grandTotalTypes = [
      "grandtotal_paidamount",
      "grandtotal_tips",
      "grandtotal_roundoff",
      "grandtotal_calculatedroundoff",
      "grandtotal_discounts",
      "grandtotal_netamount",
      "star_rating",
    ];

    while (i < grandTotalTypes.length) {
      data = await self.SummaryModel.getGrandTotalByType(
        grandTotalTypes[i],
        from_date,
        to_date
      ).catch((error) => {
        throw error;
      });
      if (_.isEmpty(data)) {
        throw new ErrorResponse(
          ResponseType.NO_RECORD_FOUND,
          ErrorType.no_records_found_for_a_grand_total_type
        );
      } else if (_.isEmpty(data.rows)) {
        responseList[grandTotalTypes[i].toUpperCase()] = {
          sum: 0,
          count: 0,
        };
      } else {
        responseList[grandTotalTypes[i].toUpperCase()] = {
          sum: data.rows[0].value.sum,
          count: data.rows[0].value.count,
        };
      }
      i++;
    }

    var billing_parameters = [];
    responseList["BILLING_PARAMETERS"] = {};
    responseList["BILLING_PARAMETERS"]["summary"] = [];
    i = 0;

    try {
      data = await self.getAllBillingParameters();
      billing_parameters = data.value;
    } catch (error) {
      throw error;
    }

    while (i < billing_parameters.length) {
      data = await self.SummaryModel.getTotalExtrasByBillingParameter(
        billing_parameters[i].name,
        from_date,
        to_date
      ).catch((error) => {
        throw error;
      });
      if (_.isEmpty(data)) {
        throw new ErrorResponse(
          ResponseType.NO_RECORD_FOUND,
          ErrorType.no_record_found_for_a_billing_parameter
        );
      } else if (_.isEmpty(data.rows[0])) {
        responseList["BILLING_PARAMETERS"]["summary"].push({
          name: billing_parameters[i].name,
          sum: 0,
          count: 0,
        });
      } else {
        responseList["BILLING_PARAMETERS"]["summary"].push({
          name: billing_parameters[i].name,
          sum: data.rows[0].value.sum,
          count: data.rows[0].value.count,
        });
      }

      //Now check in custom Extras

      data = await self.SummaryModel.getTotalCustomExtrasByBillingParameter(
        billing_parameters[i].name,
        from_date,
        to_date
      ).catch((error) => {
        throw error;
      });
      if (_.isEmpty(data)) {
        throw new ErrorResponse(
          ResponseType.NO_RECORD_FOUND,
          ErrorType.no_custom_extras_record_found_for_a_billing_parameter
        );
      } else if (_.isEmpty(data.rows[0])) {
        responseList["BILLING_PARAMETERS"]["summary"][i]["customExtrasSum"] = 0;
        responseList["BILLING_PARAMETERS"]["summary"][i][
          "customExtrasCount"
        ] = 0;
      } else {
        responseList["BILLING_PARAMETERS"]["summary"][i]["customExtrasSum"] =
          data.rows[0].value.sum;
        responseList["BILLING_PARAMETERS"]["summary"][i]["customExtrasCount"] =
          data.rows[0].value.count;
      }
      i++;
    }

    data = await self.SummaryModel.getGrossRefunds(from_date, to_date).catch(
      (error) => {
        throw error;
      }
    );
    if (_.isEmpty(data)) {
      throw new ErrorResponse(
        ResponseType.NO_RECORD_FOUND,
        ErrorType.no_records_found_for_gross_refunds
      );
    } else if (_.isEmpty(data.rows)) {
      responseList["REFUNDS"] = {
        grossSum: 0,
        grossCount: 0,
      };
    } else {
      responseList["REFUNDS"] = {
        grossSum: data.rows[0].value.sum,
        grossCount: data.rows[0].value.count,
      };
    }

    //Now check in net refunds

    data = await self.SummaryModel.getNetRefunds(from_date, to_date).catch(
      (error) => {
        throw error;
      }
    );
    if (_.isEmpty(data)) {
      throw new ErrorResponse(
        ResponseType.NO_RECORD_FOUND,
        ErrorType.no_records_found_for_net_refunds
      );
    } else if (_.isEmpty(data.rows)) {
      responseList["REFUNDS"].netSum = 0;
      responseList["REFUNDS"].netCount = 0;
    } else {
      responseList["REFUNDS"].netSum = data.rows[0].value.sum;
      responseList["REFUNDS"].netCount = data.rows[0].value.count;
    }

    return responseList;
  }

  // excel overall report
  async excelOverallReport(from_date, to_date, curr_date) {
    let self = this;
    let responseList = [];
    let data = {};

    responseList = await self
      .fetchOverAllTurnOver(from_date, to_date)
      .catch((error) => {
        throw error;
      });

    data = await self
      .fetchSummaryBySalesfilteredByBillingMode(from_date, to_date, curr_date)
      .catch((error) => {
        throw error;
      });
    var originalBillingModesList = [];
    responseList["SALES_BY_BILLING_MODE"] = [];

    var billingGrandTotal = 0;
    for (var i = 0; i < data.SALES_BY_BILLING_MODE.summary.length; i++) {
      billingGrandTotal +=
        data.SALES_BY_BILLING_MODE.summary[i].sum -
        data.SALES_BY_BILLING_MODE.summary[i].refunds;

      originalBillingModesList.push({
        name: data.SALES_BY_BILLING_MODE.summary[i].name,
        type: data.SALES_BY_BILLING_MODE.summary[i].mode,
        value:
          data.SALES_BY_BILLING_MODE.summary[i].sum -
          data.SALES_BY_BILLING_MODE.summary[i].refunds,
        count: data.SALES_BY_BILLING_MODE.summary[i].count,
      });
      responseList["SALES_BY_BILLING_MODE"].push({
        name: data.SALES_BY_BILLING_MODE.summary[i].name,
        type: data.SALES_BY_BILLING_MODE.summary[i].mode,
        value:
          data.SALES_BY_BILLING_MODE.summary[i].sum -
          data.SALES_BY_BILLING_MODE.summary[i].refunds,
        count: data.SALES_BY_BILLING_MODE.summary[i].count,
      });
    }

    responseList["SALES_BY_BILLING_TYPE"] = [];

    var reducedBillingModesList = originalBillingModesList.reduce(function (
      accumulator,
      item
    ) {
      if (accumulator[item.type]) {
        accumulator[item.type].value += item.value;
        accumulator[item.type].count += item.count;
      } else {
        accumulator[item.type] = item;
      }

      return accumulator;
    },
    {});

    for (var key in reducedBillingModesList) {
      reducedBillingModesList[key].type = getFancyNameForBillingType(
        reducedBillingModesList[key].type
      );
      responseList["SALES_BY_BILLING_TYPE"].push(reducedBillingModesList[key]);
    }

    responseList["SALES_BY_BILLING_MODE"].push({
      name: "Total by Billing Modes",
      value: billingGrandTotal,
    });

    function getFancyNameForBillingType(type) {
      if (type == "DELIVERY") {
        return "Home Delivery";
      } else if (type == "PARCEL") {
        return "Takeaway";
      } else if (type == "TOKEN") {
        return "Token Based";
      } else if (type == "DINE") {
        return "Dine In";
      }
    }

    data = await self
      .fetchSummaryBySalesfilteredByPaymentMode(from_date, to_date)
      .catch((error) => {
        throw error;
      });

    var paymentGrandTotal = 0;
    var temp_sum = 0;
    responseList["SALES_BY_PAYMENT_MODE"] = [];

    for (var i = 0; i < data[0].summary.length; i++) {
      temp_sum =
        data[0].summary[i].sum +
        data[0].summary[i].splitSum -
        data[0].summary[i].refunds;
      paymentGrandTotal += temp_sum;

      responseList["SALES_BY_PAYMENT_MODE"].push({
        name: data[0].summary[i].name,
        value: temp_sum,
      });
    }

    responseList["SALES_BY_PAYMENT_MODE"].push({
      name: "Total by Payment Modes",
      value: paymentGrandTotal,
    });

    return responseList;
  }

  // excel invoice report
  async excelInvoiceReport(from_date, to_date) {
    let self = this;
    let responseList = {};
    let data = {};
    let i = 0;
    let billingParameters = {};
    try {
      data = await self.getAllBillingParameters();
      billingParameters = data.value;
    } catch (error) {
      throw error;
    }
    responseList["BILLING_PARAMETERS"] = billingParameters;

    data = await self.SummaryModel.getAllInvoices(from_date, to_date).catch(
      (error) => {
        throw error;
      }
    );

    if (_.isEmpty(data)) {
      throw new ErrorResponse(
        ResponseType.NO_RECORD_FOUND,
        ErrorType.no_records_found_for_invoices
      );
    }

    if (data.rows.length == 0) {
      return responseList;
    }

    data.rows.sort(function (doc1, doc2) {
      if (doc1.id < doc2.id) return -1;

      if (doc1.id > doc2.id) return 1;

      return 0;
    });

    let invoiceList = [];
    while (i < data.rows.length) {
      //Get formatted cart items
      var cart_items_formatted = "";
      var sub_total = 0;
      for (var j = 0; j < data.rows[i].doc.cart.length; j++) {
        var current_item = data.rows[i].doc.cart[j];
        var beautified_item = current_item.name;

        sub_total += current_item.price * current_item.qty;

        if (current_item.isCustom) {
          beautified_item += " (" + current_item.variant + ")";
        }

        beautified_item += " x " + current_item.qty;

        if (cart_items_formatted == "") {
          cart_items_formatted = beautified_item;
        } else {
          cart_items_formatted += ", " + beautified_item;
        }
      }

      //Get extras
      var all_extras = [];
      for (var j = 0; j < data.rows[i].doc.extras.length; j++) {
        all_extras[data.rows[i].doc.extras[j].name] =
          data.rows[i].doc.extras[j].amount;
      }

      //Get custom extras, if any.
      if (data.rows[i].doc.customExtras) {
        if (data.rows[i].doc.customExtras.amount != 0) {
          all_extras[data.rows[i].doc.customExtras.type] +=
            data.rows[i].doc.customExtras.amount;
        }
      }

      var invoice_info_extras = [];
      var m = 0;
      while (billingParameters[m]) {
        if (
          all_extras[billingParameters[m].name] &&
          all_extras[billingParameters[m].name] != ""
        ) {
          invoice_info_extras.push(all_extras[billingParameters[m].name]);
        } else {
          invoice_info_extras.push(0);
        }
        m++;
      }

      let invoiceDetails = {
        invoice_info_basic: {
          slNo: i + 1, //Sl No.
          billNumber: data.rows[i].doc.billNumber, //Bill Number
          invoiceDate: data.rows[i].doc.date, //Invoice Date
          day: moment(data.rows[i].doc.date, "DD-MM-YYYY").format("dddd"), //Day
          time: moment(data.rows[i].doc.timeBill, "hhmm").format("hh:mm A"), //Time
          billingMode: data.rows[i].doc.orderDetails.mode, //Billing Mode
          modeType: data.rows[i].doc.orderDetails.modeType, //Type of Mode (DINE, PARCEL etc.)
          cart_items_formatted, //items list
          sub_total, //sub_total},
        },
        invoice_info_payment: {
          discount: data.rows[i].doc.discount.amount
            ? data.rows[i].doc.discount.amount
            : 0, //Discounts
          calculatedRoundOff: data.rows[i].doc.calculatedRoundOff
            ? data.rows[i].doc.calculatedRoundOff
            : 0, //Round offs
          payableAmount: data.rows[i].doc.payableAmount, //payable amount
          totalAmountPaid: data.rows[i].doc.totalAmountPaid, //amount paid
          paymentMode: data.rows[i].doc.paymentMode, //mode of payment
          refundAmount: data.rows[i].doc.refundDetails
            ? data.rows[i].doc.refundDetails.amount
            : 0, //refunded amounts
          grossAmount: data.rows[i].doc.refundDetails
            ? parseFloat(
                data.rows[i].doc.totalAmountPaid -
                  data.rows[i].doc.refundDetails.amount
              ).toFixed(2)
            : data.rows[i].doc.totalAmountPaid, //gross amount
        },
        invoice_info_extras: {
          sgst: invoice_info_extras[0],
          cgst: invoice_info_extras[1],
          containerCharges: invoice_info_extras[2],
        },
      };

      invoiceList.push(invoiceDetails);
      i++;
    }

    responseList["INVOICE_DETAILS"] = invoiceList;

    return responseList;
  }

  // excel bill cancellations report
  async excelBillCancellationsReport(from_date, to_date) {
    let self = this;
    let responseList = {};
    let data = {};
    let i = 0;
    let billingParameters = {};
    try {
      data = await self.getAllBillingParameters();
      billingParameters = data.value;
    } catch (error) {
      throw error;
    }

    data = await self.SummaryModel.getAllCancelledInvoices(
      from_date,
      to_date
    ).catch((error) => {
      throw error;
    });

    if (_.isEmpty(data)) {
      throw new ErrorResponse(
        ResponseType.NO_RECORD_FOUND,
        ErrorType.no_records_found_for_cancelled_invoices
      );
    }

    if (data.rows.length == 0) {
      return responseList;
    }

    data.rows.sort(function (doc1, doc2) {
      if (doc1.id < doc2.id) return -1;

      if (doc1.id > doc2.id) return 1;

      return 0;
    });

    let invoiceList = [];
    while (i < data.rows.length) {
      //Get formatted cart items
      var cart_items_formatted = "";
      var sub_total = 0;
      for (var j = 0; j < data.rows[i].doc.cart.length; j++) {
        var current_item = data.rows[i].doc.cart[j];
        var beautified_item = current_item.name;

        sub_total += current_item.price * current_item.qty;

        if (current_item.isCustom) {
          beautified_item += " (" + current_item.variant + ")";
        }

        beautified_item += " x " + current_item.qty;

        if (cart_items_formatted == "") {
          cart_items_formatted = beautified_item;
        } else {
          cart_items_formatted += ", " + beautified_item;
        }
      }

      //Get extras
      var all_extras = [];
      for (var j = 0; j < data.rows[i].doc.extras.length; j++) {
        all_extras[data.rows[i].doc.extras[j].name] =
          data.rows[i].doc.extras[j].amount;
      }

      //Get custom extras, if any.
      if (data.rows[i].doc.customExtras) {
        if (data.rows[i].doc.customExtras.amount != 0) {
          all_extras[data.rows[i].doc.customExtras.type] +=
            data.rows[i].doc.customExtras.amount;
        }
      }

      var invoice_info_extras = [];
      var m = 0;
      while (billingParameters[m]) {
        if (
          all_extras[billingParameters[m].name] &&
          all_extras[billingParameters[m].name] != ""
        ) {
          invoice_info_extras.push(all_extras[billingParameters[m].name]);
        } else {
          invoice_info_extras.push(0);
        }
        m++;
      }

      let invoiceDetails = {
        invoice_info_basic: {
          slNo: i + 1, //Sl No.
          billNumber: data.rows[i].doc.billNumber, //Bill Number
          invoiceDate: data.rows[i].doc.date, //Invoice Date
          day: moment(data.rows[i].doc.date, "DD-MM-YYYY").format("dddd"), //Day
          time: moment(
            data.rows[i].doc.cancelDetails.timeCancel,
            "hhmm"
          ).format("hh:mm A"), //Time
          billingMode: data.rows[i].doc.orderDetails.mode, //Billing Mode
          modeType: data.rows[i].doc.orderDetails.modeType, //Type of Mode (DINE, PARCEL etc.)
          status:
            data.rows[i].doc.cancelDetails.status == 5
              ? "Unsettled"
              : "Settled",
          cancelledBy: data.rows[i].doc.cancelDetails.cancelledBy, //cancelled by
          reason: data.rows[i].doc.cancelDetails.reason, // reason for cancellation
          comments: data.rows[i].doc.cancelDetails.comments, //comments
          cart_items_formatted, //items list
          sub_total, //sub_total},
        },
        invoice_info_payment: {
          discount: data.rows[i].doc.discount.amount
            ? data.rows[i].doc.discount.amount
            : 0, //Discounts
          calculatedRoundOff: data.rows[i].doc.calculatedRoundOff
            ? data.rows[i].doc.calculatedRoundOff
            : 0, //Round offs
          payableAmount: data.rows[i].doc.payableAmount, //payable amount
          totalAmountPaid: data.rows[i].doc.totalAmountPaid, //amount paid
          paymentMode: data.rows[i].doc.paymentMode, //mode of payment
          refundAmount: data.rows[i].doc.refundDetails
            ? data.rows[i].doc.refundDetails.amount
            : 0, //refunded amounts
          grossAmount: data.rows[i].doc.refundDetails
            ? parseFloat(
                data.rows[i].doc.totalAmountPaid -
                  data.rows[i].doc.refundDetails.amount
              ).toFixed(2)
            : data.rows[i].doc.totalAmountPaid, //gross amount
        },
        invoice_info_extras: {
          sgst: invoice_info_extras[0],
          cgst: invoice_info_extras[1],
          containerCharges: invoice_info_extras[2],
        },
      };

      invoiceList.push(invoiceDetails);
      i++;
    }

    responseList["BILLING_PARAMETERS"] = billingParameters;
    responseList["INVOICE_DETAILS"] = invoiceList;

    return responseList;
  }

  // excel item cancellations report
  async excelItemCancellationsReport(from_date, to_date) {
    let self = this;
    let responseList = [];
    let data = {};
    let i = 0;

    data = await self.SummaryModel.getCancelledItemsDetailed(
      from_date,
      to_date
    ).catch((error) => {
      throw error;
    });

    if (_.isEmpty(data)) {
      throw new ErrorResponse(
        ResponseType.NO_RECORD_FOUND,
        ErrorType.no_records_found_for_cancelled_items
      );
    }

    if (data.rows.length == 0) {
      return responseList;
    }

    var itemCounter = 1;
    let cancelledItemsList = [];
    while (i < data.rows.length) {
      var cancelledItem = data.rows[i].value;

      for (var j = 0; j < cancelledItem.itemsRemoved.length; j++) {
        cancelledItemsList.push([
          itemCounter, //Sl No.
          cancelledItem.date, //Date
          moment(cancelledItem.time, "hhmm").format("hh:mm A"), //Time
          cancelledItem.mode, //Billing Mode
          cancelledItem.modeType, //Type of Mode (DINE, PARCEL etc.)
          cancelledItem.itemsRemoved[j].name +
            (cancelledItem.itemsRemoved[j].isCustom
              ? " (" + cancelledItem.itemsRemoved[j].variant + ")"
              : ""), //item
          cancelledItem.itemsRemoved[j].qty,
          cancelledItem.stewardName, //requested by
          cancelledItem.itemsRemoved[j].comments, // reason for cancellation
          cancelledItem.adminName, //approved by
          cancelledItem.customerName,
          cancelledItem.customerMobile,
          cancelledItem.guestCount,
          cancelledItem.KOTNumber,
          cancelledItem.modeType == "DINE" ? cancelledItem.table : "",
        ]);
        itemCounter++;
      }
      i++;
    }

    responseList.push({
      type: "CANCELLED_ITEMS_DETAILS",
      value: cancelledItemsList,
    });
    return responseList;
  }

  // daily sails report report
  async fetchSingleClickReport(
    is_super_admin_logged_in,
    from_date,
    to_date,
    curr_date
  ) {
    let self = this;
    let responseList = {};
    let overalSalesTrend = [];
    let i = 0;
    let data = {};
    let temp_totalPaid = 0;

    if (!is_super_admin_logged_in) {
      data = await self.SummaryModel.checkForRunningOrders().catch((error) => {
        throw error;
      });
      if (data.total_rows > 0) {
        throw new ErrorResponse(
          ResponseType.CONFLICT,
          `Please generate bills for all the ${data.rows.length} live orders to continue.`
        );
      }
    }

    data = await self.SummaryModel.checkForPendingBills(
      moment(from_date, "YYYYMMDD").format("DD-MM-YYYY"),
      moment(to_date, "YYYYMMDD").format("DD-MM-YYYY")
    );

    if (data.rows.length > 0) {
      throw new ErrorResponse(
        ResponseType.CONFLICT,
        ErrorType.bills_not_settled
      );
    }

    data = await self
      .fetchOverAllTurnOver(from_date, to_date)
      .catch((error) => {
        throw error;
      });

    responseList = data;

    if (from_date == to_date) {
      let refundList = [];
      data = await self.SummaryModel.getRefundsList(from_date, to_date).catch(
        (error) => {
          throw error;
        }
      );

      if (_.isEmpty(data)) {
        throw new ErrorResponse(
          ResponseType.NO_RECORD_FOUND,
          ErrorType.no_refunds_list_record_found
        );
      }

      while (i < data.rows.length) {
        refundList.push({
          refundDetails: data.rows[i].value.refundDetails,
          orderDetails: {
            mode: data.rows[i].value.orderDetails.mode,
          },
          totalAmountPaid: data.rows[i].value.totalAmountPaid,
          billNumber: data.rows[i].value.billNumber,
          stewardName: data.rows[i].value.stewardName,
          date: data.rows[i].value.date,
        });
        i++;
      }
      responseList["REFUNDS_LIST"] = refundList;
    }

    data = await self.SummaryModel.getGrandTotalByType(
      "totalguests",
      from_date,
      to_date
    ).catch((error) => {
      throw error;
    });

    if (_.isEmpty(data)) {
      throw new ErrorResponse(
        ResponseType.NO_RECORD_FOUND,
        ErrorType.no_records_found_for_total_guests
      );
    }

    responseList["TOTAL_GUESTS"] = {
      sum: data.rows[0] ? data.rows[0].value.sum : 0,
    };

    data = await self.SummaryModel.getFirstAndLastInvoiceNumber(
      from_date,
      to_date
    ).catch((error) => {
      throw error;
    });

    if (_.isEmpty(data)) {
      throw new ErrorResponse(
        ResponseType.NO_RECORD_FOUND,
        ErrorType.no_records_found_for_first_and_last_invoice_number
      );
    }

    responseList["FIRST_AND_LAST_INVOICE_NUMBER"] = {
      startingBillNumber: data.rows[0] ? data.rows[0].value.min : 0,
      endingBillNumber: data.rows[0] ? data.rows[0].value.max : 0,
    };

    data = await self.SummaryModel.getCancelledInvoicesCount(
      from_date,
      to_date
    ).catch((error) => {
      throw error;
    });

    if (_.isEmpty(data)) {
      throw new ErrorResponse(
        ResponseType.NO_RECORD_FOUND,
        ErrorType.no_records_found_for_cancelled_invoices_count
      );
    }

    responseList["CANCELLED_INVOICES_COUNT"] = {
      netCancelledBills: data.rows[0] ? data.rows[0].value.count : 0,
      netCancelledBillsSum: data.rows[0] ? data.rows[0].value.sum : 0,
    };

    if (from_date == to_date) {
      var trendDate_yesterday = moment(from_date, "YYYYMMDD")
        .subtract(1, "days")
        .format("YYYYMMDD"); //Yesterday

      var trendDate_currentWeek_from = moment(from_date, "YYYYMMDD")
        .subtract(6, "days")
        .format("YYYYMMDD");
      var trendDate_currentWeek_to = moment(from_date, "YYYYMMDD").format(
        "YYYYMMDD"
      );

      var trendDate_previousWeek_from = moment(from_date, "YYYYMMDD")
        .subtract(13, "days")
        .format("YYYYMMDD");
      var trendDate_previousWeek_to = moment(from_date, "YYYYMMDD")
        .subtract(7, "days")
        .format("YYYYMMDD");

      var trendDate_currentMonth_from = moment(from_date, "YYYYMMDD")
        .startOf("month")
        .format("YYYYMMDD");
      var trendDate_currentMonth_to = moment(from_date, "YYYYMMDD").format(
        "YYYYMMDD"
      );

      var trendDate_previousMonth_from = moment(from_date, "YYYYMMDD")
        .subtract(1, "months")
        .startOf("month")
        .format("YYYYMMDD");
      var trendDate_previousMonth_to = moment(from_date, "YYYYMMDD")
        .subtract(1, "months")
        .format("YYYYMMDD");
      var trendDate_previousMonth_end = moment(from_date, "YYYYMMDD")
        .subtract(1, "months")
        .endOf("month")
        .format("YYYYMMDD");

      var trendDate_lastYear_from = moment(from_date, "YYYYMMDD")
        .subtract(1, "years")
        .startOf("month")
        .format("YYYYMMDD");
      var trendDate_lastYear_to = moment(from_date, "YYYYMMDD")
        .subtract(1, "years")
        .format("YYYYMMDD");
      var trendDate_lastYear_end = moment(from_date, "YYYYMMDD")
        .subtract(1, "years")
        .endOf("month")
        .format("YYYYMMDD");

      overalSalesTrend = [
        {
          tag: "Today",
          range: moment(from_date, "YYYYMMDD").format("Do MMMM"),
          amount: 0,
          count: 0,
          dateFrom: from_date,
          dateTo: from_date,
        },
        {
          tag: "Yesterday",
          range: moment(from_date, "YYYYMMDD")
            .subtract(1, "days")
            .format("Do MMMM"),
          amount: 0,
          count: 0,
          dateFrom: trendDate_yesterday,
          dateTo: trendDate_yesterday,
        },
        {
          tag: "Current Week",
          range:
            moment(from_date, "YYYYMMDD").subtract(6, "days").format("Do MMM") +
            " - " +
            moment(from_date, "YYYYMMDD").format("Do MMM"),
          amount: 0,
          count: 0,
          dateFrom: trendDate_currentWeek_from,
          dateTo: trendDate_currentWeek_to,
        },
        {
          tag: "Previous Week",
          range:
            moment(from_date, "YYYYMMDD")
              .subtract(13, "days")
              .format("Do MMM") +
            " - " +
            moment(from_date, "YYYYMMDD").subtract(7, "days").format("Do MMM"),
          amount: 0,
          count: 0,
          dateFrom: trendDate_previousWeek_from,
          dateTo: trendDate_previousWeek_to,
        },
        {
          tag:
            "Current Month (" +
            moment(from_date, "YYYYMMDD").format("MMMM") +
            ")",
          range:
            moment(from_date, "YYYYMMDD").startOf("month").format("Do MMM") !=
            moment(from_date, "YYYYMMDD").format("Do MMM")
              ? moment(from_date, "YYYYMMDD").startOf("month").format("Do ") +
                " - " +
                moment(from_date, "YYYYMMDD").format("Do MMMM, YYYY")
              : moment(from_date, "YYYYMMDD").format("Do MMMM") + " (Today)",
          amount: 0,
          count: 0,
          dateFrom: trendDate_currentMonth_from,
          dateTo: trendDate_currentMonth_to,
        },
        {
          tag:
            "Previous Month (" +
            moment(from_date, "YYYYMMDD").subtract(1, "months").format("MMMM") +
            ") - Till " +
            moment(from_date, "YYYYMMDD").subtract(1, "months").format("Do"),
          range:
            moment(from_date, "YYYYMMDD")
              .subtract(1, "months")
              .startOf("month")
              .format("Do") !=
            moment(from_date, "YYYYMMDD").subtract(1, "months").format("Do")
              ? moment(from_date, "YYYYMMDD")
                  .subtract(1, "months")
                  .startOf("month")
                  .format("Do ") +
                " - " +
                moment(from_date, "YYYYMMDD")
                  .subtract(1, "months")
                  .format("Do MMMM, YYYY")
              : moment(from_date, "YYYYMMDD")
                  .subtract(1, "months")
                  .startOf("month")
                  .format("Do MMMM"),
          amount: 0,
          count: 0,
          dateFrom: trendDate_previousMonth_from,
          dateTo: trendDate_previousMonth_to,
        },
        {
          tag:
            "Previous Month (" +
            moment(from_date, "YYYYMMDD").subtract(1, "months").format("MMMM") +
            ") - Overall",
          range:
            moment(from_date, "YYYYMMDD")
              .subtract(1, "months")
              .startOf("month")
              .format("Do ") +
            " - " +
            moment(from_date, "YYYYMMDD")
              .subtract(1, "months")
              .endOf("month")
              .format("Do MMMM, YYYY"),
          amount: 0,
          count: 0,
          dateFrom: trendDate_previousMonth_from,
          dateTo: trendDate_previousMonth_end,
        },
        {
          tag:
            "Last Year " +
            moment(from_date, "YYYYMMDD")
              .subtract(1, "years")
              .format("MMM (YYYY)") +
            " - Till " +
            moment(from_date, "YYYYMMDD").subtract(1, "years").format("Do"),
          range:
            moment(from_date, "YYYYMMDD")
              .subtract(1, "years")
              .startOf("month")
              .format("Do") !=
            moment(from_date, "YYYYMMDD").subtract(1, "years").format("Do")
              ? moment(from_date, "YYYYMMDD")
                  .subtract(1, "years")
                  .startOf("month")
                  .format("Do ") +
                " - " +
                moment(from_date, "YYYYMMDD")
                  .subtract(1, "years")
                  .format("Do MMMM, YYYY")
              : moment(from_date, "YYYYMMDD")
                  .subtract(1, "years")
                  .format("Do MMMM, YYYY"),
          amount: 0,
          count: 0,
          dateFrom: trendDate_lastYear_from,
          dateTo: trendDate_lastYear_to,
        },
        {
          tag:
            "Last Year " +
            moment(from_date, "YYYYMMDD")
              .subtract(1, "years")
              .format("MMM (YYYY)") +
            " - Overall",
          range:
            moment(from_date, "YYYYMMDD")
              .subtract(1, "years")
              .startOf("month")
              .format("Do") +
            " - " +
            moment(from_date, "YYYYMMDD")
              .subtract(1, "years")
              .endOf("month")
              .format("Do MMMM, YYYY"),
          amount: 0,
          count: 0,
          dateFrom: trendDate_lastYear_from,
          dateTo: trendDate_lastYear_end,
        },
      ];

      i = 0;
      while (i < overalSalesTrend.length) {
        temp_totalPaid = 0;
        data = await self.SummaryModel.getGrandTotalByType(
          "grandtotal_paidamount",
          overalSalesTrend[i].dateFrom,
          overalSalesTrend[i].dateTo
        ).catch((error) => {
          throw error;
        });

        if (_.isEmpty(data)) {
          throw new ErrorResponse(
            ResponseType.NO_RECORD_FOUND,
            ErrorType.no_records_found_for_grandtotal_paidamount
          );
        }

        temp_totalPaid = data.rows[0] ? data.rows[0].value.sum : 0;
        overalSalesTrend[i].count = data.rows[0] ? data.rows[0].value.count : 0;

        data = await self.SummaryModel.getGrossRefunds(
          overalSalesTrend[i].dateFrom,
          overalSalesTrend[i].dateTo
        ).catch((error) => {
          throw error;
        });

        overalSalesTrend[i].amount =
          temp_totalPaid - (data.rows[0] ? data.rows[0].value.sum : 0);

        i++;
      }

      responseList["OVERALL_SALES_TREND"] = overalSalesTrend;
    }

    data = await self
      .fetchSummaryBySalesfilteredBySessions(from_date, to_date)
      .catch((error) => {
        throw error;
      });
    responseList["SALES_BY_SESSIONS"] = data[0].summary;

    data = await self.SummaryModel.getHourlySalesSum(from_date, to_date).catch(
      (error) => {
        throw error;
      }
    );

    i = 0;
    let j = 0;
    let isFound = false;
    let hourlySalesSum = [];

    while (i < data.rows.length) {
      j = 0;
      isFound = false;
      do {
        if (
          hourlySalesSum[j] &&
          hourlySalesSum[j].hour_slot == data.rows[i].key[2]
        ) {
          hourlySalesSum[j].count++;
          hourlySalesSum[j].amount += data.rows[i].value;
          isFound = true;
          break;
        }
        j++;
      } while (j < hourlySalesSum.length);

      if (!isFound) {
        hourlySalesSum.push({
          hour_slot: data.rows[i].key[2],
          count: 1,
          amount: data.rows[i].value,
        });
      }
      i++;
    }

    for (i = 0; i < 24; i++) {
      j = 0;
      while (hourlySalesSum[j]) {
        if (hourlySalesSum[j].hour_slot == i) {
          break;
        }

        if (j == hourlySalesSum.length - 1) {
          hourlySalesSum.push({
            hour_slot: i,
            count: 0,
            amount: 0,
          });
        }

        j++;
      }
    }

    hourlySalesSum.sort(function (obj1, obj2) {
      return obj1.hour_slot - obj2.hour_slot;
    });

    var midnightEmptyCheck = true;
    j = 0;
    while (hourlySalesSum[j] && j <= 11) {
      if (hourlySalesSum[j].count != 0) {
        midnightEmptyCheck = false;
        break;
      }
      j++;
    }

    if (midnightEmptyCheck) {
      hourlySalesSum = hourlySalesSum.splice(11, 23);
    }

    data = await self
      .fetchSummaryBySalesfilteredByHour("All Orders", from_date, to_date)
      .catch((error) => {
        throw error;
      });

    for (i = 0; i < data[0].summary.length; i++) {
      for (j = 0; j < hourlySalesSum.length; j++) {
        if (data[0].summary[i].hour_slot == hourlySalesSum[j].hour_slot) {
          hourlySalesSum[j].number_of_guests =
            data[0].summary[i].number_of_guests;
          break;
        }
      }
    }

    responseList["HOURLY_SALES_DATA"] = hourlySalesSum;

    if (from_date == to_date) {
      j = 0;
      let dayByDaySalesData = [];
      var start_date = moment(from_date, "YYYYMMDD")
        .startOf("month")
        .format("YYYYMMDD");
      do {
        var processing_date = moment(start_date, "YYYYMMDD")
          .add(j, "days")
          .format("YYYYMMDD");
        data = await self.SummaryModel.getGrandTotalByType(
          "grandtotal_paidamount",
          processing_date,
          processing_date
        ).catch((error) => {
          throw error;
        });
        if (_.isEmpty(data)) {
          throw new ErrorResponse(
            ResponseType.NO_RECORD_FOUND,
            ErrorType.no_matching_results
          );
        }
        var tempCount = 0;
        var tempValue = 0;

        if (!_.isEmpty(data.rows) && data.rows.length > 0) {
          (tempCount = data.rows[0].value.count),
            (tempValue = data.rows[0].value.sum);
        }

        dayByDaySalesData.push({
          date: moment(processing_date, "YYYYMMDD").format("DD MMM 'YY"),
          day: moment(processing_date, "YYYYMMDD").format("dddd"),
          count: tempCount,
          netAmount: tempValue,
        });

        data = await self.SummaryModel.getGrandTotalByType(
          "grandtotal_discounts",
          processing_date,
          processing_date
        ).catch((error) => {
          throw error;
        });
        if (_.isEmpty(data)) {
          throw new ErrorResponse(
            ResponseType.NO_RECORD_FOUND,
            ErrorType.no_matching_results
          );
        }
        tempValue = 0;
        if (!_.isEmpty(data.rows) && data.rows.length > 0) {
          tempValue = data.rows[0].value.sum;
        }
        dayByDaySalesData[j].discount = tempValue;

        data = await self.SummaryModel.getGrandTotalByType(
          "grandtotal_netamount",
          processing_date,
          processing_date
        ).catch((error) => {
          throw error;
        });
        if (_.isEmpty(data)) {
          throw new ErrorResponse(
            ResponseType.NO_RECORD_FOUND,
            ErrorType.no_matching_results
          );
        }

        tempValue = 0;
        if (!_.isEmpty(data.rows) && data.rows.length > 0) {
          tempValue = data.rows[0].value.sum;
        }
        dayByDaySalesData[j].grossSales = tempValue;

        data = await self.SummaryModel.getGrossRefunds(
          processing_date,
          processing_date
        ).catch((error) => {
          throw error;
        });
        if (_.isEmpty(data)) {
          throw new ErrorResponse(
            ResponseType.NO_RECORD_FOUND,
            ErrorType.no_matching_results
          );
        }

        tempValue = 0;
        if (!_.isEmpty(data.rows) && data.rows.length > 0) {
          tempValue = data.rows[0].value.sum;
        }
        dayByDaySalesData[j].netRefund = tempValue;

        data = await self.SummaryModel.getNetRefunds(
          processing_date,
          processing_date
        ).catch((error) => {
          throw error;
        });
        if (_.isEmpty(data)) {
          throw new ErrorResponse(
            ResponseType.NO_RECORD_FOUND,
            ErrorType.no_matching_results
          );
        }

        tempValue = 0;
        if (!_.isEmpty(data.rows) && data.rows.length > 0) {
          tempValue = data.rows[0].value.sum;
        }
        dayByDaySalesData[j].grossRefund = tempValue;

        var billing_parameters = [];
        i = 0;

        try {
          data = await self.getAllBillingParameters();
          billing_parameters = data.value;
        } catch (error) {
          throw error;
        }

        var extrasByBillingMode = [];

        while (i < billing_parameters.length) {
          data = await self.SummaryModel.getTotalExtrasByBillingParameter(
            billing_parameters[i].name,
            processing_date,
            processing_date
          ).catch((error) => {
            throw error;
          });
          if (_.isEmpty(data)) {
            throw new ErrorResponse(
              ResponseType.NO_RECORD_FOUND,
              ErrorType.no_matching_results
            );
          } else if (_.isEmpty(data.rows[0])) {
            extrasByBillingMode.push({
              name: billing_parameters[i].name,
              value: 0,
            });
          } else {
            extrasByBillingMode.push({
              type: billing_parameters[i].name,
              value: data.rows[0].value.sum,
            });
          }

          //Now check in custom Extras

          data = await self.SummaryModel.getTotalCustomExtrasByBillingParameter(
            billing_parameters[i].name,
            processing_date,
            processing_date
          ).catch((error) => {
            throw error;
          });
          if (_.isEmpty(data)) {
            throw new ErrorResponse(
              ResponseType.NO_RECORD_FOUND,
              ErrorType.no_matching_results
            );
          } else if (_.isEmpty(data.rows[0])) {
            extrasByBillingMode[i].value += 0;
          } else {
            extrasByBillingMode[i].value += data.rows[0].value.sum;
          }
          i++;
        }

        dayByDaySalesData[j].extras = extrasByBillingMode;

        data = await self.SummaryModel.getGrandTotalByType(
          "totalguests",
          processing_date,
          processing_date
        ).catch((error) => {
          throw error;
        });
        if (_.isEmpty(data)) {
          throw new ErrorResponse(
            ResponseType.NO_RECORD_FOUND,
            ErrorType.no_matching_results
          );
        }

        tempValue = 0;
        if (!_.isEmpty(data.rows) && data.rows.length > 0) {
          tempValue = data.rows[0].value.sum;
        }
        dayByDaySalesData[j].guestCount = tempValue;

        j++;
      } while (processing_date != from_date);

      responseList["DAY_BY_DAY_SALES_DATA"] = dayByDaySalesData;

      var current_year = moment(from_date, "YYYYMMDD").format("YYYY");
      var current_month = moment(from_date, "YYYYMMDD").format("MM");
      var begin_date = moment(current_year + "0101", "YYYYMMDD").format(
        "YYYYMMDD"
      );
      j = 0;
      let monthByMonthSalesData = [];
      do {
        var date_starting = moment(begin_date, "YYYYMMDD")
          .add(j, "months")
          .format("YYYYMMDD");
        var date_ending = moment(date_starting, "YYYYMMDD")
          .endOf("month")
          .format("YYYYMMDD");
        var processing_month = moment(date_starting, "YYYYMMDD").format("MM");

        if (processing_month == current_month) {
          //Until today only.
          date_ending = moment(to_date, "YYYYMMDD").format("YYYYMMDD");
        }

        data = await self.SummaryModel.getGrandTotalByType(
          "grandtotal_paidamount",
          date_starting,
          date_ending
        ).catch((error) => {
          throw error;
        });
        if (_.isEmpty(data)) {
          throw new ErrorResponse(
            ResponseType.NO_RECORD_FOUND,
            ErrorType.no_matching_results
          );
        }
        tempCount = 0;
        tempValue = 0;

        if (!_.isEmpty(data.rows) && data.rows.length > 0) {
          (tempCount = data.rows[0].value.count),
            (tempValue = data.rows[0].value.sum);
        }

        monthByMonthSalesData.push({
          tag: moment(date_starting, "YYYYMMDD").format("MMMM, YYYY"),
          range:
            moment(date_starting, "YYYYMMDD").format("Do") +
            " - " +
            moment(date_ending, "YYYYMMDD").format("Do MMM"),
          days:
            moment(date_ending, "YYYYMMDD").diff(
              moment(date_starting, "YYYYMMDD"),
              "days"
            ) + 1,
          date_start: moment(date_starting, "YYYYMMDD").format("YYYYMMDD"),
          date_end: moment(date_ending, "YYYYMMDD").format("YYYYMMDD"),
          count: tempCount,
          netAmount: tempValue,
        });

        data = await self.SummaryModel.getGrandTotalByType(
          "grandtotal_discounts",
          date_starting,
          date_ending
        ).catch((error) => {
          throw error;
        });
        if (_.isEmpty(data)) {
          throw new ErrorResponse(
            ResponseType.NO_RECORD_FOUND,
            ErrorType.no_matching_results
          );
        }
        tempValue = 0;
        if (!_.isEmpty(data.rows) && data.rows.length > 0) {
          tempValue = data.rows[0].value.sum;
        }
        monthByMonthSalesData[j].discount = tempValue;

        data = await self.SummaryModel.getGrandTotalByType(
          "grandtotal_netamount",
          date_starting,
          date_ending
        ).catch((error) => {
          throw error;
        });
        if (_.isEmpty(data)) {
          throw new ErrorResponse(
            ResponseType.NO_RECORD_FOUND,
            ErrorType.no_matching_results
          );
        }

        tempValue = 0;
        if (!_.isEmpty(data.rows) && data.rows.length > 0) {
          tempValue = data.rows[0].value.sum;
        }
        monthByMonthSalesData[j].grossSales = tempValue;

        data = await self.SummaryModel.getGrossRefunds(
          date_starting,
          date_ending
        ).catch((error) => {
          throw error;
        });
        if (_.isEmpty(data)) {
          throw new ErrorResponse(
            ResponseType.NO_RECORD_FOUND,
            ErrorType.no_matching_results
          );
        }

        tempValue = 0;
        if (!_.isEmpty(data.rows) && data.rows.length > 0) {
          tempValue = data.rows[0].value.sum;
        }
        monthByMonthSalesData[j].netRefund = tempValue;

        data = await self.SummaryModel.getNetRefunds(
          date_starting,
          date_ending
        ).catch((error) => {
          throw error;
        });
        if (_.isEmpty(data)) {
          throw new ErrorResponse(
            ResponseType.NO_RECORD_FOUND,
            ErrorType.no_matching_results
          );
        }

        tempValue = 0;
        if (!_.isEmpty(data.rows) && data.rows.length > 0) {
          tempValue = data.rows[0].value.sum;
        }
        monthByMonthSalesData[j].grossRefund = tempValue;

        i = 0;
        extrasByBillingMode = [];

        while (i < billing_parameters.length) {
          data = await self.SummaryModel.getTotalExtrasByBillingParameter(
            billing_parameters[i].name,
            date_starting,
            date_ending
          ).catch((error) => {
            throw error;
          });
          if (_.isEmpty(data)) {
            throw new ErrorResponse(
              ResponseType.NO_RECORD_FOUND,
              ErrorType.no_matching_results
            );
          } else if (_.isEmpty(data.rows[0])) {
            extrasByBillingMode.push({
              name: billing_parameters[i].name,
              value: 0,
            });
          } else {
            extrasByBillingMode.push({
              type: billing_parameters[i].name,
              value: data.rows[0].value.sum,
            });
          }

          //Now check in custom Extras

          data = await self.SummaryModel.getTotalCustomExtrasByBillingParameter(
            billing_parameters[i].name,
            date_starting,
            date_ending
          ).catch((error) => {
            throw error;
          });
          if (_.isEmpty(data)) {
            throw new ErrorResponse(
              ResponseType.NO_RECORD_FOUND,
              ErrorType.no_matching_results
            );
          } else if (_.isEmpty(data.rows[0])) {
            extrasByBillingMode[i].value += 0;
          } else {
            extrasByBillingMode[i].value += data.rows[0].value.sum;
          }
          i++;
        }

        monthByMonthSalesData[j].extras = extrasByBillingMode;

        data = await self.SummaryModel.getGrandTotalByType(
          "totalguests",
          date_starting,
          date_ending
        ).catch((error) => {
          throw error;
        });
        if (_.isEmpty(data)) {
          throw new ErrorResponse(
            ResponseType.NO_RECORD_FOUND,
            ErrorType.no_matching_results
          );
        }

        tempValue = 0;
        if (!_.isEmpty(data.rows) && data.rows.length > 0) {
          tempValue = data.rows[0].value.sum;
        }
        monthByMonthSalesData[j].guestCount = tempValue;

        j++;
      } while (processing_month != current_month);

      responseList["MONTH_BY_MONTH_SALES_DATA"] = monthByMonthSalesData;
    }

    data = await self.fetchSummaryByDiscounts(from_date, to_date);

    responseList["DISCOUNTS"] = [];
    j = 0;
    while (data[0].summary[j]) {
      if (data[0].summary[j].sum > 0) {
        responseList["DISCOUNTS"].push(data[0].summary[j]);
      }
      j++;
    }

    data = await self
      .fetchSummaryBySalesfilteredByItems(from_date, to_date)
      .catch((error) => {
        throw error;
      });
    responseList["SALES_BY_ITEMS"] = data[0].summary.slice(0, 20);

    data = await self
      .fetchSummaryBySalesfilteredByItemsDetailed(from_date, to_date)
      .catch((error) => {
        throw error;
      });
    j = 0;
    while (data[0].summary[j]) {
      if (
        data[0].summary[j].category == "MANUAL_UNKNOWN" ||
        data[0].summary[j].category == "UNKNOWN"
      ) {
        data[0].summary[j].category = "Uncategorized";
      }
      j++;
    }

    if (data[0].summary.length > 0) {
      var n = 0;
      while (data[0].summary[n]) {
        //render category

        var itemsTotalSales = 0;
        var itemsTotalCount = 0;

        for (i = 0; i < data[0].summary[n].items.length; i++) {
          itemsTotalSales += data[0].summary[n].items[i].saleAmount;
          itemsTotalCount += data[0].summary[n].items[i].count;
        }

        data[0].summary[n].totalSales = itemsTotalSales;
        data[0].summary[n].totalCount = itemsTotalCount;
        delete data[0].summary[n].items;

        n++;
      }
    }

    var catalogData = await self.getMenuCatalog().catch((error) => {
      throw error;
    });
    j = 0;
    while (data[0].summary[j]) {
      data[0].summary[j].topCategory = getTopLevelCategory(
        data[0].summary[j].category
      );
      j++;
    }

    function getTopLevelCategory(category_name) {
      for (var i = 0; i < catalogData.value.length; i++) {
        if (catalogData.value[i].name == category_name) {
          return catalogData.value[i].mainType;
          break;
        }
      }

      return "Uncategorized";
    }

    responseList["SALES_BY_ITEMS_DETAILED"] = data[0].summary;

    if (from_date == to_date) {
      data = await self
        .fetchSummaryByItemCancellationsDetailed(from_date, to_date)
        .catch((error) => {
          throw error;
        });

      responseList["ITEM_CANCELLATIONS"] = data[0].summary;

      var filter_start = moment(from_date, "YYYYMMDD").format("DD-MM-YYYY");
      var cancelledOrders = [];
      i = 0;
      data = await self.SummaryModel.getCancelledOrdersDetailed(
        filter_start,
        filter_start
      ).catch((error) => {
        throw error;
      });

      if (_.isEmpty(data)) {
        throw new ErrorResponse(
          ResponseType.NO_RECORD_FOUND,
          ErrorType.no_matching_results
        );
      } else {
        while (!_.isEmpty(data.rows) && i < data.rows.length) {
          delete data.rows[i].value._id;
          delete data.rows[i].value._rev;
          cancelledOrders.push(data.rows[i].value);
          i++;
        }
      }

      responseList["ORDER_CANCELLATIONS"] = cancelledOrders;

      filter_start = moment(from_date, "YYYYMMDD").format("DD-MM-YYYY");
      var cancelledInvoices = [];
      i = 0;
      data = await self.SummaryModel.getCancelledInvoicesDetailed(
        filter_start,
        filter_start
      ).catch((error) => {
        throw error;
      });

      if (_.isEmpty(data)) {
        throw new ErrorResponse(
          ResponseType.NO_RECORD_FOUND,
          ErrorType.no_matching_results
        );
      } else {
        while (!_.isEmpty(data.rows) && i < data.rows.length) {
          delete data.rows[i].value._id;
          delete data.rows[i].value._rev;
          cancelledInvoices.push(data.rows[i].value);
          i++;
        }
      }

      responseList["INVOICE_CANCELLATIONS"] = cancelledInvoices;
    }

    data = await self
      .fetchSummaryByBillCancellations(from_date, to_date)
      .catch((error) => {
        throw error;
      });
    responseList["BILL_CANCELLATIONS"] = data.BILL_CANCELLATIONS;
    responseList["UNPAID_BILLS"] = data.UNPAID_BILLS;
    responseList["PAID_BILLS"] = data.PAID_BILLS;

    data = await self
      .fetchSummaryBySalesfilteredByBillingMode(from_date, to_date, curr_date)
      .catch((error) => {
        throw error;
      });
    responseList["SALES_BY_BILLING_MODE"] = data.SALES_BY_BILLING_MODE;

    i = 0;
    var billing_modes = [];

    try {
      data = await self.getAllBillingModes();
      billing_modes = data.value;
    } catch (error) {
      throw error;
    }

    while (i < billing_modes.length) {
      data = await self
        .fetchSummaryBySalesfilteredByBillingModeDetailedByExtras(
          billing_modes[i].name,
          from_date,
          to_date
        )
        .catch((error) => {
          throw error;
        });
      responseList[data[0].type + "_BILLING_MODE"] = data[0].summary;
      i++;
    }

    data = await self
      .fetchSummaryBySalesfilteredByPaymentMode(from_date, to_date)
      .catch((error) => {
        throw error;
      });
    responseList["SALES_BY_PAYMENT_MODE"] = data[0].summary;

    i = 0;
    var payment_modes = [];

    try {
      data = await self.getAllPaymentModes();
      payment_modes = data.value;
    } catch (error) {
      throw error;
    }

    while (i < payment_modes.length) {
      data = await self
        .fetchSummaryBySalesfilteredByPaymentModeDetailed(
          payment_modes[i].code,
          from_date,
          to_date
        )
        .catch((error) => {
          throw error;
        });
      responseList[data[0].type + "_PAYMENT_MODE"] = data[0].summary;
      i++;
    }

    i = 1;
    var weeklyProgressLastWeek = [];
    var weeklyProgressThisWeek = [];

    while (i <= 14) {
      var my_date = moment(from_date, "YYYYMMDD")
        .subtract(13 - i, "days")
        .format("YYYYMMDD");

      data = await self.SummaryModel.getGrandTotalByType(
        "grandtotal_paidamount",
        my_date,
        my_date
      ).catch((error) => {
        throw error;
      });
      if (_.isEmpty(data)) {
        throw new ErrorResponse(
          ResponseType.NO_RECORD_FOUND,
          ErrorType.no_matching_results
        );
      }
      temp_totalPaid = 0;
      var temp_totalOrders = 0;
      var fancyDay = moment(my_date, "YYYYMMDD").format("ddd");
      var fancyDate = moment(my_date, "YYYYMMDD").format("MMM D");

      if (!_.isEmpty(data.rows) && data.rows.length > 0) {
        temp_totalOrders = data.rows[0].value.count;
        temp_totalPaid = data.rows[0].value.sum;
      }

      if (i <= 7) {
        weeklyProgressLastWeek.push({
          name: fancyDay + " (" + fancyDate + ")",
          value: temp_totalPaid,
        });
      } else if (i <= 14) {
        weeklyProgressThisWeek.push({
          name: fancyDay + " (" + fancyDate + ")",
          value: temp_totalPaid,
        });
      }

      i++;
    }

    responseList["WEEKLY_PROGRESS_LAST_WEEK"] = weeklyProgressLastWeek;

    responseList["WEEKLY_PROGRESS_THIS_WEEK"] = weeklyProgressThisWeek;

    return responseList;
  }
}

module.exports = SummaryService;
