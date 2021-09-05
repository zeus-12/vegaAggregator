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
    let responseList = [
      {
        type: `Sales_By_Billing_Mode`,
        summary: [],
      },
    ];
    let i = 0;
    let data = {};
    var filter_parameters = [];

    try {
      data = await self.getAllBillingModes();
      filter_parameters = data.value;
    } catch (error) {
      throw error;
    }

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

      data = await self.SummaryModel.getUnbilledKOTExtras().catch((error) => {
        throw error;
      });
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

      data = await self.SummaryModel.getUnbilledBills(from_date, to_date).catch(
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
        type: `datailed_sales_of_${detailed_by}`,
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
  }

  //For a given PAYMENT MODE, the total Sales in the given DATE RANGE
  async fetchSummaryBySalesfilteredByPaymentMode(from_date, to_date) {
    let self = this;
    let responseList = [
      {
        type: `Sales_By_Payment_Mode`,
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
        type: `datailed_sales_of_${detailed_by}`,
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
          ErrorType.no_matching_results
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
  }

  //For a given SESSION, the total Sales in the given DATE RANGE
  async fetchSummaryBySalesfilteredBySessions(from_date, to_date) {
    let self = this;
    let responseList = [
      {
        type: `Sales_By_Sesssions`,
        summary: [],
      },
    ];
    let i = 0;
    let data = {};
    var filter_parameters = [];

    try {
      data = await self.getAllDiningSessions();
      filter_parameters = data.value;
    } catch (error) {
      throw error;
    }

    let j = 0;
    var tempSum;
    var tempCount;
    var tempGuests;

    filter_parameters.push({ name: "Unknown" });

    data = await self.SummaryModel.getSalesBySessions(from_date, to_date).catch(
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
  }

  //For a given ITEM, the total Sales in the given DATE RANGE
  async fetchSummaryBySalesfilteredByItems(from_date, to_date) {
    let self = this;
    let responseList = [
      {
        type: `Sales_By_Items`,
        summary: [],
      },
    ];
    let i = 0;
    let j = 0;
    let k = 0;
    let l = 0;
    let data = {};
    var isCategoryFound = false;
    var isItemFound = false;
    var isCustomOptionFound = false;

    data = await self.SummaryModel.getSalesByItems(from_date, to_date).catch(
      (error) => {
        throw error;
      }
    );

    while (i < data.rows.length) {
      j = 0;
      isCategoryFound = false;
      do {
        if (
          responseList[0].summary[j] &&
          responseList[0].summary[j].category == data.rows[i].key[1]
        ) {
          isCategoryFound = true;
          k = 0;
          isItemFound = false;
          do {
              if (
                responseList[0].summary[j].items[k].name == data.rows[i].key[2]
              ) {
                isItemFound = true;
                if (!data.rows[i].key[3]) {
                  responseList[0].summary[j].items[k].sum +=
                    data.rows[i].key[4] * data.rows[i].value;
                  responseList[0].summary[j].items[k].count +=
                    data.rows[i].value;
                  break;
                } else {
                  l = 0;
                  isCustomOptionFound = false;
                  do {
                    if (
                      responseList[0].summary[j].items[k].customOptions[l] &&
                      responseList[0].summary[j].items[k].customOptions[l]
                        .name == data.rows[i].key[3]
                    ) {
                      isCustomOptionFound = true;
                      responseList[0].summary[j].items[k].customOptions[
                        l
                      ].sum += data.rows[i].key[4] * data.rows[i].value;
                      responseList[0].summary[j].items[k].customOptions[
                        l
                      ].count += data.rows[i].value;
                      break;
                    }
                    l++;
                  } while (
                    l < responseList[0].summary[j].items[k].customOptions.length
                  );
                  if (!isCustomOptionFound) {
                    responseList[0].summary[j].items[k].customOptions.push({
                      name: data.rows[i].key[3],
                      sum: data.rows[i].key[4] * data.rows[i].value,
                      count: data.rows[i].value,
                    });
                  }
                }
              }
            k++;
          } while (k < responseList[0].summary[j].items.length);
          if (!isItemFound) {
            if (!data.rows[i].key[3]) {
              responseList[0].summary[j].items.push({
                name: data.rows[i].key[2],
                sum: data.rows[i].key[4] * data.rows[i].value,
                count: data.rows[i].value,
              });
            } else {
              responseList[0].summary[j].items.push({
                name: data.rows[i].key[2],
                customOptions: [
                  {
                    name: data.rows[i].key[3],
                    sum: data.rows[i].key[4] * data.rows[i].value,
                    count: data.rows[i].value,
                  },
                ],
              });
            }
          }
        }
        j++;
      } while (j < responseList[0].summary.length);

      if (!isCategoryFound) {
        if (!data.rows[i].key[3]) {
          responseList[0].summary.push({
            category: data.rows[i].key[1],
            items: [
              {
                name: data.rows[i].key[2],
                sum: data.rows[i].key[4] * data.rows[i].value,
                count: data.rows[i].value,
              },
            ],
          });
        } else {
          responseList[0].summary.push({
            category: data.rows[i].key[1],
            items: [
              {
                name: data.rows[i].key[2],
                customOptions: [
                  {
                    name: data.rows[i].key[3],
                    sum: data.rows[i].key[4] * data.rows[i].value,
                    count: data.rows[i].value,
                  },
                ],
              },
            ],
          });
        }
      }
      i++;
    }

    return responseList;
  }

  //For a given HOUR, the total Sales in the given DATE RANGE
  async fetchSummaryBySalesfilteredByHour(filter_type, from_date, to_date) {
    let self = this;
    let responseList = [
      {
        type: `${filter_type}_Sales_By_Hour`,
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

    while (i < data.rows.length) {
      j = 0;
      isFound = false;
      do {
        if (
          responseList[0].summary[j] &&
          responseList[0].summary[j].hour == data.rows[i].key[2]
        ) {
          responseList[0].summary[j].count++;
          responseList[0].summary[j].noOfGuests += data.rows[i].value;
          isFound = true;
          break;
        }
        j++;
      } while (j < responseList[0].summary.length);

      if (!isFound) {
        responseList[0].summary.push({
          hour: data.rows[i].key[2],
          count: 1,
          noOfGuests: data.rows[i].value,
        });
      }
      i++;
    }
    return responseList;
  }

  //summary of different type of discounts offered in the given DATE RANGE
  async fetchSummaryByDiscounts(from_date, to_date) {
    let self = this;
    let responseList = [
      {
        type: "Discounts",
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

      if (_.isEmpty(data)) {
        throw new ErrorResponse(
          ResponseType.NO_RECORD_FOUND,
          ErrorType.no_matching_results
        );
      } else if (_.isEmpty(data.rows[0])) {
        responseList[0].summary.push({
          type: filter_parameters[i].name,
          sum: 0,
          count: 0,
        });
      } else {
        responseList[0].summary.push({
          type: filter_parameters[i].name,
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
        type: "Refunds",
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
      i++;
    }
    return responseList;
  }

  //summary of cancelled bills in the given DATE RANGE
  async fetchSummaryByBillCancellations(from_date, to_date) {
    let self = this;
    let responseList = [
      {
        type: "Bill_Cancellations",
        summary: [],
      },
    ];
    let i = 0;
    let data = {};
    var filter_parameters = [];

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
          ErrorType.no_matching_results
        );
      } else if (_.isEmpty(data.rows[0])) {
        responseList.push({
          type: `${payment_status[i]}_BILLS`,
          sum: 0,
          count: 0,
        });
      } else {
        responseList.push({
          type: `${payment_status[i]}_BILLS`,
          sum: data.rows[0].value.sum,
          count: data.rows[0].value.count,
        });
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
        type: "Item_Cancellations",
        summary: [],
      },
    ];
    let i = 0;
    let data = {};

    data = await self.SummaryModel.getCancelledItems(from_date, to_date).catch(
      (error) => {
        throw error;
      }
    );

    console.log(data.rows);

    return responseList;
  }

  async fetchSummaryByType(
    summary_type,
    filter_parameters,
    from_date,
    to_date,
    curr_date
  ) {
    let self = this;
    let responseList = [
      {
        type: `${summary_type}`,
        summary: [],
      },
    ];
    let i = 0;
    let data = {};

    switch (summary_type) {
      case "DISCOUNTS": {
        //summary of different type of discounts offered in the given DATE RANGE

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
          if (_.isEmpty(data)) {
            throw new ErrorResponse(
              ResponseType.NO_RECORD_FOUND,
              ErrorType.no_matching_results
            );
          } else if (_.isEmpty(data.rows[0])) {
            responseList[0].summary.push({
              type: filter_parameters[i].name,
              sum: 0,
              count: 0,
            });
          } else {
            responseList[0].summary.push({
              type: filter_parameters[i].name,
              sum: data.rows[0].value.sum,
              count: data.rows[0].value.count,
            });
          }
          i++;
        }

        return responseList;
        break;
      }

      case "REFUNDS": {
        while (i < filter_parameters.length) {
          //summary of refunds in the given DATE RANGE

          data = await self.SummaryModel.getRefunds(
            filter_parameters[i].code,
            from_date,
            to_date
          ).catch((error) => {
            throw error;
          });
          console.log(data);
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
          i++;
        }
        return responseList;

        break;
      }

      case "BILL_CANCELLATIONS": {
        //summary of cancelled bills in the given DATE RANGE

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
          i++;
        }

        // fetching the sum from paid and unpaid cancelled bills

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
              ErrorType.no_matching_results
            );
          } else if (_.isEmpty(data.rows[0])) {
            responseList[0].summary.push({
              status: payment_status[i],
              sum: 0,
              count: 0,
            });
          } else {
            responseList[0].summary.push({
              status: payment_status[i],
              sum: data.rows[0].value.sum,
              count: data.rows[0].value.count,
            });
          }
          i++;
        }

        return responseList;
        break;
      }
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
