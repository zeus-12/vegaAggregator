"use strict";
let BaseModel = ACCELERONCORE._models.BaseModel;
var _ = require('underscore');
let SELECTED_INVOICE_SOURCE_DB = 'accelerate_invoices';
let CANCELLED_INVOICE_SOURCE_DB = "accelerate_cancelled_invoices";
let CANCELLED_ITEMS_SOURCE_DB = "accelerate_item_cancellations";

class SummaryModel extends BaseModel {
  constructor(request) {
    super(request);
    this.couch = ACCELERONCORE._connectors.CouchDBAsync;
  }
  async getDiscounts(discountType, from_date, to_date) {
    const data = await this.couch
      .get(
        "/" +
          SELECTED_INVOICE_SOURCE_DB +
          '/_design/invoice-summary/_view/sumbydiscounts?startkey=["' +
          discountType +
          '","' +
          from_date +
          '"]&endkey=["' +
          discountType +
          '","' +
          to_date +
          '"]'
      )
      .catch((error) => {
        throw error;
      });

    return data;
  }

  async getCancelledBills(billingMode, from_date, to_date) {
    const data = await this.couch
      .get(
        "/" +
          CANCELLED_INVOICE_SOURCE_DB +
          '/_design/invoice-summary/_view/sumbybillingmode?startkey=["' +
          billingMode +
          '","' +
          from_date +
          '"]&endkey=["' +
          billingMode +
          '","' +
          to_date +
          '"]'
      )
      .catch((error) => {
        throw error;
      });

    return data;
  }

  async getCancelledItems(from_date, to_date) {
    const data = await this.couch
      .get(
        "/" +
          CANCELLED_ITEMS_SOURCE_DB +
          '/_design/cancellation-summary/_view/itemscount?startkey=["' +
          from_date +
          '"]&endkey=["' +
          to_date +
          '", {}]&group=true'
      )
      .catch((error) => {
        throw error;
      });

    return data;
  }

  async getSalesByItems(from_date, to_date) {
    const data = await this.couch
      .get(
        "/" +
          SELECTED_INVOICE_SOURCE_DB +
          '/_design/order-summary/_view/itemsCount?startkey=["' +
          from_date +
          '"]&endkey=["' +
          to_date +
          '", {}]&group=true'
      )
      .catch((error) => {
        throw error;
      });

    return data;
  }

  async getGrandTotalByType(grandTotalType, from_date, to_date) {
    const data = await this.couch
      .get(
        "/" +
          SELECTED_INVOICE_SOURCE_DB +
          "/_design/invoice-summary/_view/" +
          grandTotalType +
          '?startkey=["' +
          from_date +
          '"]&endkey=["' +
          to_date +
          '"]'
      )
      .catch((error) => {
        throw error;
      });

    return data;
  }

  async getHourlySales(filter_type, from_date, to_date) {
    var custom_filter_url;
    if (filter_type == "All Orders") {
      custom_filter_url =
        "/" +
        SELECTED_INVOICE_SOURCE_DB +
        '/_design/invoice-summary/_view/timeslotwise_countoverall?startkey=["ANY_MODE","' +
        from_date +
        '", 0]&endkey=["ANY_MODE","' +
        to_date +
        '", 23]';
    } else {
      custom_filter_url =
        "/" +
        SELECTED_INVOICE_SOURCE_DB +
        '/_design/invoice-summary/_view/timeslotwise_countbymode?startkey=["' +
        filter_type +
        '", "' +
        from_date +
        '", 0]&endkey=["' +
        filter_type +
        '", "' +
        to_date +
        '", 23]';
    }
    const data = await this.couch.get(custom_filter_url).catch((error) => {
      throw error;
    });

    return data;
  }

  async getCancelledBillsByPaymentStatus(paymentStatus, from_date, to_date) {
    const data = await this.couch
      .get(
        "/" +
          CANCELLED_INVOICE_SOURCE_DB +
          '/_design/invoice-summary/_view/sumbypaymentstatus?startkey=["' +
          paymentStatus +
          '","' +
          from_date +
          '"]&endkey=["' +
          paymentStatus +
          '","' +
          to_date +
          '"]'
      )
      .catch((error) => {
        throw error;
      });

    return data;
  }

  async getTotalExtrasByBillingParameter(billingParameter, from_date, to_date) {
    const data = await this.couch
      .get(
        "/" +
          SELECTED_INVOICE_SOURCE_DB +
          '/_design/invoice-summary/_view/sumbyextras?startkey=["' +
          billingParameter +
          '","' +
          from_date +
          '"]&endkey=["' +
          billingParameter +
          '","' +
          to_date +
          '"]'
      )
      .catch((error) => {
        throw error;
      });

    return data;
  }

  async getTotalCustomExtrasByBillingParameter(
    billingParameter,
    from_date,
    to_date
  ) {
    const data = await this.couch
      .get(
        "/" +
          SELECTED_INVOICE_SOURCE_DB +
          '/_design/invoice-summary/_view/sumbyextras_custom?startkey=["' +
          billingParameter +
          '","' +
          from_date +
          '"]&endkey=["' +
          billingParameter +
          '","' +
          to_date +
          '"]'
      )
      .catch((error) => {
        throw error;
      });

    return data;
  }

  async getSalesByBillingMode(billingMode, from_date, to_date) {
    const data = await this.couch
      .get(
        "/" +
          SELECTED_INVOICE_SOURCE_DB +
          '/_design/invoice-summary/_view/sumbybillingmode?startkey=["' +
          billingMode +
          '","' +
          from_date +
          '"]&endkey=["' +
          billingMode +
          '","' +
          to_date +
          '"]'
      )
      .catch((error) => {
        throw error;
      });

    return data;
  }

  async getGrossRefunds(from_date, to_date) {
    const data = await this.couch
      .get(
        "/" +
          SELECTED_INVOICE_SOURCE_DB +
          '/_design/refund-summary/_view/allrefunds?startkey=["' +
          from_date +
          '"]&endkey=["' +
          to_date +
          '"]'
      )
      .catch((error) => {
        throw error;
      });

    return data;
  }

  async getNetRefunds(from_date, to_date) {
    const data = await this.couch
      .get(
        "/" +
          SELECTED_INVOICE_SOURCE_DB +
          '/_design/refund-summary/_view/allrefunds_netamount?startkey=["' +
          from_date +
          '"]&endkey=["' +
          to_date +
          '"]'
      )
      .catch((error) => {
        throw error;
      });

    return data;
  }

  async getRefundsByBillingMode(billingMode, from_date, to_date) {
    const data = await this.couch
      .get(
        "/" +
          SELECTED_INVOICE_SOURCE_DB +
          '/_design/invoice-summary/_view/sumbybillingmode_refundedamounts?startkey=["' +
          billingMode +
          '","' +
          from_date +
          '"]&endkey=["' +
          billingMode +
          '","' +
          to_date +
          '"]'
      )
      .catch((error) => {
        throw error;
      });

    return data;
  }

  async getUnbilledKOT() {
    const data = await this.couch
      .get("/accelerate_kot/_design/kot-summary/_view/sumbycart")
      .catch((error) => {
        throw error;
      });

    return data;
  }

  async getUnbilledKOTExtras() {
    const data = await this.couch
      .get("/accelerate_kot/_design/kot-summary/_view/sumbyextras")
      .catch((error) => {
        throw error;
      });

    return data;
  }

  async getUnbilledBills(from_date, to_date) {
    const data = await this.couch
      .get(
        '/accelerate_bills/_design/bill-summary/_view/sumbytotalpayable?startkey=["' +
          from_date +
          '"]&endkey=["' +
          to_date +
          '"]'
      )
      .catch((error) => {
        throw error;
      });

    return data;
  }

  async getSalesByBillingAndPaymentMode(
    billing_mode,
    paymentMode,
    from_date,
    to_date
  ) {
    const data = await this.couch
      .get(
        "/" +
          SELECTED_INVOICE_SOURCE_DB +
          '/_design/invoice-summary/_view/sumbybillingandpaymentmodes?startkey=["' +
          billing_mode +
          '","' +
          paymentMode +
          '","' +
          from_date +
          '"]&endkey=["' +
          billing_mode +
          '","' +
          paymentMode +
          '","' +
          to_date +
          '"]'
      )
      .catch((error) => {
        throw error;
      });

    return data;
  }

  async getSplitPaymentsByBillingAndPaymentMode(
    billing_mode,
    paymentMode,
    from_date,
    to_date
  ) {
    const data = await this.couch
      .get(
        "/" +
          SELECTED_INVOICE_SOURCE_DB +
          '/_design/invoice-summary/_view/sumbybillingandpaymentmodes_multiple?startkey=["' +
          billing_mode +
          '","' +
          paymentMode +
          '","' +
          from_date +
          '"]&endkey=["' +
          billing_mode +
          '","' +
          paymentMode +
          '","' +
          to_date +
          '"]'
      )
      .catch((error) => {
        throw error;
      });

    return data;
  }

  async getSalesByPaymentMode(paymentMode, from_date, to_date) {
    const data = await this.couch
      .get(
        "/" +
          SELECTED_INVOICE_SOURCE_DB +
          '/_design/invoice-summary/_view/sumbypaymentmode?startkey=["' +
          paymentMode +
          '","' +
          from_date +
          '"]&endkey=["' +
          paymentMode +
          '","' +
          to_date +
          '"]'
      )
      .catch((error) => {
        throw error;
      });

    return data;
  }

  async getSplitPaymentsByPaymentMode(paymentMode, from_date, to_date) {
    const data = await this.couch
      .get(
        "/" +
          SELECTED_INVOICE_SOURCE_DB +
          '/_design/invoice-summary/_view/sumbypaymentmode_multiple?startkey=["' +
          paymentMode +
          '","' +
          from_date +
          '"]&endkey=["' +
          paymentMode +
          '","' +
          to_date +
          '"]'
      )
      .catch((error) => {
        throw error;
      });

    return data;
  }

  async getRefundsByPaymentMode(paymentMode, from_date, to_date) {
    const data = await this.couch
      .get(
        "/" +
          SELECTED_INVOICE_SOURCE_DB +
          '/_design/invoice-summary/_view/sumbypaymentmode_refundedamounts?startkey=["' +
          paymentMode +
          '","' +
          from_date +
          '"]&endkey=["' +
          paymentMode +
          '","' +
          to_date +
          '"]'
      )
      .catch((error) => {
        throw error;
      });

    return data;
  }

  async getSalesByPaymentModeAndExtras(
    payment_mode,
    billingParameter,
    from_date,
    to_date
  ) {
    const data = await this.couch
      .get(
        "/" +
          SELECTED_INVOICE_SOURCE_DB +
          '/_design/invoice-summary/_view/sumbypaymentmodeandextras?startkey=["' +
          payment_mode +
          '","' +
          billingParameter +
          '","' +
          from_date +
          '"]&endkey=["' +
          payment_mode +
          '","' +
          billingParameter +
          '","' +
          to_date +
          '"]'
      )
      .catch((error) => {
        throw error;
      });

    return data;
  }

  async getCustomExtrasByPaymentModeAndExtras(
    payment_mode,
    billingParameter,
    from_date,
    to_date
  ) {
    const data = await this.couch
      .get(
        "/" +
          SELECTED_INVOICE_SOURCE_DB +
          '/_design/invoice-summary/_view/sumbypaymentmodeandextras_custom?startkey=["' +
          payment_mode +
          '","' +
          billingParameter +
          '","' +
          from_date +
          '"]&endkey=["' +
          payment_mode +
          '","' +
          billingParameter +
          '","' +
          to_date +
          '"]'
      )
      .catch((error) => {
        throw error;
      });

    return data;
  }

  async getSplitPaymentsByPaymentModeAndExtras(
    payment_mode,
    billingParameter,
    from_date,
    to_date
  ) {
    const data = await this.couch
      .get(
        "/" +
          SELECTED_INVOICE_SOURCE_DB +
          '/_design/invoice-summary/_view/sumbypaymentmodeandextras_multiple?startkey=["' +
          payment_mode +
          '","' +
          billingParameter +
          '","' +
          from_date +
          '"]&endkey=["' +
          payment_mode +
          '","' +
          billingParameter +
          '","' +
          to_date +
          '"]'
      )
      .catch((error) => {
        throw error;
      });

    return data;
  }

  async getSplitPaymentsWithCustomExtrasByPaymentModeAndExtras(
    payment_mode,
    billingParameter,
    from_date,
    to_date
  ) {
    const data = await this.couch
      .get(
        "/" +
          SELECTED_INVOICE_SOURCE_DB +
          '/_design/invoice-summary/_view/sumbypaymentmodeandextras_multiple_custom?startkey=["' +
          payment_mode +
          '","' +
          billingParameter +
          '","' +
          from_date +
          '"]&endkey=["' +
          payment_mode +
          '","' +
          billingParameter +
          '","' +
          to_date +
          '"]'
      )
      .catch((error) => {
        throw error;
      });

    return data;
  }

  async getSalesBySessions(from_date, to_date) {
    const data = await this.couch
      .get(
        "/" +
          SELECTED_INVOICE_SOURCE_DB +
          '/_design/invoice-summary/_view/sessionwisesales?startkey=["' +
          from_date +
          '"]&endkey=["' +
          to_date +
          '",{}]'
      )
      .catch((error) => {
        throw error;
      });

    return data;
  }
}

module.exports = SummaryModel;