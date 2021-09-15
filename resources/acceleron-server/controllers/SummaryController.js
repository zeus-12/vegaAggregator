"use strict";
let BaseController = ACCELERONCORE._controllers.BaseController;
let SummaryService = require("../services/SummaryService");
var _ = require("underscore");
var moment = require("moment");

// a function to check whether a given item is included in a list of items
function checkAvailability(name, list, item) {
  if (!list.includes(item)) {
    throw new ErrorResponse(
      ResponseType.BAD_REQUEST,
      `${name} is empty or invalid`
    );
  }
}

// a function to do initial validation
function initialValidator(ALLOWED_FILTERS, filter_name, from_date, to_date) {
  checkAvailability("Summary type", ALLOWED_FILTERS, filter_name);

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

  async fetchSummaryByType() {
    let self = this;
    var from_date = self.request.query.startdate;
    var to_date = self.request.query.enddate;
    var summary_type = self.request.params.summaryType;

    var ALLOWED_TYPES = [
      "sales",
      "discounts",
      "refunds",
      "billcancellations",
      "itemcancellations",
      "quicksummary",
    ];

    initialValidator(ALLOWED_TYPES, summary_type, from_date, to_date);

    switch (summary_type) {
      case "sales": {
        var sales_filter = self.request.query.salesfilter;
        var detailed_by = self.request.query.detailedby;

        if (_.isEmpty(sales_filter) || _.isEmpty(detailed_by)) {
          throw new ErrorResponse(
            ResponseType.BAD_REQUEST,
            ErrorType.missing_required_parameters
          );
        }

        var ALLOWED_SALES_FILTERS = [
          "BILLING_MODE",
          "PAYMENT_MODE",
          "SESSIONS",
          "ITEMS",
          "HOUR",
        ];

        checkAvailability("Sales filter", ALLOWED_SALES_FILTERS, sales_filter);

        // Different ways in which sales summary can be fetched
        switch (sales_filter) {
          case "BILLING_MODE": {
            if (detailed_by == "false") {
              var curr_date = moment().format("YYYYMMDD");
              try {
                const data =
                  await self.SummaryService.fetchSummaryBySalesfilteredByBillingMode(
                    from_date,
                    to_date,
                    curr_date
                  );
                return data;
              } catch (error) {
                throw error;
              }
            } else {
              var ALLOWED_FILTER_PARAMETERS = [];
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

              checkAvailability(
                "Billing mode",
                ALLOWED_FILTER_PARAMETERS,
                detailed_by
              );

              try {
                const data =
                  await self.SummaryService.fetchSummaryBySalesfilteredByBillingModeDetailed(
                    detailed_by,
                    from_date,
                    to_date
                  );
                return data;
              } catch (error) {
                throw error;
              }
            }
          }

          case "PAYMENT_MODE": {
            if (detailed_by == "false") {
              try {
                const data =
                  await self.SummaryService.fetchSummaryBySalesfilteredByPaymentMode(
                    from_date,
                    to_date
                  );
                return data;
              } catch (error) {
                throw error;
              }
            } else {
              var ALLOWED_FILTER_PARAMETERS = [];
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

              checkAvailability(
                "Payment mode",
                ALLOWED_FILTER_PARAMETERS,
                detailed_by
              );

              try {
                const data =
                  await self.SummaryService.fetchSummaryBySalesfilteredByPaymentModeDetailed(
                    detailed_by,
                    from_date,
                    to_date
                  );
                return data;
              } catch (error) {
                throw error;
              }
            }
          }

          case "SESSIONS": {
            try {
              const data =
                await self.SummaryService.fetchSummaryBySalesfilteredBySessions(
                  from_date,
                  to_date
                );
              return data;
            } catch (error) {
              throw error;
            }
          }

          case "ITEMS": {
            try {
              const data =
                await self.SummaryService.fetchSummaryBySalesfilteredByItems(
                  from_date,
                  to_date
                );
              return data;
            } catch (error) {
              throw error;
            }
          }

          case "HOUR": {
            var filter_type = self.request.query.filterType;
            var ALLOWED_FILTER_TYPES = [];
            try {
              const data = await self.SummaryService.getAllBillingModes();
              for (var i = 0; i < data.value.length; i++) {
                ALLOWED_FILTER_TYPES = [
                  ...ALLOWED_FILTER_TYPES,
                  data.value[i].name,
                ];
              }
            } catch (error) {
              throw error;
            }

            ALLOWED_FILTER_TYPES.push("All Orders");

            checkAvailability("Filter type", ALLOWED_FILTER_TYPES, filter_type);

            if (_.isEmpty(filter_type)) {
              throw new ErrorResponse(
                ResponseType.BAD_REQUEST,
                ErrorType.missing_required_parameters
              );
            }
            try {
              const data =
                await self.SummaryService.fetchSummaryBySalesfilteredByHour(
                  filter_type,
                  from_date,
                  to_date
                );
              return data;
            } catch (error) {
              throw error;
            }
          }
        }
        break;
      }

      case "discounts": {
        try {
          const data = await self.SummaryService.fetchSummaryByDiscounts(
            from_date,
            to_date
          );
          return data;
        } catch (error) {
          throw error;
        }
      }

      case "refunds": {
        try {
          const data = await self.SummaryService.fetchSummaryByRefunds(
            from_date,
            to_date
          );
          return data;
        } catch (error) {
          throw error;
        }
      }

      case "billcancellations": {
        try {
          const data =
            await self.SummaryService.fetchSummaryByBillCancellations(
              from_date,
              to_date
            );
          return data;
        } catch (error) {
          throw error;
        }
      }

      case "itemcancellations": {
        var detailed_by = self.request.query.detailedby;

        if (_.isEmpty(detailed_by)) {
          throw new ErrorResponse(
            ResponseType.BAD_REQUEST,
            ErrorType.missing_required_parameters
          );
        }

        if (detailed_by == "false") {
          try {
            const data =
              await self.SummaryService.fetchSummaryByItemCancellations(
                from_date,
                to_date
              );
            return data;
          } catch (error) {
            throw error;
          }
        } else if (detailed_by == "true") {
          try {
            const data =
              await self.SummaryService.fetchSummaryByItemCancellationsDetailed(
                from_date,
                to_date
              );
            return data;
          } catch (error) {
            throw error;
          }
        } else {
          throw new ErrorResponse(
            ResponseType.BAD_REQUEST,
            "datailed_by should be either 'true' or 'false' "
          );
        }
      }

      case "quicksummary": {
        try {
          const data = await self.SummaryService.fetchOverAllTurnOver(
            from_date,
            to_date
          );
          return data;
        } catch (error) {
          throw error;
        }
      }
    }
  }
}

module.exports = SummaryController;
