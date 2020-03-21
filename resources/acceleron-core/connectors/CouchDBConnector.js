"use strict";
let ErrorResponse = require('../utils/ErrorResponse');
var http = require('http')

class CouchConnect{

	static get(path, callback){
		let options = {
		  hostname: '127.0.0.1',
		  port: 5984,
		  path: path,
		  method: 'GET'
		}

		const req = http.request(options, res => {
		  res.on('data', data => {
		  	try {
		        let response = JSON.parse(data.toString());
		   
			  	if(response.error && response.error != ""){
			  		return callback(new ErrorResponse(ResponseType.ERROR, response.error), null);
			  	}
			  	else{
			  		return callback(null, response);
			  	}
		    } 
		    catch(e) {
		    	return callback(new ErrorResponse(ResponseType.ERROR, "Invalid response from server"), null);
		    }

		  })
		})

		req.on('error', error => {
		  return callback(new ErrorResponse(ResponseType.ERROR, "Failed to connect the server"), null)
		})

		req.end()
	}

}

module.exports = CouchConnect;


