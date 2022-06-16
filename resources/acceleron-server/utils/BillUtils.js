function frameBillNumber(branch, billNumber) {
  billId = branch + "_BILL_" + billNumber;
  return billId;
}

function convertInvoiceToBill(invoiceId) {
  let billId = invoiceId.replace("INVOICE", "BILL");
  return billId;
}
module.exports = { frameBillNumber, convertInvoiceToBill };
