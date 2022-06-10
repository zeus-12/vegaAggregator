var moment = require("moment");

function getCurrentTimestamp() {
  time = moment().format("HHmm");
  return time;
}
module.exports = {
  getCurrentTimestamp,
};
