var axios = require('axios');


const myArgs = process.argv.slice(2);
var BRANCH = myArgs[0];
var STARTING_BILL = parseInt(myArgs[1]);
var ENDING_BILL = parseInt(myArgs[2]);





function processBill(billNumber) {


  if(billNumber > ENDING_BILL) {
    console.log(" === FINISHED === ");
    return;
  }


  if(!billNumber) {
    console.log("************** ERROR: Unknown bill number");
    return;
  }


  var formattedBillNumber = BRANCH + "_INVOICE_" + billNumber;



    console.log(">> Processing " + formattedBillNumber);
    var config = {
      method: 'get',
      url: 'http://127.0.0.1:5984/accelerate_invoices/'+formattedBillNumber,
      headers: { 
        'Accept': '*/*', 
        'Connection': 'keep-alive', 
        'Accept-Encoding': 'gzip, deflate'
      }
    };

    axios(config)
    .then(function (response) {
      var billData = response.data;

      if(billData.orderDetails.mode.toUpperCase() == "SWIGGY") {

          console.log('Bill READ success. SWIGGY BILL.', formattedBillNumber);

          var grossCartAmount = billData.grossCartAmount;
      
          var modifiedExtras = [];
          var modifiedExtrasAmount = billData.grossCartAmount * .05;
          modifiedExtrasAmount = Math.round(modifiedExtrasAmount * 100) / 100; 
          for(var e = 0; e < billData.extras.length; e++){
            if(billData.extras[e].name == 'Parcel Charges') {
              billData.extras[e].amount = modifiedExtrasAmount;
              modifiedExtras.push(billData.extras[e]);
              
            }
          }
          
          var grandPayableBill = grossCartAmount + modifiedExtrasAmount;
          grandPayableBill= parseFloat(grandPayableBill).toFixed(2);   
          grandPayableBillRounded = Math.round(grandPayableBill);   
          var calculatedRoundOff = Math.round((grandPayableBillRounded - grandPayableBill) * 100) / 100;


          billData.extras = modifiedExtras;

          billData.payableAmount = grandPayableBillRounded;
          billData.totalAmountPaid = grandPayableBillRounded;
          billData.calculatedRoundOff = calculatedRoundOff;

          var config = {
            method: 'put',
            url: 'http://127.0.0.1:5984/accelerate_invoices/'+formattedBillNumber+'/',
            headers: { 
              'Origin': 'file://', 
              'Accept-Encoding': 'gzip, deflate', 
              'Content-Type': 'application/json', 
              'Accept': 'application/json, text/javascript, */*; q=0.01'
            },
            data : JSON.stringify(billData)
          };

          axios(config)
          .then(function (response) {
            console.log("Successfully updated ====== " + formattedBillNumber);
            processBill(billNumber + 1)
          })
          .catch(function (error) {
            console.log("************** FAILED TO UPDATE " + formattedBillNumber, error);
            processBill(billNumber + 1)
          });

      } else {
        console.log('Bill READ. not swiggy', formattedBillNumber);
        processBill(billNumber + 1)
      }
    })
    .catch(function (error) {
      console.log("************** ERROR FINDING INVOICE " + formattedBillNumber);
      processBill(billNumber + 1)
    });
}




function updateBillingModes() {

    var data = JSON.stringify({
      "selector": {
        "identifierTag": "ACCELERATE_BILLING_MODES"
      },
      "fields": [
        "identifierTag",
        "value",
        "_rev"
      ]
    });

    var config = {
      method: 'post',
      url: 'http://127.0.0.1:5984//accelerate_settings/_find',
      headers: { 
        'Origin': 'file://', 
        'Accept-Encoding': 'gzip, deflate', 
        'Content-Type': 'application/json', 
        'Accept': 'application/json, text/javascript, */*; q=0.01'
      },
      data : data
    };

    axios(config)
    .then(function (response) {
      var newData = response.data.docs[0];
      var billModes = newData.value;
      for(var i = 0; i < billModes.length; i++){
        if(billModes[i].name.toUpperCase() == "SWIGGY") {
          billModes[i].extras = [{"name":"Parcel Charges","value":"5.00"}];
          break;
        }
      }

      newData.value = billModes;

      var config = {
        method: 'put',
        url: 'http://127.0.0.1:5984/accelerate_settings/ACCELERATE_BILLING_MODES/',
        headers: { 
          'Origin': 'file://', 
          'Accept-Encoding': 'gzip, deflate', 
          'Content-Type': 'application/json', 
          'Accept': 'application/json, text/javascript, */*; q=0.01',
        },
        data : JSON.stringify(newData)
      };

      axios(config)
      .then(function (response) {
        console.log("Swiggy GST set to 0%. Container Charges to 5%");
        console.log("........ Starting to process previous bills.");
        processBill(STARTING_BILL);
      })
      .catch(function (error) {
        console.log("************** Error: failed to UPDATE Swiggy mode", error);
      });
    })
    .catch(function (error) {
      console.log("************** Error: failed to READ Swiggy mode", error);
    });
}


updateBillingModes();




