"use strict";
const ClientEndpoints = require("../utils/clientEndpoints");
let BaseHttpClient = ACCELERONCORE._clients.BaseHttpClient;

class LicenceClient extends BaseHttpClient {

    async validateLicence(licenceKey) {
        const data = {
            "code" : licenceKey
        }

        let apiResponse = await super.execute("POST", ClientEndpoints.VALIDATE_LICENCE_API, this.getLicenceClientHeaders(), data);
        if(apiResponse.status && apiResponse.response) {
            return apiResponse.response;
        } else {
            throw new ErrorResponse(
                ResponseType.ERROR,
                ErrorType.license_validation_failed
            );
        }
    }

    getLicenceClientHeaders() {
        return "";
    }
}

module.exports = LicenceClient;


