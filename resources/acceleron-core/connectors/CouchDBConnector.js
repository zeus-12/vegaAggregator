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

		let finalOutput = '';
		const req = http.request(options, res => {
		  res.on('data', chunk => {
		  	finalOutput += chunk;
		  })
		  res.on('end', () => {
		  	try {
		        let response = JSON.parse(finalOutput);
		   
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
		  });
		})

		req.on('error', error => {
		  return callback(new ErrorResponse(ResponseType.ERROR, "Failed to connect the server"), null)
		})

		req.end()
	}


	static put(path, my_data, callback){

		const request_data = JSON.stringify(my_data)

		let options = {
		  hostname: '127.0.0.1',
		  port: 5984,
		  path: path,
		  method: 'PUT',
		  headers: {
		    'Content-Type': 'application/json',
		    'Content-Length': request_data.length
		  }
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

		req.write(request_data)
		req.end()
	}

}

module.exports = CouchConnect;


