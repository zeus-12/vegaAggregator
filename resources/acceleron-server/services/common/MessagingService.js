"use strict";
let BaseService = ACCELERONCORE._services.BaseService;

class MessagingService extends BaseService {
  constructor(request) {
    super(request);
    this.request = request;
  }

  async postMessageRequest(mobileNumber, data, type) {
    if (isNaN(mobileNumber) || mobileNumber < Math.pow(10, 9)) return;
    var messageData = {
      mobileNumber,
      data,
      type,
    };

    // $.ajax({
    //   type: "POST",
    //   url: "https://www.accelerateengine.app/apis/posdeliveryconfirmationsms.php",
    //   data: JSON.stringify(messageData),
    //   contentType: "application/json",
    //   dataType: "json",
    //   timeout: 10000,
    //   // success: function (data) {},
    // });
  }
}

module.exports = MessagingService;
