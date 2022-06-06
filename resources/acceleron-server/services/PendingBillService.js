'use strict';
let PendingBillModel = require('../models/PendingBillModel');
let BaseService = ACCELERONCORE._services.BaseService;
class PendingBillService extends BaseService {
  constructor(request) {
    super(request);
    this.request = request;
    this.PendingBillModel = new PendingBillModel(request);
  }

  async search(filter) {
    switch (filter.key.toUpperCase()) {
      case 'CUSTOMER': {
        return this.PendingBillModel.getPendingBillByMobile(filter).catch(
          (error) => {
            throw error;
          },
        );
      }
      case 'AMOUNT': {
        return this.PendingBillModel.getPendingBillByAmount(filter).catch(
          (error) => {
            throw error;
          },
        );
      }
      case 'STEWARD': {
        return this.PendingBillModel.getPendingBillBySteward(filter).catch(
          (error) => {
            throw error;
          },
        );
      }
      case 'MACHINE': {
        return this.PendingBillModel.getPendingBillByMachine(filter).catch(
          (error) => {
            throw error;
          },
        );
      }

      case 'SESSION': {
        return this.PendingBillModel.getPendingBillBySession(filter).catch(
          (error) => {
            throw error;
          },
        );
      }
      case 'DISCOUNT': {
        return this.PendingBillModel.getPendingBillByDiscount(filter).catch(
          (error) => {
            throw error;
          },
        );
      }
      case 'REFUND': {
        return this.PendingBillModel.getPendingBillByDiscount(filter).catch(
          (error) => {
            throw error;
          },
        );
      }
      case 'TABLE': {
        return this.PendingBillModel.getPendingBillByTable(filter).catch(
          (error) => {
            throw error;
          },
        );
      }

      case 'TYPE': {
        return this.PendingBillModel.getPendingBillByBillingMode(filter).catch(
          (error) => {
            throw error;
          },
        );
      }

      case 'PAYMENT': {
        return this.PendingBillModel.getPendingBillByPayment(filter).catch(
          (error) => {
            throw error;
          },
        );
      }

      default: {
        throw new ErrorResponse(
          ResponseType.ERROR,
          ErrorType.invalid_filter_method,
        );
      }
    }
  }

  async searchBill(filter) {
    return this.PendingBillModel.getPendingBillByBillNumber(filter).catch(
      (error) => {
        throw error;
      },
    );
  }

  async fetchDefault(filter) {
    return this.PendingBillModel.getPendingBillByDefault(filter).catch(
      (error) => {
        throw error;
      },
    );
  }

  async filterByDateRange(filter) {
    return this.PendingBillModel.getPendingBillByAll(filter).catch((error) => {
      throw error;
    });
  }

  async applyDiscount(filter) {
    var bill_id = filter.bill_id;

    var type = filter.file.temp.type;
    var unit = filter.file.temp.unit;
    var value = filter.file.temp.value;

    var billing_modes = filter.file.billing_modes;
    //add appropriate filters for this
    var data = await this.searchBill({searchkey: bill_id});

    var file = data;
    var grandPayableBill = 0;

    /*Calculate Discount*/

    var grandSum = 0;
    var grandPackagedSum = 0;

    var n = 0;
    while (file.cart[n]) {
      grandSum += file.cart[n].price * file.cart[n].qty;

      if (file.cart[n].isPackaged) {
        grandPackagedSum += file.cart[n].price * file.cart[n].qty;
      }

      n++;
    }

    grandPayableBill += grandSum;

    var totalDiscount = 0;
    var TotalUserDiscount = value;

    if (unit == 'PERCENTAGE') {
      totalDiscount = grandSum * (TotalUserDiscount / 100);
    } else if (unit == 'FIXED') {
      //calculate discount value
      //discount should include sgst + cgst + etc...

      //TotalUserDiscount = DiscountAmount + ExtrasVariation;

      var extras_fraction = 0;
      for (var g = 0; g < file.extras.length; g++) {
        if (file.extras[g].unit == 'PERCENTAGE') {
          extras_fraction += file.extras[g].value / 100;
        }
      }

      /* custom extras */
      if (file.customExtras.amount && file.customExtras.amount != 0) {
        if (file.customExtras.unit == 'PERCENTAGE') {
          extras_fraction += file.customExtras.value / 100;
        }
      }

      totalDiscount = TotalUserDiscount / (1 + extras_fraction);
    }

    totalDiscount = Math.round(totalDiscount * 100) / 100;
    //Cross Check if it matches with the BILLING MODE Restriction of Discounts
    var g = 0;
    var maximumReached = false;
    while (billing_modes[g]) {
      if (billing_modes[g].name == file.orderDetails.mode) {
        if (!billing_modes[g].isDiscountable) {
          showToast(
            'Error: Discount can not be applied on </b>' +
              billing_modes[g].name +
              '</b> orders',
            '#e74c3c',
          );
          return '';
        } else {
          if (totalDiscount > grandSum) {
            totalDiscount = grandSum;
            maximumReached = true;
          }

          if (totalDiscount > billing_modes[g].maxDiscount) {
            totalDiscount = billing_modes[g].maxDiscount;
            maximumReached = true;
          }
        }
        break;
      }
      g++;
    }

    file.discount.amount = totalDiscount;
    file.discount.type = type;
    file.discount.unit = unit;
    file.discount.value = value;
    file.discount.reference = '';

    /* Recalculate Tax Figures */

    //Re-calculate tax figures (if any Discount applied)

    var calculable_sum_for_all = grandSum - totalDiscount;
    var calculable_sum_for_packaged =
      grandSum - grandPackagedSum - totalDiscount;

    if (calculable_sum_for_all < 0) {
      calculable_sum_for_all = 0;
    }

    if (calculable_sum_for_packaged < 0) {
      calculable_sum_for_packaged = 0;
    }

    for (var g = 0; g < file.extras.length; g++) {
      if (file.extras[g].unit == 'PERCENTAGE') {
        if (file.extras[g].isPackagedExcluded) {
          var new_amount =
            (file.extras[g].value / 100) * calculable_sum_for_packaged;
          new_amount = Math.round(new_amount * 100) / 100;
          file.extras[g].amount = new_amount;
        } else {
          var new_amount =
            (file.extras[g].value / 100) * calculable_sum_for_all;
          new_amount = Math.round(new_amount * 100) / 100;
          file.extras[g].amount = new_amount;
        }
      } else if (file.extras[g].unit == 'FIXED') {
        //Do nothing
      }
    }

    /* custom extras */
    if (file.customExtras.amount && file.customExtras.amount != 0) {
      if (file.customExtras.unit == 'PERCENTAGE') {
        var new_amount =
          (file.customExtras.value / 100) * calculable_sum_for_all;
        new_amount = Math.round(new_amount * 100) / 100;
        file.customExtras.amount = new_amount;
      } else if (file.customExtras.unit == 'FIXED') {
        //Do nothing
      }
    }

    //add extras

    // !jQuery.isEmptyObject(file.extras)/
    if (Object.keys(file.extras).length != 0) {
      var m = 0;
      while (file.extras[m]) {
        grandPayableBill += file.extras[m].amount;
        m++;
      }
    }

    //add custom extras if any
    // !jQuery.isEmptyObject(file.customExtras
    if (Object.keys(file.customExtras).length != 0) {
      grandPayableBill += file.customExtras.amount;
    }

    //substract discounts if any
    // !jQuery.isEmptyObject(file.discount)
    if (Object.keys(file.discount).length != 0) {
      grandPayableBill -= file.discount.amount;
    }
    function properRoundOff(amount) {
      return Math.round(amount);
    }
    grandPayableBill = Math.round(grandPayableBill * 100) / 100;
    var grandPayableBillRounded = properRoundOff(grandPayableBill);

    file.payableAmount = properRoundOff(grandPayableBill);
    file.calculatedRoundOff =
      Math.round((grandPayableBillRounded - grandPayableBill) * 100) / 100;

    return this.PendingBillModel.applyDiscount({
      bill_id,
      file,
      maximumReached,
      totalDiscount,
    }).catch((error) => {
      throw error;
    });
  }

  // todo write sms dispatcher code based on events
  sendOrderDispatchSMS(bill) {
    // var address = JSON.parse(bill.table);
    // if (!address.contact.match(/^\d{10}$/)) {
    //   return '';
    // }
    // var admin_data = {
    //   token: window.localStorage.loggedInAdmin,
    //   customerName: address.name,
    //   customerMobile: address.contact,
    //   totalBillAmount: bill.payableAmount,
    //   accelerateLicence: window.localStorage.accelerate_licence_number,
    //   accelerateClient: window.localStorage.accelerate_licence_client_name,
    //   agentName: bill.deliveryDetails.name,
    //   agentMobile: bill.deliveryDetails.mobile,
    // };
    // showLoading(10000, 'Sending SMS to Customer');
    // $.ajax({
    //   type: 'POST',
    //   url: 'https://www.accelerateengine.app/apis/posdeliverydispatchsms.php',
    //   data: JSON.stringify(admin_data),
    //   contentType: 'application/json',
    //   dataType: 'json',
    //   timeout: 10000,
    //   success: function (data) {
    //     hideLoading();
    //     if (data.status) {
    //     } else {
    //       showToast('Failed to send SMS: ' + data.error, '#e74c3c');
    //     }
    //   },
    //   error: function (data) {
    //     hideLoading();
    //     showToast(
    //       'Failed to send SMS: Unable to reach the Cloud Server. Check your connection.',
    //       '#e74c3c',
    //     );
    //   },
    // });
  }
  async updateDeliveryAgent(filter) {
    var bill_id = filter.bill_id;
    var data = await this.searchBill({searchkey: bill_id});
    data.deliveryDetails = filter.file;

    return this.PendingBillModel.updateDeliveryAgent({
      data,
      bill_id,
    })
      .then((data) => {
        //todo: update based on config
        var isAutoSMSFeatureEnabled = true;
        if (isAutoSMSFeatureEnabled) {
          this.sendOrderDispatchSMS(data.data);
        }
      })
      .catch((error) => {
        throw error;
      });
  }

  async addItem(filter) {
    var bill_id = filter.bill_id;
    var new_cart = filter.file;
    var data = await this.searchBill({searchkey: bill_id});

    var data = data;

    var extended_cart = [];

    var maxCartIndex = 0;

    var n = 0;
    while (data.cart[n]) {
      if (data.cart[n].cartIndex >= maxCartIndex) {
        maxCartIndex = data.cart[n].cartIndex;
      }
      n++;
    }

    //process new items
    for (var i = 0; i < new_cart.length; i++) {
      var isItemAlreadyExists = false;

      //check if this same item already exists in the bill
      var m = 0;
      while (data.cart[m]) {
        if (new_cart[i].isCustom) {
          if (
            data.cart[m].code == new_cart[i].code &&
            data.cart[m].variant == new_cart[i].variant
          ) {
            //same found
            data.cart[m].qty += new_cart[i].qty;
            isItemAlreadyExists = true;
            break;
          }
        } else {
          if (data.cart[m].code == new_cart[i].code) {
            //same found
            data.cart[m].qty += new_cart[i].qty;
            isItemAlreadyExists = true;
            break;
          }
        }
        m++;
      }

      //item doesn't exists
      if (!isItemAlreadyExists) {
        extended_cart.push(new_cart[i]);
      }
    }

    //Updated bill cart
    data.cart = data.cart.concat(extended_cart);

    /* NEW FIGURES */

    /* RECALCULATE New Figures*/
    var subTotal = 0;
    var packagedSubTotal = 0;

    var n = 0;
    while (data.cart[n]) {
      subTotal = subTotal + data.cart[n].qty * data.cart[n].price;

      if (data.cart[n].isPackaged) {
        packagedSubTotal += data.cart[n].qty * data.cart[n].price;
      }

      n++;
    }

    var grandPayableBill = subTotal;

    /*Calculate Discounts if Any*/
    var net_discount = 0;
    if (data.discount) {
      var tempExtraTotal = 0;
      if (data.discount.value != 0) {
        if (data.discount.unit == 'PERCENTAGE') {
          tempExtraTotal = (data.discount.value * subTotal) / 100;
        } else if (data.discount.unit == 'FIXED') {
          tempExtraTotal = data.discount.value;
        }
      }

      tempExtraTotal = Math.round(tempExtraTotal * 100) / 100;

      data.discount.amount = tempExtraTotal;
      net_discount = tempExtraTotal;
      grandPayableBill -= tempExtraTotal;
    }

    /*Calculate Taxes and Other Charges*/
    var k = 0;
    var effective_discountable_sum = subTotal - net_discount;
    if (data.extras.length > 0) {
      for (k = 0; k < data.extras.length; k++) {
        var tempExtraTotal = 0;

        if (data.extras[k].isPackagedExcluded) {
          if (data.extras[k].value != 0) {
            if (data.extras[k].unit == 'PERCENTAGE') {
              tempExtraTotal =
                (data.extras[k].value *
                  (effective_discountable_sum - packagedSubTotal)) /
                100;
            } else if (data.extras[k].unit == 'FIXED') {
              tempExtraTotal = data.extras[k].value;
            }
          }
        } else {
          if (data.extras[k].value != 0) {
            if (data.extras[k].unit == 'PERCENTAGE') {
              tempExtraTotal =
                (data.extras[k].value * effective_discountable_sum) / 100;
            } else if (data.extras[k].unit == 'FIXED') {
              tempExtraTotal = data.extras[k].value;
            }
          }
        }

        tempExtraTotal = Math.round(tempExtraTotal * 100) / 100;

        data.extras[k] = {
          name: data.extras[k].name,
          value: data.extras[k].value,
          unit: data.extras[k].unit,
          amount: tempExtraTotal,
          isPackagedExcluded: data.extras[k].isPackagedExcluded,
        };

        grandPayableBill += tempExtraTotal;
      }
    }

    /*Calculate Custom Extras if Any*/
    if (data.customExtras) {
      var tempExtraTotal = 0;
      if (data.customExtras.value != 0) {
        if (data.customExtras.unit == 'PERCENTAGE') {
          tempExtraTotal =
            (data.customExtras.value * effective_discountable_sum) / 100;
        } else if (data.customExtras.unit == 'FIXED') {
          tempExtraTotal = data.customExtras.value;
        }
      }

      tempExtraTotal = Math.round(tempExtraTotal * 100) / 100;

      data.customExtras.amount = tempExtraTotal;

      grandPayableBill += tempExtraTotal;
    }

    grandPayableBill = parseFloat(grandPayableBill).toFixed(2);
    function properRoundOff(amount) {
      return Math.round(amount);
    }

    var grandPayableBillRounded = properRoundOff(grandPayableBill);

    data.payableAmount = grandPayableBillRounded;
    data.grossCartAmount = subTotal;
    data.grossPackagedAmount = packagedSubTotal;

    data.calculatedRoundOff =
      Math.round((grandPayableBillRounded - grandPayableBill) * 100) / 100;

    return this.PendingBillModel.addItem({
      data,
      bill_id,
    }).catch((error) => {
      throw error;
    });
  }

  async updateBill(filter) {
    return this.PendingBillModel.updateBill(filter).catch((error) => {
      throw error;
    });
  }
}

module.exports = PendingBillService;
