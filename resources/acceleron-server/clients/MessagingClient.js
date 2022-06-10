"use strict";
const ClientEndpoints = require("../utils/ClientEndpoints");
let BaseHttpClient = ACCELERONCORE._clients.BaseHttpClient;

class MessagingClient extends BaseHttpClient {

    async sendMessage(messageData) {
        let apiResponse = await super.execute("POST", ClientEndpoints.SEND_MESSAGE_API, this.getMessagingClientHeaders(), messageData);
        return apiResponse.status;
    }

    getMessagingClientHeaders() {
        return "";
    }
}

module.exports = MessagingClient;


