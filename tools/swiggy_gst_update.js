var axios = require('axios');



var BATCH_SIZE = 100;
var MAX_ROUNDS = 50;


function processInvoiceNow(invoiceNumbers, index, max, round) {

    if(index > max) {
      console.log(" ====== Round "+(round + 1)+" Finished ====== ");
      trigger(round + 1);
      return;
    }

    console.log(">> Processing " + invoiceNumbers[index]);
    var config = {
      method: 'get',
      url: 'http://127.0.0.1:5984/accelerate_invoices/'+invoiceNumbers[index],
      headers: { 
        'Accept': '*/*', 
        'Connection': 'keep-alive', 
        'Accept-Encoding': 'gzip, deflate'
      }
    };

    axios(config)
    .then(function (response) {
      console.log(JSON.stringify(response.data));
      processInvoiceNow(invoiceNumbers, index + 1, max, round)
    })
    .catch(function (error) {
      console.log("ERROR FINDING INVOICE " + invoiceId, error);
    });
}



function processList(invoiceNumbers, round) {
  console.log("ROUND "+round+" : Processing " + invoiceNumbers.length + " records");
  processInvoiceNow(invoiceNumbers, 0, invoiceNumbers.length - 1, round);
}




function trigger(round){

  if(round == MAX_ROUNDS) {
    console.log("--- MAX_ROUNDS reached ---");
    return;
  }



  console.log(" ====== Round "+(round + 1)+" Starting ====== ");
  var skip = round * BATCH_SIZE;
  var limit = BATCH_SIZE;

  var config = {
    method: 'get',
    url: 'http://127.0.0.1:5984/accelerate_invoices/_design/invoice-filters/_view/filterbypaymentmode?startkey=[%22SWIGGY%22,%20%2201-05-2022%22]&endkey=[%22SWIGGY%22,%20%2202-05-2022%22]&descending=false&include_docs=false&limit='+limit+'&skip='+skip,
    headers: { 
      'Accept': '*/*', 
      'Connection': 'keep-alive', 
      'Accept-Encoding': 'gzip, deflate'
    }
  };


  var invoiceList = [];
  axios(config)
  .then(function (response) {
    var list = response.data.rows;
    if(list.length < 1) {
      console.log(" ====== Round "+(round + 1)+" Finished ====== ");
      console.log("********** PROCESSING COMPLETED **********");
      return;
    }


    for(var i = 0; i < list.length; i++) {
      if(list[i].value.orderDetails.mode == "Swiggy")
        invoiceList.push(list[i].id)
      else
        console.log("mode mismatch :: " + list[i].value.orderDetails.mode)
    }

    if(invoiceList.length > 0)
      processList(invoiceList, round);
  })
  .catch(function (error) {
    console.log(error);
  });
}


trigger(0);


