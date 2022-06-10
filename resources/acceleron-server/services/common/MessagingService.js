"use strict";
let BaseService = ACCELERONCORE._services.BaseService;
let MessagingClient = require("../../clients/MessagingClient");
let CommonUtils = require("../../utils/CommonUtils");

class MessagingService extends BaseService {
  constructor(request) {
    super(request);
    this.request = request;
    this.MessagingClient = new MessagingClient();
  }

  async postMessageRequest(mobileNumber, data, type) {
    if(!CommonUtils.validateMobileNumber(mobileNumber)) return;
    
    const messageData = {mobileNumber, data, type};
    await this.MessagingClient.sendMessage(messageData);
  }
}

module.exports = MessagingService;