"use strict";
let ErrorResponse = require('../utils/ErrorResponse');
var http = require('http')

class CouchConnect{

 static get(path){
		let options = {
		  hostname: '127.0.0.1',
		  port: 5984,
		  path: encodeURI(path),
		  method: 'GET'
		} 
		let finalOutput = '';
		const req = http.request(options, res => {
		  res.on('data', chunk => {
		  	finalOutput += chunk;
		  })
		  res.on('end', () => {
		  	try {
		        let response = JSON.parse(finalOutput);
			  	if(response.error && response.error != ""){
			  		throw new ErrorResponse(ResponseType.ERROR, response.error);
			  	}
			  	else{
                    console.log(response) 
			  		return response;
			  	}
		    } 
		    catch(error) {
		    	throw new ErrorResponse(ResponseType.ERROR, "Invalid response from server");
		    }
		  });
		})

		req.on(error => {
		  throw new ErrorResponse(ResponseType.ERROR, "Failed to connect the server");
		})

		req.end()
	}
}

module.exports = CouchConnect;