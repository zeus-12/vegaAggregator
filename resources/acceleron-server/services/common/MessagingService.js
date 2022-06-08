"use strict";
let BaseService = ACCELERONCORE._services.BaseService;
// let KOTService = require("./KOTService");

var _ = require("underscore");
var async = require("async");

class BillingService extends BaseService {
  constructor(request) {
    super(request);
    this.request = request;
    // this.KOTService = new KOTService(request);
  }

  async postMessageRequest(mobileNumber, data, type) {
    var messageData = {
      mobileNumber,
      data,
      type,
    };
    //validate mobileNumber

    // check isAutoSMSFeatureEnabled

    $.ajax({
      type: "POST",
      url: "https://www.accelerateengine.app/apis/posdeliveryconfirmationsms.php",
      data: JSON.stringify(messageData),
      contentType: "application/json",
      dataType: "json",
      timeout: 10000,
      // success: function (data) {},
    });
    //todo: anything to return
    return;
  }
}

module.exports = BillingService;
