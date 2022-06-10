function validateMobileNumber(mobileNumber) {
    var indianMobileNumberRegex = new RegExp("^[789]\\d{9}$");
    return indianMobileNumberRegex.test(mobileNumber);
}

module.exports = {validateMobileNumber}