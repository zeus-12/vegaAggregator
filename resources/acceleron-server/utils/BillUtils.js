function frameBillNumber(branch,billNumber) {
    billId = branch +"_BILL_" + billNumber;
    return billId
}
module.exports = {frameBillNumber}