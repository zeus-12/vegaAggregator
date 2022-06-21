const TimeUtils = require("./TimeUtils");

function frameBillNumber(branch, billNumber) {
  const billId = branch + "_BILL_" + billNumber;
  return billId;
}

function frameInvoiceNumber(branch, billNumber) {
  const invoiceId = branch + "_INVOICE_" + billNumber;
  return invoiceId;
}

function convertInvoiceToBill(invoiceId) {
  let billId = invoiceId.replace("INVOICE", "BILL");
  return billId;
}

function assignBillNumber(generatedBill, billNumber, outletCode, orderDetails) {
  generatedBill.billNumber = billNumber;
  generatedBill.outletCode = outletCode;
  generatedBill.timeBill = TimeUtils.getCurrentTimestamp();
  generatedBill.orderDetails = orderDetails;
}

module.exports = { frameBillNumber, frameInvoiceNumber, convertInvoiceToBill, assignBillNumber };
