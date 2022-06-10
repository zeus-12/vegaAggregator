var moment = require("moment");
function reduceCart(raw_cart) {
  var beautified_cart = [];

  for (var n = 0; n < raw_cart.length; n++) {
    if (n == 0) {
      beautified_cart.push(raw_cart[0]);
    } else {
      var duplicateFound = false;
      var k = 0;
      while (beautified_cart[k]) {
        if (beautified_cart[k].code == raw_cart[n].code) {
          if (beautified_cart[k].isCustom && raw_cart[n].isCustom) {
            if (beautified_cart[k].variant == raw_cart[n].variant) {
              beautified_cart[k].qty = beautified_cart[k].qty + raw_cart[n].qty;
              duplicateFound = true;
              break;
            }
          } else {
            beautified_cart[k].qty = beautified_cart[k].qty + raw_cart[n].qty;
            duplicateFound = true;
            break;
          }
        }

        k++;
      }

      if (!duplicateFound) {
        beautified_cart.push(raw_cart[n]);
      }
    }
  }
  return beautified_cart;
}
function initialisePaymentDetails(kotfile) {
  kotfile.paymentMode = "";
  kotfile.totalAmountPaid = "";
  kotfile.paymentReference = "";
  return kotfile;
}
function cleanUpComments(kotfile) {
  delete kotfile.specialRemarks;
  delete kotfile.allergyInfo;

  var c = 0;
  while (kotfile.cart[c]) {
    delete kotfile.cart[c].ingredients;
    delete kotfile.cart[c].comments;

    c++;
  }
  return kotfile;
}
function billSumCalculation(cart) {
  var grandPayableBill = 0;

  var totalCartAmount = 0;
  var totalPackagedAmount = 0;

  var n = 0;
  while (cart[n]) {
    totalCartAmount += cart[n].price * cart[n].qty;

    if (cart[n].isPackaged) {
      totalPackagedAmount += cart[n].qty * cart[n].price;
    }

    n++;
  }

  grandPayableBill += totalCartAmount;
  return { grandPayableBill, totalPackagedAmount, totalCartAmount };
}
function addExtras(grandPayableBill, kotfile) {
  //add extras
  if (!(Object.keys(kotfile.extras).length === 0)) {
    var m = 0;
    while (kotfile.extras[m]) {
      grandPayableBill += kotfile.extras[m].amount;
      m++;
    }
  }

  //add custom extras if any
  if (!(Object.keys(kotfile.customExtras).length === 0)) {
    grandPayableBill += kotfile.customExtras.amount;
  }

  //substract discounts if any
  if (!(Object.keys(kotfile.discount).length === 0)) {
    grandPayableBill -= kotfile.discount.amount;

    if (kotfile.discount.type == "NOCOSTBILL") {
      //Remove all the charges (Special Case)
      grandPayableBill = 0;

      kotfile.customExtras = {};
      kotfile.extras = [];
    }
  }
  return { kotfile, grandPayableBill };
}

function roundOffFigures(
  kotfile,
  grandPayableBillRounded,
  totalPackagedAmount,
  totalCartAmount,
  grandPayableBill
) {
  kotfile.payableAmount = grandPayableBillRounded;
  kotfile.grossCartAmount = totalCartAmount;
  kotfile.grossPackagedAmount = totalPackagedAmount;

  kotfile.calculatedRoundOff =
    Math.round((grandPayableBillRounded - grandPayableBill) * 100) / 100;

  return kotfile;
}

function updateTableForBilling(tableData, kotfile, billNumber) {
  tableData.remarks = kotfile.payableAmount;
  tableData.KOT = billNumber;
  tableData.status = 2;
  tableData.lastUpdate = moment().format("HHmm");

  return tableData;
}

function frameKotNumber(branch, kotnumber) {
  var kot_id = branch + "_KOT_" + kotnumber;
  return kot_id
}
module.exports = {
  reduceCart,
  initialisePaymentDetails,
  cleanUpComments,
  billSumCalculation,
  addExtras,
  roundOffFigures,
  updateTableForBilling,
  frameKotNumber
};
