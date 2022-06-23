var moment = require("moment");

function getCurrentTimestamp() {
  return moment().format("HHmm");;
}

module.exports = {getCurrentTimestamp};
