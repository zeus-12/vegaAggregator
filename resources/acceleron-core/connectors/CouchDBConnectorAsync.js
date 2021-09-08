"use strict";
let ErrorResponse = require('../utils/ErrorResponse');
var http = require('http')

class CouchConnect{

	static get(path){
		return new Promise((resolve, reject) => {
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
				  		reject(new ErrorResponse(ResponseType.ERROR, response.error));
				  	}
				  	else{
				  		resolve(response);
				  	}
			    } 
			    catch(e) {
			    	reject(new ErrorResponse(ResponseType.ERROR, "Invalid response from server"));
			    }
			  });
			})

			req.on('error', error => {
				reject(new ErrorResponse(ResponseType.ERROR, "Failed to connect the server"));
			})

			req.end();
		});
	}


	static delete(path){
		return new Promise((resolve, reject) => {
			let options = {
			  hostname: '127.0.0.1',
			  port: 5984,
			  path: encodeURI(path),
			  method: 'DELETE'
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
				  		reject(new ErrorResponse(ResponseType.ERROR, response.error));
				  	}
				  	else{
				  		resolve(response);
				  	}
			    } 
			    catch(e) {
			    	reject(new ErrorResponse(ResponseType.ERROR, "Invalid response from server"));
			    }
			  });
			})

			req.on('error', error => {
			  	reject(new ErrorResponse(ResponseType.ERROR, "Failed to connect the server"));
			})

			req.end();
		});
	}


	static put(path, my_data){
		return new Promise((resolve, reject) => {

			const request_data = JSON.stringify(my_data)

			let options = {
			  hostname: '127.0.0.1',
			  port: 5984,
			  path: encodeURI(path),
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
				  		reject(new ErrorResponse(ResponseType.ERROR, response.error));
				  	}
				  	else{
				  		resolve(response);
				  	}
			    } 
			    catch(e) {
			    	reject(new ErrorResponse(ResponseType.ERROR, "Invalid response from server"));
			    }

			  })
			})

			req.on('error', error => {
			  	reject(new ErrorResponse(ResponseType.ERROR, "Failed to connect the server"));
			})

			req.write(request_data)
			req.end();
		});
	}


	static post(path, my_data){
		return new Promise((resolve, reject) => {

			const request_data = JSON.stringify(my_data)

			let options = {
			  hostname: '127.0.0.1',
			  port: 5984,
			  path: encodeURI(path),
			  method: 'POST',
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
				  		reject(new ErrorResponse(ResponseType.ERROR, response.error));
				  	}
				  	else{
				  		resolve(response);
				  	}
			    } 
			    catch(e) {
			    	reject(new ErrorResponse(ResponseType.ERROR, "Invalid response from server"));
			    }

			  })
			})

			req.on('error', error => {
			  	reject(new ErrorResponse(ResponseType.ERROR, "Failed to connect the server"));
			})

			req.write(request_data)
			req.end();
		});
	}

}

module.exports = CouchConnect;


