"use strict";
let ErrorResponse = require('../utils/ErrorResponse');
const axios = require('axios');

class BaseHttpClient {

    constructor() {

    }

    execute(method, url, headers, data){
        return new Promise((resolve, reject) => {
            const request = {
                method: method,
                url: url,
                headers: headers,
                data : data
            }

            axios(request)
                .then(function (response) {
                    resolve(response.data);
                })
                .catch(function (error) {
                    reject(new ErrorResponse(ResponseType.ERROR, error));
                });
        });
    }
}

module.exports = BaseHttpClient;