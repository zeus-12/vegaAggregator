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
module.exports = { frameBillNumber, frameInvoiceNumber, convertInvoiceToBill };
