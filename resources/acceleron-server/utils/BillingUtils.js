const TimeUtils = require("./TimeUtils");

function frameBillNumber(branch, billNumber) {
  return branch + "_BILL_" + billNumber;
}

function frameInvoiceNumber(branch, billNumber) {
  return branch + "_INVOICE_" + billNumber;
}

function frameInvoiceNumberFromBillNumber(invoiceId) {
  let billId = invoiceId.replace("INVOICE", "BILL");
  return billId;
}

function propagateKOTDataAndAssignBillNumber(generatedBill, billNumber, outletCode, kotData) {
  generatedBill._id = this.frameBillNumber(outletCode, billNumber);
  generatedBill.billNumber = billNumber;
  generatedBill.outletCode = outletCode;
  generatedBill.timeBill = TimeUtils.getCurrentTimestamp();

  //Copy from kotData
  generatedBill.KOTNumber = kotData.KOTNumber;
  generatedBill.orderDetails = kotData.orderDetails;
  generatedBill.table = kotData.table;
  generatedBill.customerName = kotData.customerName;
  generatedBill.customerMobile = kotData.customerMobile;
  generatedBill.guestCount = kotData.guestCount;
  generatedBill.machineName = kotData.machineName;
  generatedBill.sessionName = kotData.sessionName;
  generatedBill.stewardName = kotData.stewardName;
  generatedBill.stewardCode = kotData.stewardCode;
  generatedBill.date = kotData.date;
  generatedBill.timePunch = kotData.timePunch;
  generatedBill.timeKOT = kotData.timeKOT;
}

module.exports = { frameBillNumber, frameInvoiceNumber, frameInvoiceNumberFromBillNumber, propagateKOTDataAndAssignBillNumber };
