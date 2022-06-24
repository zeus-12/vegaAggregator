let PAUSE_FLAG = false;
let DATA_BILLING_PARAMETERS = '';
let DATA_BILLING_MODES = '';
let DATA_ORDER_SOURCES = '';
let DATA_REGISTERED_DEVICES = '';
let MENU_DATA_SYSTEM_ORIGINAL = [];
let MENU_DATA_OTHER_MENU_MAPPINGS = [];

const ACCELERON_SERVER_ENDPOINT = 'http://localhost:3000';
const ACCELERON_SERVER_ACCESS_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjbGllbnQiOiJaQUlUT09OIiwiYnJhbmNoIjoiQURZQVIiLCJpc3N1ZVRpbWUiOjE2NTU0ODk5MTgsInVzZXIiOnsidmVyaWZpZWRNb2JpbGUiOiI5ODg0MTc5Njc1IiwibmFtZSI6IkphZnJ5Iiwicm9sZSI6IkFETUlOIn0sIm1hY2hpbmVJZCI6Ilo1MDAiLCJpYXQiOjE2NTU0ODk5MTgsImV4cCI6MTY1NjA5NDcxOH0.ku7MVw-iy8EyG-uUi5kmKQd8iFDOSHMbR0fIsphmftA"


let SERVICE_APPROVED_ORDERS = 0;
let SERVICE_APPROVED_PRINTS = 0;
let SERVICE_APPROVED_ACTIONS = 0;


function fetchApprovedServices(){
  SERVICE_APPROVED_ORDERS = window.localStorage.approvedActionsData_tapsOrders && window.localStorage.approvedActionsData_tapsOrders != "" ? window.localStorage.approvedActionsData_tapsOrders : 0;
  SERVICE_APPROVED_ACTIONS = window.localStorage.approvedActionsData_actionRequests && window.localStorage.approvedActionsData_actionRequests != "" ? window.localStorage.approvedActionsData_actionRequests : 0;
  SERVICE_APPROVED_PRINTS = window.localStorage.approvedActionsData_printRequests && window.localStorage.approvedActionsData_printRequests != "" ? window.localStorage.approvedActionsData_printRequests : 0;
}

fetchApprovedServices();


function operationPause(){
    document.getElementById("operationButtons").innerHTML = '<tag class="buttonSettings" style="right: 70px; color: red; font-weight: bold" onclick="operationStart()">Paused</tag>';
    
    document.getElementById("statusTitle").innerHTML = "Not Running";
    $("#mainBGImage").attr("src","assets/images/paused_gathering.png");
    $("#statusTitle").removeClass("blink_me");
    
    PAUSE_FLAG = true;
}

function operationStart(){
    document.getElementById("operationButtons").innerHTML = '<tag class="buttonSettings" style="right: 70px" onclick="operationPause()">Running</tag>';
    PAUSE_FLAG = false;
    
    document.getElementById("statusTitle").innerHTML = "Accepting Orders";
    $("#mainBGImage").attr("src","assets/images/gathering_orders.gif");
    $("#statusTitle").addClass("blink_me");

    initialiseProcessing();
}



function preloadBillingData() {

  $.ajax({
    type: 'GET',
    url: ACCELERON_SERVER_ENDPOINT + '/bootstrap/initiate-aggregator',
    contentType: "application/json",
    dataType: 'json',
    timeout: 10000,
    beforeSend: function (xhr) {
      xhr.setRequestHeader("x-access-token", ACCELERON_SERVER_ACCESS_TOKEN);
    },
    success: function (data) {
      var { otherMenuData, billingModesData, orderSourcesData, registeredDevicesData, billingParametersData, masterMenu } = data.data
      
      DATA_BILLING_MODES = billingModesData
      DATA_ORDER_SOURCES = orderSourcesData
      DATA_REGISTERED_DEVICES = registeredDevicesData
      DATA_BILLING_PARAMETERS = billingParametersData

      let list = [];

      for (var i=0; i<masterMenu.length; i++){
        for(var j=0; j<masterMenu[i].items.length; j++){
          list[masterMenu[i].items[j].code] = masterMenu[i].items[j];
          list[masterMenu[i].items[j].code].category = masterMenu[i].category;
        }         
      }
      MENU_DATA_SYSTEM_ORIGINAL = list;

      if (otherMenuData.length > 0) {  
        MENU_DATA_OTHER_MENU_MAPPINGS = populateOtherMenuData(otherMenuData)
      }

      proceedToInitialisation()

      
    },
    error: function(data) {
      showToast('System Error: Unable to initiate data. Please contact Accelerate Support.', '#e74c3c');
    }
  })


  function populateOtherMenuData(otherMenuData) {
    otherMenuData.map(menu => MENU_DATA_OTHER_MENU_MAPPINGS[menu.source] = menu.menu)
    return MENU_DATA_OTHER_MENU_MAPPINGS
  }

 


  function proceedToInitialisation() {
    //return '';
    initialiseProcessing();
  }

}




/* 
  ERROR LOGGING
*/

function addToErrorLog(time, category, type, kot_id, optionalParametersObject){

  /*
    category --> REQUEST or ORDER
    type --> 'KOT_NOT_FOUND' etc.
    optionalParametersObject --> requestObject etc.
  */

  var log = window.localStorage.errorLog && window.localStorage.errorLog != "" ? JSON.parse(window.localStorage.errorLog) : [];

  log.push({
    "uid": moment().format('MMDYYYYhhmmss'),
    "time": time,
    "category": category,
    "type": type,
    "kotId": kot_id,
    "parameters": optionalParametersObject
  });

  window.localStorage.errorLog = JSON.stringify(log);
  renderErrorsLogCount();
}

function renderErrorsLogCount(){
  var log = window.localStorage.errorLog && window.localStorage.errorLog != "" ? JSON.parse(window.localStorage.errorLog) : [];
  if(log.length < 1){
    document.getElementById("errorListingWindowCounter").style.display = 'none';
  }
  else{
    document.getElementById("errorListingWindowCounter").style.display = 'block';
    document.getElementById("errorListingWindowCounter").innerHTML = log.length;
  }

  if($('#errorListingWindowModal').is(':visible')) {
    renderErrorsLog();
  }

}

renderErrorsLogCount();


function renderErrorsLog(){
  var log = window.localStorage.errorLog && window.localStorage.errorLog != "" ? JSON.parse(window.localStorage.errorLog) : [];
  if(log.length < 1){
    document.getElementById("errorListingWindowModal").style.display = 'none';
    return '';
  }
  else{

    var renderContent = '';

    var n = 0;
    while(log[n]){
      
      if(log[n].category == 'ORDER'){
        if(log[n].type == 'SYSTEM_KOT_ERROR'){
          renderContent = '<tag class="errorListingItem"><time class="errorListingTime">'+log[n].time+' <span class="errorWarning">System has been failing to Punch Orders from mobile devices. <i class="fa fa-warning"></i></span></time><span class="systemError blink_me">SYSTEM ERROR</span> Apple Quick Fix #1 and try again. Contact Accelerate Support if problem persists. <tag class="errorListingOwner">by '+log[n].parameters.staffName+'</tag><tag onclick="restartProcessing()" class="errorListingFixButton">Try Now</tag></tag>' + renderContent;
        }
        else{
          renderContent = '<tag class="errorListingItem"><time class="errorListingTime">'+log[n].time+' on '+(log[n].parameters.machine != "" ? log[n].parameters.machine : 'Unknown Device')+'</time>Failed to edit the <b>Running Order</b> on Table #'+log[n].parameters.table+' <tag class="errorListingOwner">by '+log[n].parameters.staffName+'</tag><tag onclick="ignoreErrorLogEntry(\''+log[n].uid+'\')" class="errorListingFixButton">Ignore</tag></tag>' + renderContent;
        }
      }
      else if(log[n].category == 'REQUEST'){
        
        switch(log[n].parameters.action){
          case "PRINT_VIEW":{
            renderContent = '<tag class="errorListingItem"><time class="errorListingTime">'+log[n].time+' on '+(log[n].parameters.machine != "" ? log[n].parameters.machine : 'Unknown Device')+'</time>Printing <b>View</b> failed on Table #'+log[n].parameters.table+' <tag class="errorListingOwner">by '+log[n].parameters.staffName+'</tag><tag onclick="ignoreErrorLogEntry(\''+log[n].uid+'\')" class="errorListingFixButton">Ignore</tag></tag>' + renderContent;
            break;
          }
          case "PRINT_KOT":{
            renderContent = '<tag class="errorListingItem"><time class="errorListingTime">'+log[n].time+' on '+(log[n].parameters.machine != "" ? log[n].parameters.machine : 'Unknown Device')+'</time>Printing <b>Duplicate KOT</b> failed on Table #'+log[n].parameters.table+' <tag class="errorListingOwner">by '+log[n].parameters.staffName+'</tag><tag onclick="ignoreErrorLogEntry(\''+log[n].uid+'\')" class="errorListingFixButton">Ignore</tag></tag>' + renderContent;
            break;
          }
          case "PRINT_BILL":{
            if(log[n].type == 'SYSTEM_BILL_ERROR'){
              renderContent = '<tag class="errorListingItem"><time class="errorListingTime">'+log[n].time+' on '+(log[n].parameters.machine != "" ? log[n].parameters.machine : 'Unknown Device')+'</time><span class="systemError blink_me">SYSTEM ERROR</span> Generating <b>Bill</b> failed on Table #'+log[n].parameters.table+' <tag class="errorListingOwner">by '+log[n].parameters.staffName+'</tag><tag onclick="ignoreErrorLogEntry(\''+log[n].uid+'\')" class="errorListingFixButton">Ignore</tag></tag>' + renderContent;
            }
            else if(log[n].type == 'BILL_GENERATION_FAILED'){  
              renderContent = '<tag class="errorListingItem"><time class="errorListingTime">'+log[n].time+' on '+(log[n].parameters.machine != "" ? log[n].parameters.machine : 'Unknown Device')+'</time>Generating <b>Bill</b> failed on Table #'+log[n].parameters.table+' <tag class="errorListingOwner">by '+log[n].parameters.staffName+'</tag><tag onclick="ignoreErrorLogEntry(\''+log[n].uid+'\')" class="errorListingFixButton">Ignore</tag></tag>' + renderContent;
            }
            else{  
              renderContent = '<tag class="errorListingItem"><time class="errorListingTime">'+log[n].time+' on '+(log[n].parameters.machine != "" ? log[n].parameters.machine : 'Unknown Device')+'</time>Generating <b>Bill</b> failed on Table #'+log[n].parameters.table+' <tag class="errorListingOwner">by '+log[n].parameters.staffName+'</tag><tag onclick="ignoreErrorLogEntry(\''+log[n].uid+'\')" class="errorListingFixButton">Ignore</tag></tag>' + renderContent;
            }
            break;
          }
        }

      }
      else if(log[n].category == 'PRINT' && log[n].type == 'REQUEST_DELETE_FAILED'){

        switch(log[n].parameters.action){
          case "KOT_NEW":{
            renderContent = '<tag class="errorListingItem"><time class="errorListingTime">'+log[n].time+' on '+(log[n].parameters.machine != "" ? log[n].parameters.machine : 'Unknown Device')+'</time>Duplicate request to <b>Print KOT</b> '+(log[n].parameters.modeType == 'DINE' ? ' on Table #'+log[n].parameters.table : ' of '+log[n].parameters.modeType+' order')+' <tag class="errorListingOwner">by '+log[n].parameters.staffName+'</tag><tag onclick="ignoreErrorLogEntry(\''+log[n].uid+'\')" class="errorListingFixButton">Ignore</tag></tag>' + renderContent;
            break;
          }
          case "KOT_EDITING":{
            renderContent = '<tag class="errorListingItem"><time class="errorListingTime">'+log[n].time+' on '+(log[n].parameters.machine != "" ? log[n].parameters.machine : 'Unknown Device')+'</time>Duplicate request to <b>Print Edited KOT</b> '+(log[n].parameters.modeType == 'DINE' ? ' on Table #'+log[n].parameters.table : ' of '+log[n].parameters.modeType+' order')+' <tag class="errorListingOwner">by '+log[n].parameters.staffName+'</tag><tag onclick="ignoreErrorLogEntry(\''+log[n].uid+'\')" class="errorListingFixButton">Ignore</tag></tag>' + renderContent;
            break;
          }
          case "KOT_DUPLICATE":{
            renderContent = '<tag class="errorListingItem"><time class="errorListingTime">'+log[n].time+' on '+(log[n].parameters.machine != "" ? log[n].parameters.machine : 'Unknown Device')+'</time>Multiple requests to <b>Print Duplicate KOT</b> '+(log[n].parameters.modeType == 'DINE' ? ' on Table #'+log[n].parameters.table : ' of '+log[n].parameters.modeType+' order')+' <tag class="errorListingOwner">by '+log[n].parameters.staffName+'</tag><tag onclick="ignoreErrorLogEntry(\''+log[n].uid+'\')" class="errorListingFixButton">Ignore</tag></tag>' + renderContent;
            break;
          }
          case "KOT_CANCEL":{
            renderContent = '<tag class="errorListingItem"><time class="errorListingTime">'+log[n].time+' on '+(log[n].parameters.machine != "" ? log[n].parameters.machine : 'Unknown Device')+'</time>Duplicate request to <b>Print Cancellation KOT</b> '+(log[n].parameters.modeType == 'DINE' ? ' on Table #'+log[n].parameters.table : ' of '+log[n].parameters.modeType+' order')+' <tag class="errorListingOwner">by '+log[n].parameters.staffName+'</tag><tag onclick="ignoreErrorLogEntry(\''+log[n].uid+'\')" class="errorListingFixButton">Ignore</tag></tag>' + renderContent;
            break;
          }
        }
        
      }

      n++;
    }

    document.getElementById("errorListingWindowModal").style.display = 'block';
    document.getElementById("errorListingWindowRenderContent").innerHTML = renderContent;    
  
  }
}


function hideErrorListing(){
  document.getElementById("errorListingWindowModal").style.display = 'none'; 
}

function restartProcessing(){

              var log = window.localStorage.errorLog && window.localStorage.errorLog != "" ? JSON.parse(window.localStorage.errorLog) : [];
              
              var n = 0;
              while(log[n]){

                if(log[n].category == "ORDER" && log[n].type == "SYSTEM_KOT_ERROR"){
                  log.splice(n,1);
                  break;
                }

                n++;
              }

              window.localStorage.errorLog = JSON.stringify(log);
              renderErrorsLogCount();

              initialiseProcessing();
}


function ignoreErrorLogEntry(request_id){

    var log = window.localStorage.errorLog && window.localStorage.errorLog != "" ? JSON.parse(window.localStorage.errorLog) : [];
              
    var n = 0;
    while(log[n]){

      if(log[n].uid == request_id){
        log.splice(n,1);
        break;
      }

      n++;
    }

    window.localStorage.errorLog = JSON.stringify(log);
    renderErrorsLogCount();
}


/* 
  ERROR DUE TO WHICH THE SYSTEM IS FAILING
*/

function throwSystemBlockingError(error){
  alert(error)
}


function findDefaultPrinter(deviceCode, type){

  var allConfiguredPrintersList = window.localStorage.configuredPrintersData ? JSON.parse(window.localStorage.configuredPrintersData) : [];


  if(deviceCode == ''){
    return '';
  }

  if(type == 'VIEW'){
    for(var i = 0; i < DATA_REGISTERED_DEVICES.length; i++){
      if(DATA_REGISTERED_DEVICES[i].deviceUID == deviceCode){
        if(DATA_REGISTERED_DEVICES[i].defaultPrinters.VIEW != ""){

            var g = 0;
            while (allConfiguredPrintersList[g]) {
              for (var a = 0; a < allConfiguredPrintersList[g].list.length; a++) {
                  if (allConfiguredPrintersList[g].list[a].name == DATA_REGISTERED_DEVICES[i].defaultPrinters.VIEW) {
                      return allConfiguredPrintersList[g].list[a];
                      break;
                  }
              }
                            
              g++;
            }
        }
        break;
      }
    }
  }
  else if(type == 'BILL'){
    for(var i = 0; i < DATA_REGISTERED_DEVICES.length; i++){
      if(DATA_REGISTERED_DEVICES[i].deviceUID == deviceCode){
        if(DATA_REGISTERED_DEVICES[i].defaultPrinters.BILL != ""){

            var g = 0;
            while (allConfiguredPrintersList[g]) {
              for (var a = 0; a < allConfiguredPrintersList[g].list.length; a++) {
                  if (allConfiguredPrintersList[g].list[a].name == DATA_REGISTERED_DEVICES[i].defaultPrinters.BILL) {
                      return allConfiguredPrintersList[g].list[a];
                      break;
                  }
              }
                            
              g++;
            }          
            
        }
        break;
      }
    }
  }

  return "";
}



/*
  MAIN PROCESSING FUNCTION
*/

function removeAlreadyProccessedActionRequest(id){
  $.ajax({
      type: 'DELETE',
      url: ACCELERON_SERVER_ENDPOINT + `/bootstrap/action_request/${id}`,
      contentType: "application/json",
      dataType: 'json',
      timeout: 10000,
      beforeSend: function (xhr) {
        xhr.setRequestHeader("x-access-token", ACCELERON_SERVER_ACCESS_TOKEN);
      },
      error: function (data) {
        showToast('Server Warning: Unable to modify action request. Please contact Accelerate Support.', '#e67e22');
      }
    })
}


function initialiseProcessing() {


  if (PAUSE_FLAG) {
    return '';
  }

  //Ignore List (to skip these already noted errors)
  var ignoreList = window.localStorage.errorLog && window.localStorage.errorLog != "" ? JSON.parse(window.localStorage.errorLog) : [];

  checkForRequests();

  //Round 1: Check for Requests
  function checkForRequests() {

    if (SERVICE_APPROVED_ACTIONS == 0) {
      checkForOrders(0);
      return "";
    }

    //console.log('Checking for Requests...');

    $.ajax({
      type: 'GET',
      url: ACCELERON_SERVER_ENDPOINT + '/bootstrap/initialise-processing',
      contentType: "application/json",
      dataType: 'json',
      timeout: 10000,
      beforeSend: function (xhr) {
        xhr.setRequestHeader("x-access-token", ACCELERON_SERVER_ACCESS_TOKEN);
      },
      success: function (data) {
        if (!data.data.requestData) {
          //go to next step 2 without cool off. no printing involved.
          checkForOrders(0);

        }
        else {
          requestData = data.data.requestData
          kotData = data.data.kotData

          switch (requestData.action) {
            case "PRINT_VIEW": {

              var set_view_printer = findDefaultPrinter(requestData.machine, 'VIEW');

              if (set_view_printer != '') {
                sendToPrinter(kotData, 'VIEW', set_view_printer);
              }
              else {
                sendToPrinter(kotData, 'VIEW');
              }
                        
              showToast('Items View of #' + kotData.KOTNumber + ' generated Successfully', '#27ae60');
              removeAlreadyProccessedActionRequest(kotData.KOTNumber);



                        
              //go starting again, after some cool off.
              setTimeout(function () { initialiseProcessing(); }, 5000);
              break;
            }
            case "PRINT_KOT": {
              printDuplicateTapsKOT(kotData, requestData);
              showToast('Duplicate KOT #' + kotData.KOTNumber + ' generated Successfully', '#27ae60');
                        
              removeAlreadyProccessedActionRequest(kotData.KOTNumber);
                        
              break;
            }
            case "PRINT_BILL": {
              

              confirmBillGeneration(kotData, requestData);
              removeAlreadyProccessedActionRequest(kotData.KOTNumber);
                        
              //go starting again, after some cool off.
              setTimeout(function () { initialiseProcessing(); }, 5000);
              break;
            }
            default: {

              removeAlreadyProccessedActionRequest(kotData.KOTNumber);

              //go starting again, after some cool off.
              setTimeout(function () { initialiseProcessing(); }, 5000);
              break;
            }
          }
        }
        
      },        
      error: function (data) {

        var action_name = '';
        switch (requestData.action) {
          case "PRINT_VIEW": {
            action_name = 'Printing View';
            break;
          }
          case "PRINT_KOT": {
            action_name = 'Printing Duplicate KOT';
            break;
          }
          case "PRINT_BILL": {
            action_name = 'Generating Bill';
            break;
          }
        }


        //KOT not found 
        var splits = kot_request_data.split('_');
        showToast(action_name + ' has been Failed: KOT #<b>' + splits[2] + '</b> is not found.', '#e74c3c');

        //Add to Error Log
        addToErrorLog(moment().format('hh:mm a'), 'REQUEST', 'KOT_NOT_FOUND', requestData.KOT, requestData);
        removeAlreadyProccessedActionRequest(kotData.KOTNumber);

        //go to next step 2 without cool off.
        checkForOrders(0);
      }
    })    
  }

  //Round 2: Check for Orders
  function checkForOrders(index) {


    if (SERVICE_APPROVED_ORDERS == 0) {

      //Update Message
      document.getElementById("pendingOrderMessage").innerHTML = '<tag style="color: #ce8d27"><i class="fa fa-warning" style="color: #ce8d27"></i> Orders Disabled</tag>';

      checkForPrints(0);
      return "";
    }

    //console.log('Checking for Orders...');

    $.ajax({
      type: 'GET',
      url: COMMON_LOCAL_SERVER_IP + '/accelerate_taps_orders/_design/orders/_view/view?include_docs=true',
      contentType: "application/json",
      dataType: 'json',
      timeout: 10000,
      success: function (data) {

        if (data.total_rows == 0) {
          document.getElementById("pendingOrderMessage").innerHTML = 'No Pending Orders';
            
          //go to next round 3, no need of any cool off.
          checkForPrints(0);
        }
        else {
            
          //Update Message
          document.getElementById("pendingOrderMessage").innerHTML = '<b>' + data.total_rows + '</b> Pending Order' + (data.total_rows > 1 ? 's' : '');
          
          var orderData = data.rows[index].doc;

          if (orderData.tapsSource) { //Order from Others Sources

            var billingModesData = DATA_BILLING_MODES;
            var billingParametersData = DATA_BILLING_PARAMETERS;
            var orderSourcesData = DATA_ORDER_SOURCES;
              
            var order_source = orderData.tapsSource.source;
            var order_mode_type = orderData.tapsSource.type;
            var selected_billing_mode_name = '';

            var super_memory_id = orderData._id;
            var super_memory_rev = orderData._rev;


            var c = 0;
            while (orderSourcesData[c]) {

              if (orderSourcesData[c].code == order_source) {
                if (order_mode_type == 'PARCEL') {
                  selected_billing_mode_name = orderSourcesData[c].defaultTakeaway;
                }
                else if (order_mode_type == 'DELIVERY') {
                  selected_billing_mode_name = orderSourcesData[c].defaultDelivery;
                }

                findBillingMode();
                break;
              }

              if (c == orderSourcesData.length - 1) {
                throwSystemBlockingError('ORDER SOURCE NOT CONFIGURED: ' + order_source + ' order has been failed');
                return '';
              }

              c++;
            }

            var selectedBillingMode = '';
                
            function findBillingMode() {

              var m = 0;
              while (billingModesData[m]) {
                if (billingModesData[m].name == selected_billing_mode_name) {
                  selectedBillingMode = billingModesData[m];
                  standardiseCart();
                  break;
                }

                if (m == billingModesData.length - 1) { //last iteration
                  standardiseCart();
                }

                m++;
              }
            }



            //Standardise Cart w.r.t system menu
            function standardiseCart() {
              var incoming_cart = orderData.cart;
              var custom_item_id = 1;

              standardiseItem(0);

              function standardiseItem(index) {

                var item_name = incoming_cart[index].name;
                    
                var standardised_item = '';

                var otherMenuData = MENU_DATA_OTHER_MENU_MAPPINGS[order_source];
                var systemMenu = MENU_DATA_SYSTEM_ORIGINAL;

                var n = 0;
                var isFinishedProcessing = false;

                while (otherMenuData[n] && !isFinishedProcessing) {

                  if (otherMenuData[n].mappedName == item_name) { //item map found

                    if (systemMenu[otherMenuData[n].systemCode]) {
                          
                      var system_equivalent_item = systemMenu[otherMenuData[n].systemCode];

                      if (system_equivalent_item.isCustom) {

                        var system_equivalent_price = 0;
                        var isEquivalentVariantFound = false;

                        for (var j = 0; j < system_equivalent_item.customOptions.length; j++) {
                          if (system_equivalent_item.customOptions[j].customName == otherMenuData[n].systemVariant) {
                            system_equivalent_price = system_equivalent_item.customOptions[j].customPrice;
                            isEquivalentVariantFound = true;
                            break;
                          }
                        }

                        if (isEquivalentVariantFound) {
                                  
                          standardised_item = {
                            "cartIndex": index + 1,
                            "name": system_equivalent_item.name,
                            "category": system_equivalent_item.category,
                            "price": system_equivalent_price,
                            "isCustom": true,
                            "variant": otherMenuData[n].systemVariant,
                            "code": system_equivalent_item.code,
                            "qty": incoming_cart[index].quantity,
                            "cookingTime": system_equivalent_item.cookingTime ? system_equivalent_item.cookingTime : 0,
                            "isPackaged": system_equivalent_item.isPackaged ? system_equivalent_item.isPackaged : false
                          }

                        }
                        else {
                                  
                          standardised_item = {
                            "cartIndex": index + 1,
                            "name": incoming_cart[index].name,
                            "category": system_equivalent_item.category,
                            "price": incoming_cart[index].price,
                            "isCustom": false,
                            "code": system_equivalent_item.code,
                            "qty": incoming_cart[index].quantity,
                            "cookingTime": system_equivalent_item.cookingTime ? system_equivalent_item.cookingTime : 0,
                            "isPackaged": system_equivalent_item.isPackaged ? system_equivalent_item.isPackaged : false
                          }
                                  
                        }
                      }
                      else {
                              
                        standardised_item = {
                          "cartIndex": index + 1,
                          "name": system_equivalent_item.name,
                          "category": system_equivalent_item.category,
                          "price": system_equivalent_item.price,
                          "isCustom": false,
                          "code": system_equivalent_item.code,
                          "qty": incoming_cart[index].quantity,
                          "cookingTime": system_equivalent_item.cookingTime ? system_equivalent_item.cookingTime : 0,
                          "isPackaged": system_equivalent_item.isPackaged ? system_equivalent_item.isPackaged : false
                        }

                      }

                    }
                    else { // item map found. while, the mapped item code does not exist in system menu.
                            
                      standardised_item = {
                        "cartIndex": index + 1,
                        "name": incoming_cart[index].name,
                        "category": "MANUAL_UNKNOWN",
                        "price": incoming_cart[index].price,
                        "isCustom": false,
                        "code": custom_item_id,
                        "qty": incoming_cart[index].quantity,
                        "cookingTime": 0
                      }

                      custom_item_id++;

                    }

                    incoming_cart[index] = standardised_item; //update 
                          
                    if (incoming_cart[index + 1]) {
                      standardiseItem(index + 1);
                    }
                    else { //done, go to next step
                      createOrder(incoming_cart);
                    }

                    isFinishedProcessing = true;

                    break;
                  }



                  if (n == otherMenuData.length - 1) { //last iteration, no mapping found.
                        
                    standardised_item = {
                      "cartIndex": index + 1,
                      "name": incoming_cart[index].name,
                      "category": "MANUAL_UNKNOWN",
                      "price": incoming_cart[index].price,
                      "isCustom": false,
                      "code": custom_item_id,
                      "qty": incoming_cart[index].quantity,
                      "cookingTime": 0
                    }

                    custom_item_id++;

                    incoming_cart[index] = standardised_item; //update 


                    if (incoming_cart[index + 1]) {
                      standardiseItem(index + 1);
                    }
                    else { //done, go to next step
                      createOrder(incoming_cart);
                    }

                    isFinishedProcessing = true;
                          
                    break;
                  }



                  n++;
                } //while


              }

            }


            function createOrder(standardised_cart) {

              if (selectedBillingMode == '') {
                throwSystemBlockingError('INVALID BILLING MODE: ' + order_source + ' order has been failed');
                return '';
              }

                
              //Proceed to create the order
                
              var orderMetaInfo = {};
              orderMetaInfo.mode = selectedBillingMode.name;
              orderMetaInfo.modeType = selectedBillingMode.type;
              orderMetaInfo.reference = orderData.orderDetails.reference;
              orderMetaInfo.isOnline = false;

              var today = moment().format('DD-MM-YYYY');
              var time = moment().format('HHmm');

              var obj = {};

              obj._id = super_memory_id; /* TWEAK: to remove tap order after printing*/
              obj._rev = super_memory_rev;

              obj.KOTNumber = "";
              obj.orderDetails = orderMetaInfo;
              obj.table = orderData.table;

              obj.customerName = orderData.customerName;
              obj.customerMobile = orderData.customerMobile;
              obj.guestCount = 0;
              obj.machineName = 'Auto Generated';
                      
              obj.sessionName = order_source;

              obj.stewardName = orderData.stewardName;
              obj.stewardCode = '';

              obj.date = today;
              obj.timePunch = time;
              obj.timeKOT = "";
              obj.timeBill = "";
              obj.timeSettle = "";

              var cart_products = standardised_cart;
              obj.cart = standardised_cart;
              obj.specialRemarks = orderData.specialRemarks;
              obj.allergyInfo = [];


              /*Process Figures*/
              var subTotal = 0;
              var packagedSubTotal = 0;

              var minimum_cooking_time = 0;

              var n = 0;
              while (cart_products[n]) {

                /* min cooking time */
                if (cart_products[n].cookingTime && cart_products[n].cookingTime > 0) {
                  if (minimum_cooking_time <= cart_products[n].cookingTime) {
                    minimum_cooking_time = cart_products[n].cookingTime;
                  }
                }


                subTotal = subTotal + cart_products[n].qty * cart_products[n].price;

                if (cart_products[n].isPackaged) {
                  packagedSubTotal = packagedSubTotal + cart_products[n].qty * cart_products[n].price;
                }

                n++;
              }



              var tempExtrasList = selectedBillingMode.extras;
              var selectedModeExtras = [];

              var a = 0;
              var b = 0;
              while (tempExtrasList[a]) {
                b = 0;
                while (billingParametersData[b]) {
                  if (tempExtrasList[a].name == billingParametersData[b].name) {
                    billingParametersData[a].value = parseFloat(tempExtrasList[b].value);
                    selectedModeExtras.push(billingParametersData[a]);
                  }
                                
                  b++;
                }
                a++;
              }



              /*Calculate Taxes and Other Charges*/

              //Note: Skip tax and other extras (with isCompulsary no) on packaged food Pepsi ect. (marked with 'isPackaged' = true)

              var otherCharges = [];
              var k = 0;

              if (selectedModeExtras.length > 0) {
                for (k = 0; k < selectedModeExtras.length; k++) {

                  var tempExtraTotal = 0;

                  if (selectedModeExtras[k].value != 0) {
                    if (selectedModeExtras[k].excludePackagedFoods) {
                      if (selectedModeExtras[k].unit == 'PERCENTAGE') {
                        tempExtraTotal = (selectedModeExtras[k].value * (subTotal - packagedSubTotal)) / 100;
                      }
                      else if (selectedModeExtras[k].unit == 'FIXED') {
                        tempExtraTotal = selectedModeExtras[k].value;
                      }
                    }
                    else {
                      if (selectedModeExtras[k].unit == 'PERCENTAGE') {
                        tempExtraTotal = selectedModeExtras[k].value * subTotal / 100;
                      }
                      else if (selectedModeExtras[k].unit == 'FIXED') {
                        tempExtraTotal = selectedModeExtras[k].value;
                      }
                    }


                  }

                  tempExtraTotal = Math.round(tempExtraTotal * 100) / 100;

                  otherCharges.push({
                    "name": selectedModeExtras[k].name,
                    "value": selectedModeExtras[k].value,
                    "unit": selectedModeExtras[k].unit,
                    "amount": tempExtraTotal,
                    "isPackagedExcluded": selectedModeExtras[k].excludePackagedFoods
                  })
                }
              }


              obj.extras = otherCharges;
              obj.discount = {};
              obj.customExtras = {};

              printFreshKOT(obj, 'REQUEST_AUTO_BILL_GENERATION');
              showToast('The <b>' + order_source + '</b> Order generated Successfully!');

            } //create order
          
          } // swiggy, zomato orders..
          else { //Order from Mobile Devices

            if (orderData.KOTNumber != '') { //Editing Order case..

              var kotID = orderData.KOTNumber;

              //Check if it's already existing KOT (editing or not)
              var accelerate_licencee_branch = window.localStorage.accelerate_licence_branch ? window.localStorage.accelerate_licence_branch : '';
              if (!accelerate_licencee_branch || accelerate_licencee_branch == '') {
                showToast('Invalid Licence Error: KOT can not be generated. Please contact Accelerate Support if problem persists.', '#e74c3c');
                return '';
              }

              var kot_request_data = accelerate_licencee_branch + "_KOT_" + kotID;

              $.ajax({
                type: 'GET',
                url: COMMON_LOCAL_SERVER_IP + '/accelerate_kot/' + kot_request_data,
                timeout: 10000,
                success: function (oldKOTData) {
                  if (oldKOTData._id != "") {
                    printEditedKOT(oldKOTData, orderData);
                  }
                  else {
                    showToast('System Error: KOT is not found. Please contact Accelerate Support if problem persists.', '#e74c3c');
                          
                    //start again
                    removeTapsOrderRequest(orderData._id, orderData._rev);
                    setTimeout(function () { initialiseProcessing(); }, 3000);
                  }
                },
                error: function (data) {

                  //KOT not found 
                  showToast('Editing KOT Failed: KOT #<b>' + kotID + '</b> is not found on the server.', '#e74c3c');

                  //Add to Error Log
                  var errorObj = {
                    "table": orderData.table,
                    "staffName": orderData.stewardName,
                    "staffCode": orderData.stewardCode,
                    "machine": orderData.machineName
                  }

                  addToErrorLog(moment().format('hh:mm a'), 'ORDER', 'KOT_NOT_FOUND', kot_request_data, errorObj);
                  removeTapsOrderRequest(orderData._id, orderData._rev);

                  //start again
                  setTimeout(function () { initialiseProcessing(); }, 3000);
                }
              });
            }
            else {
              printFreshKOT(orderData); //Fresh Order case..
            }
                
          }

        }
      },
      error: function (data) {
        showToast('System Error: Unable to fetch orders. Please contact Accelerate Support if problem persists.', '#e74c3c');
          
        //go to next round - 3
        checkForPrints(0);
      }

    });

  }


    //Round 3: Check for Prints (running KOTs punched from Non-mobile devices)
    function checkForPrints(index) {

    if (SERVICE_APPROVED_PRINTS == 0) {

      //Update Message
      document.getElementById("pendingPrintsMessage").innerHTML = '<tag style="color: #ce8d27"><i class="fa fa-warning" style="color: #ce8d27"></i> KOTs Disabled</tag>';

      setTimeout(function () { initialiseProcessing(); }, 5000);
      return "";
    }

    $.ajax({
      type: 'GET',
      url: COMMON_LOCAL_SERVER_IP + '/accelerate_kot_print_requests/_design/print-requests/_view/fetchall',
      contentType: "application/json",
      dataType: 'json',
      timeout: 10000,
      success: function (data) {

        if (data.rows.length == 0) {
          //Update Message
          document.getElementById("pendingPrintsMessage").innerHTML = 'No Pending KOTs';

          //Relax! and start again! 
          setTimeout(function () { initialiseProcessing(); }, 5000);
        }
        else {

          //Update Message
          document.getElementById("pendingPrintsMessage").innerHTML = '<b>' + data.total_rows + '</b> Pending KOT' + (data.total_rows > 1 ? 's' : '');

          var requestData = data.rows[index].value;

          requestData.printRequest.modeType = requestData.orderDetails.modeType;
                    
          switch (requestData.printRequest.action) {
            case "KOT_NEW": {
              printKOTRequestNew(requestData);
              removeKOTPrintRequest(requestData._id, requestData._rev, requestData.printRequest);
              break;
            }
            case "KOT_EDITING": {
              printKOTRequestEdited(requestData, requestData.printRequest.comparison);
              removeKOTPrintRequest(requestData._id, requestData._rev, requestData.printRequest);
              break;
            }
            case "KOT_DUPLICATE": {
              printKOTRequestDuplicate(requestData);
              removeKOTPrintRequest(requestData._id, requestData._rev, requestData.printRequest);
              break;
            }
            case "KOT_CANCEL": {
              printKOTRequestCancel(requestData);
              removeKOTPrintRequest(requestData._id, requestData._rev, requestData.printRequest);
              break;
            }
            default: {
                        
              removeKOTPrintRequest(requestData._id, requestData._rev, requestData.printRequest);

              //go to starting again, after some cool off.
              setTimeout(function () { initialiseProcessing(); }, 5000);
                        
              break;
            }
          }

          
        }
      },
      error: function (data) {
        showToast('System Error: Unable to fetch print requests. Please contact Accelerate Support if problem persists.', '#e74c3c');
          
        //Relax! and start again! 
        setTimeout(function () { initialiseProcessing(); }, 5000);
      }

    });

  }

}


refreshRecentOrdersStream();


/* KOT Printing : New / Editing / Duplicate / Cancellation */

//To print NEW KOT
function printKOTRequestNew(obj){
    
    var isKOTRelayingEnabled = window.localStorage.appOtherPreferences_KOTRelayEnabled ? (window.localStorage.appOtherPreferences_KOTRelayEnabled == 1 ? true : false) : false;
    var isKOTRelayingEnabledOnDefault = window.localStorage.appOtherPreferences_KOTRelayEnabledDefaultKOT ? (window.localStorage.appOtherPreferences_KOTRelayEnabledDefaultKOT == 1 ? true : false) : false;

    var default_set_KOT_printer = window.localStorage.systemOptionsSettings_defaultKOTPrinter ? window.localStorage.systemOptionsSettings_defaultKOTPrinter : '';
    var default_set_KOT_printer_data = null;
    var only_KOT_printer = null;

    var original_order_object_cart = obj.cart;


    findDefaultKOTPrinter();

    function findDefaultKOTPrinter() {

        var allConfiguredPrintersList = window.localStorage.configuredPrintersData ? JSON.parse(window.localStorage.configuredPrintersData) : [];

        var g = 0;
        while (allConfiguredPrintersList[g]) {

            if (allConfiguredPrintersList[g].type == 'KOT') {
                for (var a = 0; a < allConfiguredPrintersList[g].list.length; a++) {
                    if (allConfiguredPrintersList[g].list[a].name == default_set_KOT_printer) {
                        default_set_KOT_printer_data = allConfiguredPrintersList[g].list[a];
                    } else if (only_KOT_printer == null) {
                        only_KOT_printer = allConfiguredPrintersList[g].list[a];
                    }
                }

                break;
            }

            g++;
        }
    }

    if (default_set_KOT_printer_data == null) {
        default_set_KOT_printer_data = only_KOT_printer;
    }


    if (isKOTRelayingEnabled) {

        showPrintingAnimation();

        var relayRuleList = window.localStorage.custom_kot_relays ? JSON.parse(window.localStorage.custom_kot_relays) : [];
        var relaySkippedItems = [];

        populateRelayRules();

        function populateRelayRules() {
            var n = 0;
            while (relayRuleList[n]) {

                relayRuleList[n].subcart = [];

                for (var i = 0; i < obj.cart.length; i++) {
                    if (obj.cart[i].category == relayRuleList[n].name && relayRuleList[n].printer != '') {
                        relayRuleList[n].subcart.push(obj.cart[i]);
                    }
                }

                if (n == relayRuleList.length - 1) {
                    generateRelaySkippedItems();
                }

                n++;
            }

            if (relayRuleList.length == 0) {
                generateRelaySkippedItems();
            }
        }

        function generateRelaySkippedItems() {
            var m = 0;
            while (obj.cart[m]) {

                if (relayRuleList.length != 0) {
                    for (var i = 0; i < relayRuleList.length; i++) {
                        if (obj.cart[m].category == relayRuleList[i].name && relayRuleList[i].printer != '') {
                            //item found
                            break;
                        }

                        if (i == relayRuleList.length - 1) { //last iteration and item not found
                            relaySkippedItems.push(obj.cart[m])
                        }
                    }
                } else { //no relays set, skip all items
                    relaySkippedItems.push(obj.cart[m]);
                }

                if (m == obj.cart.length - 1) { //last iteration

                    //Print Relay Skipped items (if exists)
                    var relay_skipped_obj = obj;
                    relay_skipped_obj.cart = relaySkippedItems;

                    if (relaySkippedItems.length > 0) {

                        var defaultKOTPrinter = window.localStorage.systemOptionsSettings_defaultKOTPrinter ? window.localStorage.systemOptionsSettings_defaultKOTPrinter : '';

                        if (defaultKOTPrinter == '') {
                            if (isKOTRelayingEnabledOnDefault) { //relay KOT on default printer as well. otherwise, complete order will be printed on default printer.
                                sendToPrinter(relay_skipped_obj, 'KOT', default_set_KOT_printer_data);

                                printRelayedKOT(relayRuleList);
                            } else {
                                var preserved_order = obj;
                                preserved_order.cart = original_order_object_cart;

                                sendToPrinter(preserved_order, 'KOT', default_set_KOT_printer_data);

                                printRelayedKOT(relayRuleList);
                            }
                        } else {
                            var allConfiguredPrintersList = window.localStorage.configuredPrintersData ? JSON.parse(window.localStorage.configuredPrintersData) : [];
                            var selected_printer = '';

                            var g = 0;
                            while (allConfiguredPrintersList[g]) {
                                if (allConfiguredPrintersList[g].type == 'KOT') {
                                    for (var a = 0; a < allConfiguredPrintersList[g].list.length; a++) {
                                        if (allConfiguredPrintersList[g].list[a].name == defaultKOTPrinter) {
                                            selected_printer = allConfiguredPrintersList[g].list[a];

                                            if (isKOTRelayingEnabledOnDefault) {
                                                sendToPrinter(relay_skipped_obj, 'KOT', selected_printer);

                                                printRelayedKOT(relayRuleList);
                                            } else {

                                                var preserved_order = obj;
                                                preserved_order.cart = original_order_object_cart;

                                                sendToPrinter(preserved_order, 'KOT', selected_printer);

                                                printRelayedKOT(relayRuleList);
                                            }

                                            break;
                                        }
                                    }
                                }


                                if (g == allConfiguredPrintersList.length - 1) {
                                    if (selected_printer == '') { //No printer found, print on default!
                                        if (isKOTRelayingEnabledOnDefault) {
                                            sendToPrinter(relay_skipped_obj, 'KOT', default_set_KOT_printer_data);

                                            printRelayedKOT(relayRuleList);
                                        } else {
                                            var preserved_order = obj;
                                            preserved_order.cart = original_order_object_cart;

                                            sendToPrinter(preserved_order, 'KOT', default_set_KOT_printer_data);

                                            printRelayedKOT(relayRuleList);
                                        }
                                    }
                                }

                                g++;
                            }
                        }
                    } else {
                        if (!isKOTRelayingEnabledOnDefault) {
                            var preserved_order = obj;
                            preserved_order.cart = original_order_object_cart;

                            sendToPrinter(preserved_order, 'KOT', default_set_KOT_printer_data);
                            printRelayedKOT(relayRuleList);
                        } else {
                            printRelayedKOT(relayRuleList, 'NO_DELAY_PLEASE');
                        }
                    }

                }

                m++;
            }
        }

        function printRelayedKOT(relayedList, optionalRequest) {

            var allConfiguredPrintersList = window.localStorage.configuredPrintersData ? JSON.parse(window.localStorage.configuredPrintersData) : [];
            var g = 0;
            var allPrintersList = [];

            while (allConfiguredPrintersList[g]) {

                if (allConfiguredPrintersList[g].type == 'KOT') { //filter only KOT Printers
                    for (var a = 0; a < allConfiguredPrintersList[g].list.length; a++) {
                        allPrintersList.push({
                            "name": allConfiguredPrintersList[g].list[a].name,
                            "target": allConfiguredPrintersList[g].list[a].target,
                            "template": allConfiguredPrintersList[g].list[a]
                        });
                    }

                    //Start relay after some significant delay. 
                    //Printing of relay skipped items might not be completed yet...
                    if (optionalRequest == 'NO_DELAY_PLEASE') {
                        startRelayPrinting(0);
                    } else {
                        setTimeout(function() {
                            startRelayPrinting(0);
                        }, 3000);
                    }

                    break;
                }

                if (g == allConfiguredPrintersList.length - 1) {
                    if (optionalRequest == 'NO_DELAY_PLEASE') {
                        startRelayPrinting(0);
                    } else {
                        setTimeout(function() {
                            startRelayPrinting(0);
                        }, 3000);
                    }
                }

                g++;
            }


            function startRelayPrinting(index) {

                console.log('Relay Print - Round ' + index + ' on ' + allPrintersList[index].name);

                var relayedItems = [];
                for (var i = 0; i < relayedList.length; i++) {
                    if (relayedList[i].subcart.length > 0 && relayedList[i].printer == allPrintersList[index].name) {
                        relayedItems = relayedItems.concat(relayedList[i].subcart)
                    }

                    if (i == relayedList.length - 1) { //last iteration
                        if (relayedItems.length > 0) {
                            var relayedNewObj = obj;
                            relayedNewObj.cart = relayedItems;

                            sendToPrinter(relayedNewObj, 'KOT', allPrintersList[index].template);

                            if (allPrintersList[index + 1]) {
                                //go to next after some delay
                                setTimeout(function() {
                                    startRelayPrinting(index + 1);
                                }, 3000);
                            } else {
                                finishPrintingAnimation();

                                //Process Next Print 
                                setTimeout(function(){ initialiseProcessing(); }, 3000);                                   
                            }
                        } else {
                            //There are no items to relay. Go to next.
                            if (allPrintersList[index + 1]) {
                                startRelayPrinting(index + 1);
                            } else {
                                finishPrintingAnimation();

                                //Process Next Print 
                                setTimeout(function(){ initialiseProcessing(); }, 3000);                              
                            }
                        }
                    }
                }
            }


        }
    } else { //no relay (normal case)

        var defaultKOTPrinter = window.localStorage.systemOptionsSettings_defaultKOTPrinter ? window.localStorage.systemOptionsSettings_defaultKOTPrinter : '';

        if (defaultKOTPrinter == '') {
            sendToPrinter(obj, 'KOT');

            //Process Next Print 
            setTimeout(function(){ initialiseProcessing(); }, 3000);   

        } else {
            var allConfiguredPrintersList = window.localStorage.configuredPrintersData ? JSON.parse(window.localStorage.configuredPrintersData) : [];
            var selected_printer = '';

            var g = 0;
            while (allConfiguredPrintersList[g]) {
                if (allConfiguredPrintersList[g].type == 'KOT') {
                    for (var a = 0; a < allConfiguredPrintersList[g].list.length; a++) {
                        if (allConfiguredPrintersList[g].list[a].name == defaultKOTPrinter) {
                            selected_printer = allConfiguredPrintersList[g].list[a];
                            sendToPrinter(obj, 'KOT', selected_printer);

                            //Process Next Print 
                            setTimeout(function(){ initialiseProcessing(); }, 3000);                               
                            break;
                        }
                    }
                }


                if (g == allConfiguredPrintersList.length - 1) {
                    if (selected_printer == '') { //No printer found, print on default!
                        sendToPrinter(obj, 'KOT');

                        //Process Next Print 
                        setTimeout(function(){ initialiseProcessing(); }, 3000);                           
                    }
                }

                g++;
            }
        }

    }
}

//To print EDITED KOT
function printKOTRequestEdited(kot, compareObject){

    var isKOTRelayingEnabled = window.localStorage.appOtherPreferences_KOTRelayEnabled ? (window.localStorage.appOtherPreferences_KOTRelayEnabled == 1 ? true : false) : false;
    var isKOTRelayingEnabledOnDefault = window.localStorage.appOtherPreferences_KOTRelayEnabledDefaultKOT ? (window.localStorage.appOtherPreferences_KOTRelayEnabledDefaultKOT == 1 ? true : false) : false;

    var default_set_KOT_printer = window.localStorage.systemOptionsSettings_defaultKOTPrinter ? window.localStorage.systemOptionsSettings_defaultKOTPrinter : '';
    var default_set_KOT_printer_data = null;
    var only_KOT_printer = null;


    findDefaultKOTPrinter();

    function findDefaultKOTPrinter() {

        var allConfiguredPrintersList = window.localStorage.configuredPrintersData ? JSON.parse(window.localStorage.configuredPrintersData) : [];

        var g = 0;
        while (allConfiguredPrintersList[g]) {

            if (allConfiguredPrintersList[g].type == 'KOT') {
                for (var a = 0; a < allConfiguredPrintersList[g].list.length; a++) {
                    if (allConfiguredPrintersList[g].list[a].name == default_set_KOT_printer) {
                        default_set_KOT_printer_data = allConfiguredPrintersList[g].list[a];
                    } else if (only_KOT_printer == null) {
                        only_KOT_printer = allConfiguredPrintersList[g].list[a];
                    }
                }

                break;
            }

            g++;
        }
    }

    if (default_set_KOT_printer_data == null) {
        default_set_KOT_printer_data = only_KOT_printer;
    }


    if (isKOTRelayingEnabled) {

        showPrintingAnimation();

        var relayRuleList = window.localStorage.custom_kot_relays ? JSON.parse(window.localStorage.custom_kot_relays) : [];
        var relaySkippedItems = [];

        populateRelayRules();

        function populateRelayRules() {
            var n = 0;
            while (relayRuleList[n]) {

                relayRuleList[n].subcart = [];

                for (var i = 0; i < compareObject.length; i++) {
                    if (compareObject[i].category == relayRuleList[n].name && relayRuleList[n].printer != '') {
                        relayRuleList[n].subcart.push(compareObject[i]);
                    }
                }

                if (n == relayRuleList.length - 1) {
                    generateRelaySkippedItems();
                }

                n++;
            }

            if (relayRuleList.length == 0) {
                generateRelaySkippedItems();
            }
        }

        function generateRelaySkippedItems() {
            var m = 0;
            while (compareObject[m]) {

                if (relayRuleList.length != 0) {
                    for (var i = 0; i < relayRuleList.length; i++) {
                        if (compareObject[m].category == relayRuleList[i].name && relayRuleList[i].printer != '') {
                            //item found
                            break;
                        }

                        if (i == relayRuleList.length - 1) { //last iteration and item not found
                            relaySkippedItems.push(compareObject[m])
                        }
                    }
                } else { //no relays set, skip all items
                    relaySkippedItems.push(compareObject[m]);
                }

                if (m == compareObject.length - 1) {

                    if (relaySkippedItems.length > 0) {
                        //Print skipped items (non-relayed items)
                        var defaultKOTPrinter = window.localStorage.systemOptionsSettings_defaultKOTPrinter ? window.localStorage.systemOptionsSettings_defaultKOTPrinter : '';

                        if (defaultKOTPrinter == '') {
                            sendKOTChangesToPrinter(kot, relaySkippedItems);
                            printRelayedKOT(relayRuleList);
                        } else {
                            var allConfiguredPrintersList = window.localStorage.configuredPrintersData ? JSON.parse(window.localStorage.configuredPrintersData) : [];
                            var selected_printer = '';

                            var g = 0;
                            while (allConfiguredPrintersList[g]) {
                                if (allConfiguredPrintersList[g].type == 'KOT') {
                                    for (var a = 0; a < allConfiguredPrintersList[g].list.length; a++) {
                                        if (allConfiguredPrintersList[g].list[a].name == defaultKOTPrinter) {
                                            selected_printer = allConfiguredPrintersList[g].list[a];

                                            if (isKOTRelayingEnabledOnDefault) {
                                                sendKOTChangesToPrinter(kot, relaySkippedItems, selected_printer);
                                                printRelayedKOT(relayRuleList);
                                            } else {
                                                sendKOTChangesToPrinter(kot, compareObject, selected_printer);
                                                printRelayedKOT(relayRuleList);
                                            }

                                            break;
                                        }
                                    }
                                }


                                if (g == allConfiguredPrintersList.length - 1) {
                                    if (selected_printer == '') { //No printer found, print on default!
                                        if (isKOTRelayingEnabledOnDefault) {
                                            sendKOTChangesToPrinter(kot, relaySkippedItems, default_set_KOT_printer_data);
                                            printRelayedKOT(relayRuleList);
                                        } else {
                                            sendKOTChangesToPrinter(kot, compareObject, default_set_KOT_printer_data);
                                            printRelayedKOT(relayRuleList);
                                        }
                                    }
                                }

                                g++;
                            }
                        }

                    } else {
                        if (!isKOTRelayingEnabledOnDefault) {
                            sendKOTChangesToPrinter(kot, compareObject, default_set_KOT_printer_data);
                            printRelayedKOT(relayRuleList);
                        } else {
                            printRelayedKOT(relayRuleList, 'NO_DELAY_PLEASE');
                        }
                    }



                }

                m++;
            }
        }

        function printRelayedKOT(relayedList, optionalRequest) {

            var allConfiguredPrintersList = window.localStorage.configuredPrintersData ? JSON.parse(window.localStorage.configuredPrintersData) : [];
            var g = 0;
            var allPrintersList = [];

            while (allConfiguredPrintersList[g]) {

                if (allConfiguredPrintersList[g].type == 'KOT') { //filter only KOT Printers
                    for (var a = 0; a < allConfiguredPrintersList[g].list.length; a++) {
                        allPrintersList.push({
                            "name": allConfiguredPrintersList[g].list[a].name,
                            "target": allConfiguredPrintersList[g].list[a].target,
                            "template": allConfiguredPrintersList[g].list[a]
                        });
                    }

                    //Start relay after some significant delay. 
                    //Printing of relay skipped items might not be completed yet...
                    if (optionalRequest == 'NO_DELAY_PLEASE') {
                        startRelayPrinting(0);
                    } else {
                        setTimeout(function() {
                            startRelayPrinting(0);
                        }, 3000);
                    }

                    break;
                }

                if (g == allConfiguredPrintersList.length - 1) {
                    if (optionalRequest == 'NO_DELAY_PLEASE') {
                        startRelayPrinting(0);
                    } else {
                        setTimeout(function() {
                            startRelayPrinting(0);
                        }, 3000);
                    }
                }

                g++;
            }

            function startRelayPrinting(index) {

                console.log('Relay Print - Round ' + index + ' on ' + allPrintersList[index].name);

                var relayedItems = [];
                for (var i = 0; i < relayedList.length; i++) {
                    if (relayedList[i].subcart.length > 0 && relayedList[i].printer == allPrintersList[index].name) {
                        relayedItems = relayedItems.concat(relayedList[i].subcart)
                    }

                    if (i == relayedList.length - 1) { //last iteration
                        if (relayedItems.length > 0) {

                            sendKOTChangesToPrinter(kot, relayedItems, allPrintersList[index].template);

                            if (allPrintersList[index + 1]) {
                                //go to next after some delay
                                setTimeout(function() {
                                    startRelayPrinting(index + 1);
                                }, 3000);
                            } else {
                                finishPrintingAnimation();
                                
                                //Process Next Print 
                                setTimeout(function(){ initialiseProcessing(); }, 3000);


                            }
                        } else {
                            //There are no items to relay. Go to next.
                            if (allPrintersList[index + 1]) {
                                startRelayPrinting(index + 1);
                            } else {
                                finishPrintingAnimation();

                                //Process Next Print 
                                setTimeout(function(){ initialiseProcessing(); }, 3000);

                            }
                        }
                    }
                }
            }


        }
    } else { //no relay (normal case)

        var defaultKOTPrinter = window.localStorage.systemOptionsSettings_defaultKOTPrinter ? window.localStorage.systemOptionsSettings_defaultKOTPrinter : '';

        if (defaultKOTPrinter == '') {
            sendKOTChangesToPrinter(kot, compareObject);

            //Process Next Print 
            setTimeout(function(){ initialiseProcessing(); }, 3000);

        } else {
            var allConfiguredPrintersList = window.localStorage.configuredPrintersData ? JSON.parse(window.localStorage.configuredPrintersData) : [];
            var selected_printer = '';

            var g = 0;
            while (allConfiguredPrintersList[g]) {
                if (allConfiguredPrintersList[g].type == 'KOT') {
                    for (var a = 0; a < allConfiguredPrintersList[g].list.length; a++) {
                        if (allConfiguredPrintersList[g].list[a].name == defaultKOTPrinter) {
                            selected_printer = allConfiguredPrintersList[g].list[a];
                            sendKOTChangesToPrinter(kot, compareObject, selected_printer);

                            //Process Next Print 
                            setTimeout(function(){ initialiseProcessing(); }, 3000);
                            break;
                        }
                    }
                }


                if (g == allConfiguredPrintersList.length - 1) {
                    if (selected_printer == '') { //No printer found, print on default!
                        sendKOTChangesToPrinter(kot, compareObject);

                        //Process Next Print 
                        setTimeout(function(){ initialiseProcessing(); }, 3000);
                    }
                }

                g++;
            }
        }

    }  
}

//To print DUPLICATE KOT
function printKOTRequestDuplicate(data, optionalSource){

    var obj = data;
    var original_order_object_cart = obj.cart;

    var isKOTRelayingEnabled = window.localStorage.appOtherPreferences_KOTRelayEnabled ? (window.localStorage.appOtherPreferences_KOTRelayEnabled == 1 ? true : false) : false;
    var isKOTRelayingEnabledOnDefault = window.localStorage.appOtherPreferences_KOTRelayEnabledDefaultKOT ? (window.localStorage.appOtherPreferences_KOTRelayEnabledDefaultKOT == 1 ? true : false) : false;

    var default_set_KOT_printer = window.localStorage.systemOptionsSettings_defaultKOTPrinter ? window.localStorage.systemOptionsSettings_defaultKOTPrinter : '';
    var default_set_KOT_printer_data = null;
    var only_KOT_printer = null;


    findDefaultKOTPrinter();

    function findDefaultKOTPrinter() {

        var allConfiguredPrintersList = window.localStorage.configuredPrintersData ? JSON.parse(window.localStorage.configuredPrintersData) : [];

        var g = 0;
        while (allConfiguredPrintersList[g]) {

            if (allConfiguredPrintersList[g].type == 'KOT') {
                for (var a = 0; a < allConfiguredPrintersList[g].list.length; a++) {
                    if (allConfiguredPrintersList[g].list[a].name == default_set_KOT_printer) {
                        default_set_KOT_printer_data = allConfiguredPrintersList[g].list[a];
                    } else if (only_KOT_printer == null) {
                        only_KOT_printer = allConfiguredPrintersList[g].list[a];
                    }
                }

                break;
            }

            g++;
        }
    }

    if (default_set_KOT_printer_data == null) {
        default_set_KOT_printer_data = only_KOT_printer;
    }


    if (isKOTRelayingEnabled) {

        showPrintingAnimation();

        var relayRuleList = window.localStorage.custom_kot_relays ? JSON.parse(window.localStorage.custom_kot_relays) : [];
        var relaySkippedItems = [];

        populateRelayRules();

        function populateRelayRules() {
            var n = 0;
            while (relayRuleList[n]) {

                relayRuleList[n].subcart = [];

                for (var i = 0; i < obj.cart.length; i++) {
                    if (obj.cart[i].category == relayRuleList[n].name && relayRuleList[n].printer != '') {
                        relayRuleList[n].subcart.push(obj.cart[i]);
                    }
                }

                if (n == relayRuleList.length - 1) {
                    generateRelaySkippedItems();
                }

                n++;
            }

            if (relayRuleList.length == 0) {
                generateRelaySkippedItems();
            }
        }

        function generateRelaySkippedItems() {
            var m = 0;
            while (obj.cart[m]) {

                if (relayRuleList.length != 0) {
                    for (var i = 0; i < relayRuleList.length; i++) {
                        if (obj.cart[m].category == relayRuleList[i].name && relayRuleList[i].printer != '') {
                            //item found
                            break;
                        }

                        if (i == relayRuleList.length - 1) { //last iteration and item not found
                            relaySkippedItems.push(obj.cart[m])
                        }
                    }
                } else { //no relays set, skip all items
                    relaySkippedItems.push(obj.cart[m]);
                }

                if (m == obj.cart.length - 1) {

                    //Print Relay Skipped items (if exists)
                    var relay_skipped_obj = obj;
                    relay_skipped_obj.cart = relaySkippedItems;

                    if (relaySkippedItems.length > 0) {

                        //sendToPrinter(relay_skipped_obj, 'DUPLICATE_KOT');

                        var defaultKOTPrinter = window.localStorage.systemOptionsSettings_defaultKOTPrinter ? window.localStorage.systemOptionsSettings_defaultKOTPrinter : '';

                        if (defaultKOTPrinter == '') {
                            sendToPrinter(relay_skipped_obj, 'DUPLICATE_KOT');
                            if (isKOTRelayingEnabledOnDefault) {
                                sendToPrinter(relay_skipped_obj, 'DUPLICATE_KOT', default_set_KOT_printer_data);

                                printRelayedKOT(relayRuleList);
                            } else {
                                var preserved_order = obj;
                                preserved_order.cart = original_order_object_cart;
                                sendToPrinter(preserved_order, 'DUPLICATE_KOT', default_set_KOT_printer_data);

                                printRelayedKOT(relayRuleList);
                            }

                        } else {

                            var allConfiguredPrintersList = window.localStorage.configuredPrintersData ? JSON.parse(window.localStorage.configuredPrintersData) : [];
                            var selected_printer = '';

                            var g = 0;
                            while (allConfiguredPrintersList[g]) {
                                if (allConfiguredPrintersList[g].type == 'KOT') {
                                    for (var a = 0; a < allConfiguredPrintersList[g].list.length; a++) {
                                        if (allConfiguredPrintersList[g].list[a].name == defaultKOTPrinter) {
                                            selected_printer = allConfiguredPrintersList[g].list[a];

                                            if (isKOTRelayingEnabledOnDefault) {
                                                sendToPrinter(relay_skipped_obj, 'DUPLICATE_KOT', default_set_KOT_printer_data);

                                                printRelayedKOT(relayRuleList);
                                            } else {
                                                var preserved_order = obj;
                                                preserved_order.cart = original_order_object_cart;
                                                sendToPrinter(preserved_order, 'DUPLICATE_KOT', default_set_KOT_printer_data);

                                                printRelayedKOT(relayRuleList);
                                            }

                                            break;
                                        }
                                    }
                                }


                                if (g == allConfiguredPrintersList.length - 1) {
                                    if (selected_printer == '') { //No printer found, print on default!
                                        if (isKOTRelayingEnabledOnDefault) {
                                            sendToPrinter(relay_skipped_obj, 'DUPLICATE_KOT', default_set_KOT_printer_data);

                                            printRelayedKOT(relayRuleList);
                                        } else {
                                            var preserved_order = obj;
                                            preserved_order.cart = original_order_object_cart;
                                            sendToPrinter(preserved_order, 'DUPLICATE_KOT', default_set_KOT_printer_data);

                                            printRelayedKOT(relayRuleList);
                                        }
                                    }
                                }

                                g++;
                            }
                        }
                    } else {
                        if (!isKOTRelayingEnabledOnDefault) {
                            var preserved_order = obj;
                            preserved_order.cart = original_order_object_cart;

                            sendToPrinter(preserved_order, 'DUPLICATE_KOT', default_set_KOT_printer_data);

                            printRelayedKOT(relayRuleList);
                        } else {
                            printRelayedKOT(relayRuleList, 'NO_DELAY_PLEASE');
                        }
                    }



                }

                m++;
            }
        }

        function printRelayedKOT(relayedList, optionalRequest) {

            var allConfiguredPrintersList = window.localStorage.configuredPrintersData ? JSON.parse(window.localStorage.configuredPrintersData) : [];
            var g = 0;
            var allPrintersList = [];

            while (allConfiguredPrintersList[g]) {

                if (allConfiguredPrintersList[g].type == 'KOT') { //filter only KOT Printers
                    for (var a = 0; a < allConfiguredPrintersList[g].list.length; a++) {
                        allPrintersList.push({
                            "name": allConfiguredPrintersList[g].list[a].name,
                            "target": allConfiguredPrintersList[g].list[a].target,
                            "template": allConfiguredPrintersList[g].list[a]
                        });
                    }

                    //Start relay after some significant delay. 
                    //Printing of relay skipped items might not be completed yet...
                    if (optionalRequest == 'NO_DELAY_PLEASE') {
                        startRelayPrinting(0);
                    } else {
                        setTimeout(function() {
                            startRelayPrinting(0);
                        }, 3000);
                    }

                    break;
                }

                if (g == allConfiguredPrintersList.length - 1) {
                    if (optionalRequest == 'NO_DELAY_PLEASE') {
                        startRelayPrinting(0);
                    } else {
                        setTimeout(function() {
                            startRelayPrinting(0);
                        }, 3000);
                    }
                }

                g++;
            }


            function startRelayPrinting(index) {

                console.log('Relay Print - Round ' + index + ' on ' + allPrintersList[index].name);

                var relayedItems = [];
                for (var i = 0; i < relayedList.length; i++) {
                    if (relayedList[i].subcart.length > 0 && relayedList[i].printer == allPrintersList[index].name) {
                        relayedItems = relayedItems.concat(relayedList[i].subcart)
                    }

                    if (i == relayedList.length - 1) { //last iteration
                        if (relayedItems.length > 0) {
                            var relayedNewObj = obj;
                            relayedNewObj.cart = relayedItems;

                            sendToPrinter(relayedNewObj, 'DUPLICATE_KOT', allPrintersList[index].template);

                            if (allPrintersList[index + 1]) {
                                //go to next after some delay
                                setTimeout(function() {
                                    startRelayPrinting(index + 1);
                                }, 3000);
                            } else {
                                finishPrintingAnimation();

                                //Process Next Print 
                                setTimeout(function(){ initialiseProcessing(); }, 3000);
                            }
                        } else {
                            //There are no items to relay. Go to next.
                            if (allPrintersList[index + 1]) {
                                startRelayPrinting(index + 1);
                            } else {
                                finishPrintingAnimation();
                                
                                //Process Next Print 
                                setTimeout(function(){ initialiseProcessing(); }, 3000);
                            }
                        }
                    }
                }
            }

        }
    } else { //no relay (normal case)

        var defaultKOTPrinter = window.localStorage.systemOptionsSettings_defaultKOTPrinter ? window.localStorage.systemOptionsSettings_defaultKOTPrinter : '';

        if (defaultKOTPrinter == '') {
            sendToPrinter(obj, 'DUPLICATE_KOT');

            //Process Next Print 
            setTimeout(function(){ initialiseProcessing(); }, 3000);
        } else {

            var allConfiguredPrintersList = window.localStorage.configuredPrintersData ? JSON.parse(window.localStorage.configuredPrintersData) : [];
            var selected_printer = '';

            var g = 0;
            while (allConfiguredPrintersList[g]) {
                if (allConfiguredPrintersList[g].type == 'KOT') {
                    for (var a = 0; a < allConfiguredPrintersList[g].list.length; a++) {
                        if (allConfiguredPrintersList[g].list[a].name == defaultKOTPrinter) {
                            selected_printer = allConfiguredPrintersList[g].list[a];
                            sendToPrinter(obj, 'DUPLICATE_KOT', selected_printer);

                            //Process Next Print 
                            setTimeout(function(){ initialiseProcessing(); }, 3000);
                            
                            break;
                        }
                    }
                }


                if (g == allConfiguredPrintersList.length - 1) {
                    if (selected_printer == '') { //No printer found, print on default!
                        sendToPrinter(obj, 'DUPLICATE_KOT');

                        //Process Next Print 
                        setTimeout(function(){ initialiseProcessing(); }, 3000);
                    }
                }

                g++;
            }
        }

    }  
}

//To print CANCELLED KOT
function printKOTRequestCancel(kot, optionalPageRef){

    var obj = kot;
    var original_order_object_cart = kot.cart;

    var isKOTRelayingEnabled = window.localStorage.appOtherPreferences_KOTRelayEnabled ? (window.localStorage.appOtherPreferences_KOTRelayEnabled == 1 ? true : false) : false;
    var isKOTRelayingEnabledOnDefault = window.localStorage.appOtherPreferences_KOTRelayEnabledDefaultKOT ? (window.localStorage.appOtherPreferences_KOTRelayEnabledDefaultKOT == 1 ? true : false) : false;

    var default_set_KOT_printer = window.localStorage.systemOptionsSettings_defaultKOTPrinter ? window.localStorage.systemOptionsSettings_defaultKOTPrinter : '';
    var default_set_KOT_printer_data = null;
    var only_KOT_printer = null;


    findDefaultKOTPrinter();

    function findDefaultKOTPrinter() {

        var allConfiguredPrintersList = window.localStorage.configuredPrintersData ? JSON.parse(window.localStorage.configuredPrintersData) : [];

        var g = 0;
        while (allConfiguredPrintersList[g]) {

            if (allConfiguredPrintersList[g].type == 'KOT') {
                for (var a = 0; a < allConfiguredPrintersList[g].list.length; a++) {
                    if (allConfiguredPrintersList[g].list[a].name == default_set_KOT_printer) {
                        default_set_KOT_printer_data = allConfiguredPrintersList[g].list[a];
                    } else if (only_KOT_printer == null) {
                        only_KOT_printer = allConfiguredPrintersList[g].list[a];
                    }
                }

                break;
            }

            g++;
        }
    }

    if (default_set_KOT_printer_data == null) {
        default_set_KOT_printer_data = only_KOT_printer;
    }


    if (isKOTRelayingEnabled) {

        showPrintingAnimation();

        var relayRuleList = window.localStorage.custom_kot_relays ? JSON.parse(window.localStorage.custom_kot_relays) : [];
        var relaySkippedItems = [];

        populateRelayRules();

        function populateRelayRules() {
            var n = 0;
            while (relayRuleList[n]) {

                relayRuleList[n].subcart = [];

                for (var i = 0; i < obj.cart.length; i++) {
                    if (obj.cart[i].category == relayRuleList[n].name && relayRuleList[n].printer != '') {
                        relayRuleList[n].subcart.push(obj.cart[i]);
                    }
                }

                if (n == relayRuleList.length - 1) {
                    generateRelaySkippedItems();
                }

                n++;
            }

            if (relayRuleList.length == 0) {
                generateRelaySkippedItems();
            }
        }

        function generateRelaySkippedItems() {
            var m = 0;
            while (obj.cart[m]) {

                if (relayRuleList.length != 0) {
                    for (var i = 0; i < relayRuleList.length; i++) {
                        if (obj.cart[m].category == relayRuleList[i].name && relayRuleList[i].printer != '') {
                            //item found
                            break;
                        }

                        if (i == relayRuleList.length - 1) { //last iteration and item not found
                            relaySkippedItems.push(obj.cart[m])
                        }
                    }
                } else { //no relays set, skip all items
                    relaySkippedItems.push(obj.cart[m]);
                }

                if (m == obj.cart.length - 1) {

                    //Print Relay Skipped items (if exists)
                    var relay_skipped_obj = obj;
                    relay_skipped_obj.cart = relaySkippedItems;

                    if (relaySkippedItems.length > 0) {

                        var defaultKOTPrinter = window.localStorage.systemOptionsSettings_defaultKOTPrinter ? window.localStorage.systemOptionsSettings_defaultKOTPrinter : '';

                        if (defaultKOTPrinter == '') {
                            if (isKOTRelayingEnabledOnDefault) {
                                sendToPrinter(relay_skipped_obj, 'CANCELLED_KOT', default_set_KOT_printer_data);

                                printRelayedKOT(relayRuleList);
                            } else {
                                var preserved_order = obj;
                                preserved_order.cart = original_order_object_cart;
                                sendToPrinter(preserved_order, 'CANCELLED_KOT', default_set_KOT_printer_data);

                                printRelayedKOT(relayRuleList);
                            }
                        } else {

                            var allConfiguredPrintersList = window.localStorage.configuredPrintersData ? JSON.parse(window.localStorage.configuredPrintersData) : [];
                            var selected_printer = '';

                            var g = 0;
                            while (allConfiguredPrintersList[g]) {
                                if (allConfiguredPrintersList[g].type == 'KOT') {
                                    for (var a = 0; a < allConfiguredPrintersList[g].list.length; a++) {
                                        if (allConfiguredPrintersList[g].list[a].name == defaultKOTPrinter) {
                                            selected_printer = allConfiguredPrintersList[g].list[a];

                                            if (isKOTRelayingEnabledOnDefault) {
                                                sendToPrinter(relay_skipped_obj, 'CANCELLED_KOT', selected_printer);

                                                printRelayedKOT(relayRuleList);
                                            } else {
                                                var preserved_order = obj;
                                                preserved_order.cart = original_order_object_cart;
                                                sendToPrinter(preserved_order, 'CANCELLED_KOT', selected_printer);

                                                printRelayedKOT(relayRuleList);
                                            }

                                            break;
                                        }
                                    }
                                }


                                if (g == allConfiguredPrintersList.length - 1) {
                                    if (selected_printer == '') { //No printer found, print on default!
                                        if (isKOTRelayingEnabledOnDefault) {
                                            sendToPrinter(relay_skipped_obj, 'CANCELLED_KOT', default_set_KOT_printer_data);

                                            printRelayedKOT(relayRuleList);
                                        } else {
                                            var preserved_order = obj;
                                            preserved_order.cart = original_order_object_cart;
                                            sendToPrinter(preserved_order, 'CANCELLED_KOT', default_set_KOT_printer_data);

                                            printRelayedKOT(relayRuleList);
                                        }
                                    }
                                }

                                g++;
                            }
                        }
                    } else {
                        if (!isKOTRelayingEnabledOnDefault) {
                            var preserved_order = obj;
                            preserved_order.cart = original_order_object_cart;

                            sendToPrinter(preserved_order, 'CANCELLED_KOT', default_set_KOT_printer_data);

                            printRelayedKOT(relayRuleList);
                        } else {
                            printRelayedKOT(relayRuleList, 'NO_DELAY_PLEASE');
                        }
                    }



                }

                m++;
            }
        }

        function printRelayedKOT(relayedList, optionalRequest) {

            var allConfiguredPrintersList = window.localStorage.configuredPrintersData ? JSON.parse(window.localStorage.configuredPrintersData) : [];
            var g = 0;
            var allPrintersList = [];

            while (allConfiguredPrintersList[g]) {

                if (allConfiguredPrintersList[g].type == 'KOT') { //filter only KOT Printers
                    for (var a = 0; a < allConfiguredPrintersList[g].list.length; a++) {
                        allPrintersList.push({
                            "name": allConfiguredPrintersList[g].list[a].name,
                            "target": allConfiguredPrintersList[g].list[a].target,
                            "template": allConfiguredPrintersList[g].list[a]
                        });
                    }

                    //Start relay after some significant delay. 
                    //Printing of relay skipped items might not be completed yet...
                    if (optionalRequest == 'NO_DELAY_PLEASE') {
                        startRelayPrinting(0);
                    } else {
                        setTimeout(function() {
                            startRelayPrinting(0);
                        }, 3000);
                    }

                    break;
                }

                if (g == allConfiguredPrintersList.length - 1) {
                    if (optionalRequest == 'NO_DELAY_PLEASE') {
                        startRelayPrinting(0);
                    } else {
                        setTimeout(function() {
                            startRelayPrinting(0);
                        }, 3000);
                    }
                }

                g++;
            }



            function startRelayPrinting(index) {

                console.log('Relay Print - Round ' + index + ' on ' + allPrintersList[index].name);

                var relayedItems = [];
                for (var i = 0; i < relayedList.length; i++) {
                    if (relayedList[i].subcart.length > 0 && relayedList[i].printer == allPrintersList[index].name) {
                        relayedItems = relayedItems.concat(relayedList[i].subcart)
                    }

                    if (i == relayedList.length - 1) { //last iteration
                        if (relayedItems.length > 0) {
                            var relayedNewObj = obj;
                            relayedNewObj.cart = relayedItems;

                            sendToPrinter(relayedNewObj, 'CANCELLED_KOT', allPrintersList[index].template);

                            if (allPrintersList[index + 1]) {
                                //go to next after some delay
                                setTimeout(function() {
                                    startRelayPrinting(index + 1);
                                }, 3000);
                            } else {
                                finishPrintingAnimation();
                                
                                //Process Next Print 
                                setTimeout(function(){ initialiseProcessing(); }, 3000);
                            }
                        } else {
                            //There are no items to relay. Go to next.
                            if (allPrintersList[index + 1]) {
                                startRelayPrinting(index + 1);
                            } else {
                                finishPrintingAnimation();

                                //Process Next Print 
                                setTimeout(function(){ initialiseProcessing(); }, 3000);
                            }
                        }
                    }
                }
            }

        }
    } else { //no relay (normal case)

        var defaultKOTPrinter = window.localStorage.systemOptionsSettings_defaultKOTPrinter ? window.localStorage.systemOptionsSettings_defaultKOTPrinter : '';

        if (defaultKOTPrinter == '') {
            sendToPrinter(obj, 'CANCELLED_KOT');

            //Process Next Print 
            setTimeout(function(){ initialiseProcessing(); }, 3000);
        } else {

            var allConfiguredPrintersList = window.localStorage.configuredPrintersData ? JSON.parse(window.localStorage.configuredPrintersData) : [];
            var selected_printer = '';

            var g = 0;
            while (allConfiguredPrintersList[g]) {
                if (allConfiguredPrintersList[g].type == 'KOT') {
                    for (var a = 0; a < allConfiguredPrintersList[g].list.length; a++) {
                        if (allConfiguredPrintersList[g].list[a].name == defaultKOTPrinter) {
                            selected_printer = allConfiguredPrintersList[g].list[a];
                            sendToPrinter(obj, 'CANCELLED_KOT', selected_printer);

                            //Process Next Print 
                            setTimeout(function(){ initialiseProcessing(); }, 3000);

                            break;
                        }
                    }
                }


                if (g == allConfiguredPrintersList.length - 1) {
                    if (selected_printer == '') { //No printer found, print on default!
                        sendToPrinter(obj, 'CANCELLED_KOT');

                        //Process Next Print 
                        setTimeout(function(){ initialiseProcessing(); }, 3000);
                    }
                }

                g++;
            }
        }

    }  
}


function printEditedKOT(originalData, new_kot){

  var updatedGuestData = {
    "guestCount" : new_kot.guestCount,
    "customerName" : new_kot.customerName,
    "customerMobile" : new_kot.customerMobile
  }

  generateEditedKOT();

  var super_memory_id = new_kot._id;
  var super_memory_rev = new_kot._rev;
 

  /*Generate KOT for Editing Order */
  function generateEditedKOT(){

    var changed_cart_products = new_kot.cart;
    var original_cart_products = originalData.cart;


    //Check if Item Deleted or Count Decreased (only Admins can do this!)
    var hasRestrictedEdits = false;

    //Track changes in the KOT
    var comparisonResult = [];


    //Search for changes in the existing items
    checkForItemChanges(original_cart_products[0], 0);

    function checkForItemChanges(checkingItem, index){
      //Find each item in original cart in the changed cart
      var itemFound = false;
      for(var i = 0; i < changed_cart_products.length; i++){
        
        //same item found, check for its quantity and report changes
        if((checkingItem.code == changed_cart_products[i].code) && (checkingItem.cartIndex == changed_cart_products[i].cartIndex)){
          
          itemFound = true;

          //Change in Quantity
          if(changed_cart_products[i].qty > checkingItem.qty){ //qty increased
            //console.log(checkingItem.name+' x '+changed_cart_products[i].qty+' ('+(changed_cart_products[i].qty-checkingItem.qty)+' More)');
            
            var tempItem = changed_cart_products[i];
            tempItem.change = "QUANTITY_INCREASE";
            tempItem.oldValue = checkingItem.qty;
            if(changed_cart_products[i].comments != '' && checkingItem.comments != changed_cart_products[i].comments){
              tempItem.newComments = changed_cart_products[i].comments;
            }
            comparisonResult.push(tempItem);
          }
          else if(changed_cart_products[i].qty < checkingItem.qty){ //qty decreased
            //console.log(changed_cart_products[i].name+' x '+changed_cart_products[i].qty+' ('+(checkingItem.qty-changed_cart_products[i].qty)+' Less)');
            
            var tempItem = changed_cart_products[i];
            tempItem.change = "QUANTITY_DECREASE";
            tempItem.oldValue = checkingItem.qty;
            if(changed_cart_products[i].comments != '' && checkingItem.comments != changed_cart_products[i].comments){
              tempItem.newComments = changed_cart_products[i].comments;
            }
            comparisonResult.push(tempItem);

            hasRestrictedEdits = true;
          }
          else{ //same qty
            //console.log(checkingItem.name+' x '+checkingItem.qty);
          }

          break;
          
        }

        //Last iteration to find the item
        if(i == changed_cart_products.length-1){
          if(!itemFound){ //Item Deleted
              
              var tempItem = checkingItem;
              
              tempItem.change = "ITEM_DELETED";
              tempItem.oldValue = "";
              if(changed_cart_products[i].comments != '' && checkingItem.comments != changed_cart_products[i].comments){
                tempItem.newComments = changed_cart_products[i].comments;
              }
              comparisonResult.push(tempItem);

              hasRestrictedEdits = true;
          }
        }
      }

      if(original_cart_products[index+1]){
        checkForItemChanges(original_cart_products[index+1], index+1);
      }
      else{
        checkForNewItems();
      }

    } //end - function


    //Search for new additions to the Cart
    function checkForNewItems(){
      var j = 0;
      while(changed_cart_products[j]){

        for(var m = 0; m < original_cart_products.length; m++){
          //check if item is found, not found implies New Item!
          if((changed_cart_products[j].cartIndex == original_cart_products[m].cartIndex) && (changed_cart_products[j].code == original_cart_products[m].code)){
            //Item Found
            break;
          }

          //Last iteration to find the item
          if(m == original_cart_products.length-1){
            //console.log(changed_cart_products[j].name+' x '+changed_cart_products[j].qty+' (New)');
            
            var tempItem = changed_cart_products[j];
            tempItem.change = "NEW_ITEM";
            tempItem.oldValue = "";
            if(changed_cart_products[j].comments != ''){
              tempItem.newComments = changed_cart_products[j].comments;
            }
            
            comparisonResult.push(tempItem);
          }
        }

        //last iteration
        if(j == changed_cart_products.length - 1){

          //to add to error log, if it fails.
          var errorLogObj = {
            "table" : originalData.table,
            "staffName" : originalData.stewardName,
            "staffCode" : originalData.stewardCode,
            "machine": originalData.machineName
          }

          generateEditedKOTAfterProcess(originalData.KOTNumber, changed_cart_products, comparisonResult, hasRestrictedEdits, errorLogObj, updatedGuestData)
        } 

        j++;
      }
    }

  }




  function generateEditedKOTAfterProcess(kotID, newCart, compareObject, hasRestrictedEdits, errorLogObj, updatedGuestData){

      var isUserAnAdmin = false;

      //Set _id from Branch mentioned in Licence
      var accelerate_licencee_branch = window.localStorage.accelerate_licence_branch ? window.localStorage.accelerate_licence_branch : ''; 
      if(!accelerate_licencee_branch || accelerate_licencee_branch == ''){
        showToast('Invalid Licence Error: KOT can not be generated. Please contact Accelerate Support if problem persists.', '#e74c3c');
        return '';
      }

      var kot_request_data = accelerate_licencee_branch +"_KOT_"+ kotID;

      $.ajax({
        type: 'GET',
        url: COMMON_LOCAL_SERVER_IP+'/accelerate_kot/'+kot_request_data,
        timeout: 10000,
        success: function(data) {
          if(data._id != ""){

            var kot = data;

            //Updates the KOT
            kot.timeKOT = moment().format('HHmm');
            kot.cart = newCart;

            //Update guest data
            kot.guestCount = updatedGuestData.guestCount;
            kot.customerMobile = updatedGuestData.customerMobile;
            kot.customerName = updatedGuestData.customerName;


            /* RECALCULATE New Figures*/
            var subTotal = 0;
            var packagedSubTotal = 0;

            var n = 0;
            while(kot.cart[n]){
              subTotal = subTotal + kot.cart[n].qty * kot.cart[n].price;

              if(kot.cart[n].isPackaged){
                packagedSubTotal += kot.cart[n].qty * kot.cart[n].price;
              }

              n++;
            }



          /*Calculate Taxes and Other Charges*/
          var k = 0;
          if(kot.extras.length > 0){
              for(k = 0; k < kot.extras.length; k++){

                var tempExtraTotal = 0;

                if(kot.extras[k].isPackagedExcluded){
                    if(kot.extras[k].value != 0){
                      if(kot.extras[k].unit == 'PERCENTAGE'){
                        tempExtraTotal = (kot.extras[k].value * (subTotal - packagedSubTotal))/100;
                      }
                      else if(kot.extras[k].unit == 'FIXED'){
                        tempExtraTotal = kot.extras[k].value;
                      }
                    }
              }
              else{
                    if(kot.extras[k].value != 0){
                      if(kot.extras[k].unit == 'PERCENTAGE'){
                        tempExtraTotal = kot.extras[k].value * subTotal/100;
                      }
                      else if(kot.extras[k].unit == 'FIXED'){
                        tempExtraTotal = kot.extras[k].value;
                      }
                    }               
              }


                tempExtraTotal = Math.round(tempExtraTotal * 100) / 100;

                kot.extras[k] = {
                  "name": kot.extras[k].name,
                  "value": kot.extras[k].value,
                  "unit": kot.extras[k].unit,
                  "amount": tempExtraTotal,
                  "isPackagedExcluded": kot.extras[k].isPackagedExcluded
                };
              }
          }




            /*Calculate Discounts if Any*/     
            if(kot.discount){
                  var tempExtraTotal = 0;
                  if(kot.discount.value != 0){
                    if(kot.discount.unit == 'PERCENTAGE'){
                      tempExtraTotal = kot.discount.value * subTotal/100;
                    }
                    else if(kot.discount.unit == 'FIXED'){
                      tempExtraTotal = kot.discount.value;
                    }
                  }

                  tempExtraTotal = Math.round(tempExtraTotal * 100) / 100;

                  kot.discount.amount = tempExtraTotal;
            }


            /*Calculate Custom Extras if Any*/     
            if(kot.customExtras){
                  var tempExtraTotal = 0;
                  if(kot.customExtras.value != 0){
                    if(kot.customExtras.unit == 'PERCENTAGE'){
                      tempExtraTotal = kot.customExtras.value * subTotal/100;
                    }
                    else if(kot.customExtras.unit == 'FIXED'){
                      tempExtraTotal = kot.customExtras.value;
                    }
                  }

                  tempExtraTotal = Math.round(tempExtraTotal * 100) / 100;

                  kot.customExtras.amount = tempExtraTotal;
            }



                  //Update on Server
                  $.ajax({
                    type: 'PUT',
                    url: COMMON_LOCAL_SERVER_IP+'accelerate_kot/'+(kot._id)+'/',
                    data: JSON.stringify(kot),
                    contentType: "application/json",
                    dataType: 'json',
                    timeout: 10000,
                    success: function(data) {
                       
                          if(compareObject.length != 0){
                            sendKOTChangesToPrinterPreProcess(kot, compareObject);
                          }
                          else{
                            //Process Next Order 
                            setTimeout(function(){ initialiseProcessing(); }, 5000);
                          }

                          removeTapsOrderRequest(super_memory_id, super_memory_rev);

                          showToast('Changed KOT #'+kot.KOTNumber+' generated Successfully', '#27ae60');
                      
                    },
                    error: function(data) {
                        showToast('System Error: Unable to update the Order. Please contact Accelerate Support.', '#e74c3c');
                    
                        addToErrorLog(moment().format('hh:mm a'), 'ORDER', 'KOT_NOT_FOUND', kot_request_data, errorLogObj);
                        setTimeout(function(){ initialiseProcessing(); }, 5000);
                    }
                  });         

          }
          else{
            showToast('Not Found Error: #'+kotID+' not found on Server. Please contact Accelerate Support.', '#e74c3c');
          }
        },
        error: function(data) {
          showToast('System Error: Unable to read KOTs data. Please contact Accelerate Support.', '#e74c3c');
          
          addToErrorLog(moment().format('hh:mm a'), 'ORDER', 'KOT_NOT_FOUND', kot_request_data, errorLogObj);
          setTimeout(function(){ initialiseProcessing(); }, 5000);

        }
      }); 
  }



    function sendKOTChangesToPrinterPreProcess(kot, compareObject){

        var isKOTRelayingEnabled = window.localStorage.appOtherPreferences_KOTRelayEnabled ? (window.localStorage.appOtherPreferences_KOTRelayEnabled == 1 ? true : false) : false;
        var isKOTRelayingEnabledOnDefault = window.localStorage.appOtherPreferences_KOTRelayEnabledDefaultKOT ? (window.localStorage.appOtherPreferences_KOTRelayEnabledDefaultKOT == 1 ? true : false) : false;

        var default_set_KOT_printer = window.localStorage.systemOptionsSettings_defaultKOTPrinter ? window.localStorage.systemOptionsSettings_defaultKOTPrinter : '';
        var default_set_KOT_printer_data = null;
        var only_KOT_printer = null;


        findDefaultKOTPrinter();

        function findDefaultKOTPrinter() {

            var allConfiguredPrintersList = window.localStorage.configuredPrintersData ? JSON.parse(window.localStorage.configuredPrintersData) : [];

            var g = 0;
            while (allConfiguredPrintersList[g]) {

                if (allConfiguredPrintersList[g].type == 'KOT') {
                    for (var a = 0; a < allConfiguredPrintersList[g].list.length; a++) {
                        if (allConfiguredPrintersList[g].list[a].name == default_set_KOT_printer) {
                            default_set_KOT_printer_data = allConfiguredPrintersList[g].list[a];
                        } else if (only_KOT_printer == null) {
                            only_KOT_printer = allConfiguredPrintersList[g].list[a];
                        }
                    }

                    break;
                }

                g++;
            }
        }

        if (default_set_KOT_printer_data == null) {
            default_set_KOT_printer_data = only_KOT_printer;
        }


        if (isKOTRelayingEnabled) {

            showPrintingAnimation();

            var relayRuleList = window.localStorage.custom_kot_relays ? JSON.parse(window.localStorage.custom_kot_relays) : [];
            var relaySkippedItems = [];

            populateRelayRules();

            function populateRelayRules() {
                var n = 0;
                while (relayRuleList[n]) {

                    relayRuleList[n].subcart = [];

                    for (var i = 0; i < compareObject.length; i++) {
                        if (compareObject[i].category == relayRuleList[n].name && relayRuleList[n].printer != '') {
                            relayRuleList[n].subcart.push(compareObject[i]);
                        }
                    }

                    if (n == relayRuleList.length - 1) {
                        generateRelaySkippedItems();
                    }

                    n++;
                }

                if (relayRuleList.length == 0) {
                    generateRelaySkippedItems();
                }
            }

            function generateRelaySkippedItems() {
                var m = 0;
                while (compareObject[m]) {

                    if (relayRuleList.length != 0) {
                        for (var i = 0; i < relayRuleList.length; i++) {
                            if (compareObject[m].category == relayRuleList[i].name && relayRuleList[i].printer != '') {
                                //item found
                                break;
                            }

                            if (i == relayRuleList.length - 1) { //last iteration and item not found
                                relaySkippedItems.push(compareObject[m])
                            }
                        }
                    } else { //no relays set, skip all items
                        relaySkippedItems.push(compareObject[m]);
                    }

                    if (m == compareObject.length - 1) {

                        if (relaySkippedItems.length > 0) {
                            //Print skipped items (non-relayed items)
                            var defaultKOTPrinter = window.localStorage.systemOptionsSettings_defaultKOTPrinter ? window.localStorage.systemOptionsSettings_defaultKOTPrinter : '';

                            if (defaultKOTPrinter == '') {
                                sendKOTChangesToPrinter(kot, relaySkippedItems);
                                printRelayedKOT(relayRuleList);
                            } else {
                                var allConfiguredPrintersList = window.localStorage.configuredPrintersData ? JSON.parse(window.localStorage.configuredPrintersData) : [];
                                var selected_printer = '';

                                var g = 0;
                                while (allConfiguredPrintersList[g]) {
                                    if (allConfiguredPrintersList[g].type == 'KOT') {
                                        for (var a = 0; a < allConfiguredPrintersList[g].list.length; a++) {
                                            if (allConfiguredPrintersList[g].list[a].name == defaultKOTPrinter) {
                                                selected_printer = allConfiguredPrintersList[g].list[a];

                                                if (isKOTRelayingEnabledOnDefault) {
                                                    sendKOTChangesToPrinter(kot, relaySkippedItems, selected_printer);
                                                    printRelayedKOT(relayRuleList);
                                                } else {
                                                    sendKOTChangesToPrinter(kot, compareObject, selected_printer);
                                                    printRelayedKOT(relayRuleList);
                                                }

                                                break;
                                            }
                                        }
                                    }


                                    if (g == allConfiguredPrintersList.length - 1) {
                                        if (selected_printer == '') { //No printer found, print on default!
                                            if (isKOTRelayingEnabledOnDefault) {
                                                sendKOTChangesToPrinter(kot, relaySkippedItems, default_set_KOT_printer_data);
                                                printRelayedKOT(relayRuleList);
                                            } else {
                                                sendKOTChangesToPrinter(kot, compareObject, default_set_KOT_printer_data);
                                                printRelayedKOT(relayRuleList);
                                            }
                                        }
                                    }

                                    g++;
                                }
                            }

                        } else {
                            if (!isKOTRelayingEnabledOnDefault) {
                                sendKOTChangesToPrinter(kot, compareObject, default_set_KOT_printer_data);
                                printRelayedKOT(relayRuleList);
                            } else {
                                printRelayedKOT(relayRuleList, 'NO_DELAY_PLEASE');
                            }
                        }



                    }

                    m++;
                }
            }

            function printRelayedKOT(relayedList, optionalRequest) {

                var allConfiguredPrintersList = window.localStorage.configuredPrintersData ? JSON.parse(window.localStorage.configuredPrintersData) : [];
                var g = 0;
                var allPrintersList = [];

                while (allConfiguredPrintersList[g]) {

                    if (allConfiguredPrintersList[g].type == 'KOT') { //filter only KOT Printers
                        for (var a = 0; a < allConfiguredPrintersList[g].list.length; a++) {
                            allPrintersList.push({
                                "name": allConfiguredPrintersList[g].list[a].name,
                                "target": allConfiguredPrintersList[g].list[a].target,
                                "template": allConfiguredPrintersList[g].list[a]
                            });
                        }

                        //Start relay after some significant delay. 
                        //Printing of relay skipped items might not be completed yet...
                        if (optionalRequest == 'NO_DELAY_PLEASE') {
                            startRelayPrinting(0);
                        } else {
                            setTimeout(function() {
                                startRelayPrinting(0);
                            }, 3000);
                        }

                        break;
                    }

                    if (g == allConfiguredPrintersList.length - 1) {
                        if (optionalRequest == 'NO_DELAY_PLEASE') {
                            startRelayPrinting(0);
                        } else {
                            setTimeout(function() {
                                startRelayPrinting(0);
                            }, 3000);
                        }
                    }

                    g++;
                }

                function startRelayPrinting(index) {

                    console.log('Relay Print - Round ' + index + ' on ' + allPrintersList[index].name);

                    var relayedItems = [];
                    for (var i = 0; i < relayedList.length; i++) {
                        if (relayedList[i].subcart.length > 0 && relayedList[i].printer == allPrintersList[index].name) {
                            relayedItems = relayedItems.concat(relayedList[i].subcart)
                        }

                        if (i == relayedList.length - 1) { //last iteration
                            if (relayedItems.length > 0) {

                                sendKOTChangesToPrinter(kot, relayedItems, allPrintersList[index].template);

                                if (allPrintersList[index + 1]) {
                                    //go to next after some delay
                                    setTimeout(function() {
                                        startRelayPrinting(index + 1);
                                    }, 3000);
                                } else {
                                    finishPrintingAnimation();

                                    //Process Next Order 
                                    setTimeout(function(){ initialiseProcessing(); }, 3000);
                                }
                            } else {
                                //There are no items to relay. Go to next.
                                if (allPrintersList[index + 1]) {
                                    startRelayPrinting(index + 1);
                                } else {
                                    finishPrintingAnimation();

                                    //Process Next Order 
                                    setTimeout(function(){ initialiseProcessing(); }, 3000);
                                }
                            }
                        }
                    }
                }


            }
        } else { //no relay (normal case)

            var defaultKOTPrinter = window.localStorage.systemOptionsSettings_defaultKOTPrinter ? window.localStorage.systemOptionsSettings_defaultKOTPrinter : '';

            if (defaultKOTPrinter == '') {
                sendKOTChangesToPrinter(kot, compareObject);

                //Process Next Order 
                setTimeout(function(){ initialiseProcessing(); }, 3000);
            } else {
                var allConfiguredPrintersList = window.localStorage.configuredPrintersData ? JSON.parse(window.localStorage.configuredPrintersData) : [];
                var selected_printer = '';

                var g = 0;
                while (allConfiguredPrintersList[g]) {
                    if (allConfiguredPrintersList[g].type == 'KOT') {
                        for (var a = 0; a < allConfiguredPrintersList[g].list.length; a++) {
                            if (allConfiguredPrintersList[g].list[a].name == defaultKOTPrinter) {
                                selected_printer = allConfiguredPrintersList[g].list[a];
                                sendKOTChangesToPrinter(kot, compareObject, selected_printer);

                                //Process Next Order 
                                setTimeout(function(){ initialiseProcessing(); }, 3000);

                                break;
                            }
                        }
                    }


                    if (g == allConfiguredPrintersList.length - 1) {
                        if (selected_printer == '') { //No printer found, print on default!
                            sendKOTChangesToPrinter(kot, compareObject);

                            //Process Next Order 
                            setTimeout(function(){ initialiseProcessing(); }, 3000);
                        }
                    }

                    g++;
                }
            }

        }
    }


}

function refreshRecentOrdersStream(){

    var order_stream = window.localStorage.orderStream && window.localStorage.orderStream != '' ? JSON.parse(window.localStorage.orderStream) : [];

    if(order_stream.length == 1){
        document.getElementById("recentOrdersList").innerHTML = ''+
              '<tag class="recentOrderHead">RECENT ORDERS</tag>'+
              '<p class="lastOrder1"><b>'+order_stream[0].KOTNumber+'</b> '+ (order_stream[0].orderType == 'DINE' ? ('on Table <b>'+order_stream[0].table+'</b> by <tag class="stewardName">'+(order_stream[0].steward != '' ? order_stream[0].steward : 'Unknown')+'</tag>') : ('with #<b>'+order_stream[0].table+'</b> on <b class="stewardName">'+order_stream[0].orderModeName+'</b>') )+ ' <tag class="orderTime"> at '+order_stream[0].time+'</tag></p>';
    }
    else if(order_stream.length == 2){
        document.getElementById("recentOrdersList").innerHTML = ''+
              '<tag class="recentOrderHead">RECENT ORDERS</tag>'+
              '<p class="lastOrder1"><b>'+order_stream[1].KOTNumber+'</b> '+ (order_stream[1].orderType == 'DINE' ? ('on Table <b>'+order_stream[1].table+'</b> by <tag class="stewardName">'+(order_stream[1].steward != '' ? order_stream[1].steward : 'Unknown')+'</tag>') : ('with #<b>'+order_stream[1].table+'</b> on <b class="stewardName">'+order_stream[1].orderModeName+'</b>') )+ ' <tag class="orderTime"> at '+order_stream[1].time+'</tag></p>'+
              '<p class="lastOrder2"><b>'+order_stream[0].KOTNumber+'</b> '+ (order_stream[0].orderType == 'DINE' ? ('on Table <b>'+order_stream[0].table+'</b> by <tag class="stewardName">'+(order_stream[0].steward != '' ? order_stream[0].steward : 'Unknown')+'</tag>') : ('with #<b>'+order_stream[0].table+'</b> on <b class="stewardName">'+order_stream[0].orderModeName+'</b>') )+ ' <tag class="orderTime"> at '+order_stream[0].time+'</tag></p>';
    }
    else if(order_stream.length == 3){
        document.getElementById("recentOrdersList").innerHTML = ''+
              '<tag class="recentOrderHead">RECENT ORDERS</tag>'+
              '<p class="lastOrder1"><b>'+order_stream[2].KOTNumber+'</b> '+ (order_stream[2].orderType == 'DINE' ? ('on Table <b>'+order_stream[2].table+'</b> by <tag class="stewardName">'+(order_stream[2].steward != '' ? order_stream[2].steward : 'Unknown')+'</tag>') : ('with #<b>'+order_stream[2].table+'</b> on <b class="stewardName">'+order_stream[2].orderModeName+'</b>') )+ ' <tag class="orderTime"> at '+order_stream[2].time+'</tag></p>'+
              '<p class="lastOrder2"><b>'+order_stream[1].KOTNumber+'</b> '+ (order_stream[1].orderType == 'DINE' ? ('on Table <b>'+order_stream[1].table+'</b> by <tag class="stewardName">'+(order_stream[1].steward != '' ? order_stream[1].steward : 'Unknown')+'</tag>') : ('with #<b>'+order_stream[1].table+'</b> on <b class="stewardName">'+order_stream[1].orderModeName+'</b>') )+ ' <tag class="orderTime"> at '+order_stream[1].time+'</tag></p>'+
              '<p class="lastOrder3"><b>'+order_stream[0].KOTNumber+'</b> '+ (order_stream[0].orderType == 'DINE' ? ('on Table <b>'+order_stream[0].table+'</b> by <tag class="stewardName">'+(order_stream[0].steward != '' ? order_stream[0].steward : 'Unknown')+'</tag>') : ('with #<b>'+order_stream[0].table+'</b> on <b class="stewardName">'+order_stream[0].orderModeName+'</b>') )+ ' <tag class="orderTime"> at '+order_stream[0].time+'</tag></p>';
    }
    else{
        document.getElementById("recentOrdersList").innerHTML = '';
    }
}


function removeTapsOrderRequest(id, revID, optionalRequest){

        $.ajax({
          type: 'DELETE',
          url: COMMON_LOCAL_SERVER_IP+'/accelerate_taps_orders/'+id+'?rev='+revID,
          contentType: "application/json",
          dataType: 'json',
          timeout: 10000,
          success: function(data) {     
            if(optionalRequest == 'RENDER_ERROR_LOG'){
              renderErrorsLogCount();
            }              
          },
          error: function(data) {
            showToast('Server Warning: Unable to modify Taps Order. Please contact Accelerate Support.', '#e67e22');
          }
        });         
}


function removeKOTPrintRequest(id, revID, paramsObj){

        $.ajax({
          type: 'DELETE',
          url: COMMON_LOCAL_SERVER_IP+'/accelerate_kot_print_requests/'+id+'?rev='+revID,
          contentType: "application/json",
          dataType: 'json',
          timeout: 10000,
          success: function(data) {

          },
          error: function(data) {
            showToast('Server Warning: Unable to modify Print Request. Please contact Accelerate Support.', '#e67e22');
            
            //Add to Error Log
            addToErrorLog(moment().format('hh:mm a'), 'PRINT', 'REQUEST_DELETE_FAILED', paramsObj.KOT, paramsObj);
          }
        });         
}



function addToTableMapping(tableID, kotID, assignedTo){

    var today = new Date();
    var hour = today.getHours();
    var mins = today.getMinutes();

    if(hour<10) {
        hour = '0'+hour;
    } 

    if(mins<10) {
        mins = '0'+mins;
    }

    $.ajax({
      type: 'GET',
      url: COMMON_LOCAL_SERVER_IP+'/accelerate_tables/_design/filter-tables/_view/filterbyname?startkey=["'+tableID+'"]&endkey=["'+tableID+'"]',
      timeout: 10000,
      success: function(data) {
        if(data.rows.length == 1){

              var tableData = data.rows[0].value;

              var remember_id = null;
              var remember_rev = null;

              if(tableData.table == tableID){

                remember_id = tableData._id;
                remember_rev = tableData._rev;

                if(tableData.status != 0 && tableData.status != 5){
                  showToast('Warning: Table #'+tableID+' was not free. But Order is punched.', '#e67e22');
                }
                else{
                  tableData.assigned = assignedTo;
                  tableData.remarks = "";
                  tableData.KOT = kotID;
                  tableData.status = 1;
                  tableData.lastUpdate = hour+''+mins;  
                }            


                    //Update
                    $.ajax({
                      type: 'PUT',
                      url: COMMON_LOCAL_SERVER_IP+'accelerate_tables/'+remember_id+'/',
                      data: JSON.stringify(tableData),
                      contentType: "application/json",
                      dataType: 'json',
                      timeout: 10000,
                      success: function(data) {
                        
                      },
                      error: function(data) {
                        showToast('System Error: Unable to update Tables data. Please contact Accelerate Support.', '#e74c3c');
                      }
                    });   

              }
              else{
                showToast('Not Found Error: Tables data not found. Please contact Accelerate Support.', '#e74c3c');
              }
        }
        else{
          showToast('Not Found Error: Tables data not found. Please contact Accelerate Support.', '#e74c3c');
        }

      },
      error: function(data) {
        showToast('System Error: Unable to read Tables data. Please contact Accelerate Support.', '#e74c3c');
      }

    });
}



function printFreshKOT(new_kot, optionalActionRequest){

           var obj = new_kot;

           var super_memory_id = obj._id;
           var super_memory_rev = obj._rev;

           delete obj._rev;

           var original_order_object_cart = obj.cart;

        
          //Acquire a new KOT Number
          $.ajax({
            type: 'GET',
            url: COMMON_LOCAL_SERVER_IP+'/accelerate_settings/ACCELERATE_KOT_INDEX',
            contentType: "application/json",
            dataType: 'json',
            timeout: 10000,
            success: function(data) {

                var num = parseInt(data.value) + 1;
                var kot = 'K' + num;

                //assigning KOT number
                obj.KOTNumber = kot;
                var memory_revID = data._rev;


                      //Set _id from Branch mentioned in Licence
                      var accelerate_licencee_branch = window.localStorage.accelerate_licence_branch ? window.localStorage.accelerate_licence_branch : ''; 
                      if(!accelerate_licencee_branch || accelerate_licencee_branch == ''){
                        showToast('Invalid Licence Error: KOT can not be generated. Please contact Accelerate Support if problem persists.', '#e74c3c');
                        return '';
                      }

                      obj._id = accelerate_licencee_branch+'_KOT_'+kot;
                    

                      var remember_obj = '';
                      

                      //Post to local Server
                      $.ajax({
                        type: 'POST',
                        url: COMMON_LOCAL_SERVER_IP+'/accelerate_kot/',
                        data: JSON.stringify(obj),
                        contentType: "application/json",
                        dataType: 'json',
                        timeout: 10000,
                        success: function(data) {
                          if(data.ok){

                            showToast('KOT #'+num+' generated Successfully', '#27ae60');

                            if(optionalActionRequest == 'REQUEST_AUTO_BILL_GENERATION'){

                                //AUTO BILL GENERATION (for swiggy, zomato orders)
                                var actionObject = {
                                    "_id": "PRINT_BILL_"+obj._id,
                                    "KOT": obj._id,
                                    "action": "PRINT_BILL",
                                    "table": obj.table,
                                    "staffName": "Unknown",
                                    "staffCode": "Unknown",
                                    "machine": "Automatic",
                                    "time": moment().format('HHmm'),
                                    "date": moment().format('DD-MM-YYYY')
                                }

                                postActionRequest(actionObject);


                                function postActionRequest(actionObject){
                                    //Post to local Server
                                    $.ajax({
                                      type: 'POST',
                                      url: COMMON_LOCAL_SERVER_IP+'/accelerate_action_requests/',
                                      data: JSON.stringify(actionObject),
                                      contentType: "application/json",
                                      dataType: 'json',
                                      timeout: 10000,
                                      success: function(data) {
                                        if(data.ok){

                                        }

                                      },
                                      error: function(data) {

                                      }
                                    });
                                }
                            }


                            //Add to table maping
                            if(obj.orderDetails.modeType == 'DINE'){
                              addToTableMapping(obj.table, kot, obj.stewardName);
                            }

                            //Render order stream
                            var order_stream = window.localStorage.orderStream && window.localStorage.orderStream != '' ? JSON.parse(window.localStorage.orderStream) : [];

                            if(order_stream.length < 3){
                                order_stream.push({
                                    "KOTNumber" : new_kot.KOTNumber,
                                    "orderType" : new_kot.orderDetails.modeType,
                                    "orderModeName" : new_kot.orderDetails.mode,
                                    "table": new_kot.table,
                                    "steward": new_kot.stewardName,
                                    "time": new_kot.timeKOT != '' ? moment(new_kot.timeKOT, 'HHmm').format('hh:mm a') : moment(new_kot.timePunch, 'HHmm').format('hh:mm A')
                                });
                                window.localStorage.orderStream = JSON.stringify(order_stream);
                            }
                            else{
                                order_stream.push({
                                    "KOTNumber" : new_kot.KOTNumber,
                                    "orderType" : new_kot.orderDetails.modeType,
                                    "orderModeName" : new_kot.orderDetails.mode,
                                    "table": new_kot.table,
                                    "steward": new_kot.stewardName,
                                    "time": new_kot.timeKOT != '' ?  moment(new_kot.timeKOT, 'HHmm').format('hh:mm a') : moment(new_kot.timePunch, 'HHmm').format('hh:mm A')
                                });

                                var new_stream = order_stream.slice(1, 4);
                                window.localStorage.orderStream = JSON.stringify(new_stream);
                            }


                            refreshRecentOrdersStream();
                            initialiseKOTPrinting();
                            removeTapsOrderRequest(super_memory_id, super_memory_rev);

                          }
                        },
                        error: function(data) {
                            showToast('System Error: Unable to update KOT Index. Please contact Accelerate Support.', '#e74c3c');

                            //Add to Error Log
                            addToErrorLog(moment().format('hh:mm a'), 'ORDER', 'SYSTEM_KOT_ERROR', '', '');  

                            //Process Next Order 
                            setTimeout(function(){ initialiseProcessing(); }, 3000);    
                        }
                      });



                          //Update KOT number on server
                          var updateData = {
                            "_rev": memory_revID,
                            "identifierTag": "ACCELERATE_KOT_INDEX",
                            "value": num
                          }

                          $.ajax({
                            type: 'PUT',
                            url: COMMON_LOCAL_SERVER_IP+'accelerate_settings/ACCELERATE_KOT_INDEX/',
                            data: JSON.stringify(updateData),
                            contentType: "application/json",
                            dataType: 'json',
                            timeout: 10000,
                            success: function(data) {
                              
                            },
                            error: function(data) {
                              showToast('System Error: Unable to update KOT Index. Please contact Accelerate Support.', '#e74c3c');     
                            }
                          });
            
            },
            error: function(data){
                showToast('Unable to assign KOT Number. Please try again.', '#e74c3c');
            
                //Add to Error Log
                addToErrorLog(moment().format('hh:mm a'), 'ORDER', 'SYSTEM_KOT_ERROR', '', '');  
                
                //Process Next Order 
                setTimeout(function(){ initialiseProcessing(); }, 3000);    
            }
        });






              //Send KOT for Printing
              function initialiseKOTPrinting(){
                            
                    //Do not run if locked 
                    if ($('#applicationErrorLock').is(':visible')) {
                        return '';
                    } else if ($('#serverErrorLock').is(':visible')) {
                        return '';
                    }

                    var isKOTRelayingEnabled = window.localStorage.appOtherPreferences_KOTRelayEnabled ? (window.localStorage.appOtherPreferences_KOTRelayEnabled == 1 ? true : false) : false;
                    var isKOTRelayingEnabledOnDefault = window.localStorage.appOtherPreferences_KOTRelayEnabledDefaultKOT ? (window.localStorage.appOtherPreferences_KOTRelayEnabledDefaultKOT == 1 ? true : false) : false;

                    var default_set_KOT_printer = window.localStorage.systemOptionsSettings_defaultKOTPrinter ? window.localStorage.systemOptionsSettings_defaultKOTPrinter : '';
                    var default_set_KOT_printer_data = null;
                    var only_KOT_printer = null;


                    findDefaultKOTPrinter();

                    function findDefaultKOTPrinter() {

                        var allConfiguredPrintersList = window.localStorage.configuredPrintersData ? JSON.parse(window.localStorage.configuredPrintersData) : [];

                        var g = 0;
                        while (allConfiguredPrintersList[g]) {

                            if (allConfiguredPrintersList[g].type == 'KOT') {
                                for (var a = 0; a < allConfiguredPrintersList[g].list.length; a++) {
                                    if (allConfiguredPrintersList[g].list[a].name == default_set_KOT_printer) {
                                        default_set_KOT_printer_data = allConfiguredPrintersList[g].list[a];
                                    } else if (only_KOT_printer == null) {
                                        only_KOT_printer = allConfiguredPrintersList[g].list[a];
                                    }
                                }

                                break;
                            }

                            g++;
                        }
                    }

                    if (default_set_KOT_printer_data == null) {
                        default_set_KOT_printer_data = only_KOT_printer;
                    }


                    if (isKOTRelayingEnabled) {

                        showPrintingAnimation();

                        var relayRuleList = window.localStorage.custom_kot_relays ? JSON.parse(window.localStorage.custom_kot_relays) : [];
                        var relaySkippedItems = [];

                        populateRelayRules();

                        function populateRelayRules() {
                            var n = 0;
                            while (relayRuleList[n]) {

                                relayRuleList[n].subcart = [];

                                for (var i = 0; i < obj.cart.length; i++) {
                                    if (obj.cart[i].category == relayRuleList[n].name && relayRuleList[n].printer != '') {
                                        relayRuleList[n].subcart.push(obj.cart[i]);
                                    }
                                }

                                if (n == relayRuleList.length - 1) {
                                    generateRelaySkippedItems();
                                }

                                n++;
                            }

                            if (relayRuleList.length == 0) {
                                generateRelaySkippedItems();
                            }
                        }

                        function generateRelaySkippedItems() {
                            var m = 0;
                            while (obj.cart[m]) {

                                if (relayRuleList.length != 0) {
                                    for (var i = 0; i < relayRuleList.length; i++) {
                                        if (obj.cart[m].category == relayRuleList[i].name && relayRuleList[i].printer != '') {
                                            //item found
                                            break;
                                        }

                                        if (i == relayRuleList.length - 1) { //last iteration and item not found
                                            relaySkippedItems.push(obj.cart[m])
                                        }
                                    }
                                } else { //no relays set, skip all items
                                    relaySkippedItems.push(obj.cart[m]);
                                }

                                if (m == obj.cart.length - 1) { //last iteration

                                    //Print Relay Skipped items (if exists)
                                    var relay_skipped_obj = obj;
                                    relay_skipped_obj.cart = relaySkippedItems;

                                    if (relaySkippedItems.length > 0) {

                                        var defaultKOTPrinter = window.localStorage.systemOptionsSettings_defaultKOTPrinter ? window.localStorage.systemOptionsSettings_defaultKOTPrinter : '';

                                        if (defaultKOTPrinter == '') {
                                            if (isKOTRelayingEnabledOnDefault) { //relay KOT on default printer as well. otherwise, complete order will be printed on default printer.
                                                sendToPrinter(relay_skipped_obj, 'KOT', default_set_KOT_printer_data);

                                                printRelayedKOT(relayRuleList);
                                            } else {
                                                var preserved_order = obj;
                                                preserved_order.cart = original_order_object_cart;

                                                sendToPrinter(preserved_order, 'KOT', default_set_KOT_printer_data);

                                                printRelayedKOT(relayRuleList);
                                            }
                                        } else {
                                            var allConfiguredPrintersList = window.localStorage.configuredPrintersData ? JSON.parse(window.localStorage.configuredPrintersData) : [];
                                            var selected_printer = '';

                                            var g = 0;
                                            while (allConfiguredPrintersList[g]) {
                                                if (allConfiguredPrintersList[g].type == 'KOT') {
                                                    for (var a = 0; a < allConfiguredPrintersList[g].list.length; a++) {
                                                        if (allConfiguredPrintersList[g].list[a].name == defaultKOTPrinter) {
                                                            selected_printer = allConfiguredPrintersList[g].list[a];

                                                            if (isKOTRelayingEnabledOnDefault) {
                                                                sendToPrinter(relay_skipped_obj, 'KOT', selected_printer);

                                                                printRelayedKOT(relayRuleList);
                                                            } else {

                                                                var preserved_order = obj;
                                                                preserved_order.cart = original_order_object_cart;

                                                                sendToPrinter(preserved_order, 'KOT', selected_printer);

                                                                printRelayedKOT(relayRuleList);
                                                            }

                                                            break;
                                                        }
                                                    }
                                                }


                                                if (g == allConfiguredPrintersList.length - 1) {
                                                    if (selected_printer == '') { //No printer found, print on default!
                                                        if (isKOTRelayingEnabledOnDefault) {
                                                            sendToPrinter(relay_skipped_obj, 'KOT', default_set_KOT_printer_data);

                                                            printRelayedKOT(relayRuleList);
                                                        } else {
                                                            var preserved_order = obj;
                                                            preserved_order.cart = original_order_object_cart;

                                                            sendToPrinter(preserved_order, 'KOT', default_set_KOT_printer_data);

                                                            printRelayedKOT(relayRuleList);
                                                        }
                                                    }
                                                }

                                                g++;
                                            }
                                        }
                                    } else {
                                        if (!isKOTRelayingEnabledOnDefault) {
                                            var preserved_order = obj;
                                            preserved_order.cart = original_order_object_cart;

                                            sendToPrinter(preserved_order, 'KOT', default_set_KOT_printer_data);
                                            printRelayedKOT(relayRuleList);
                                        } else {
                                            printRelayedKOT(relayRuleList, 'NO_DELAY_PLEASE');
                                        }
                                    }

                                }

                                m++;
                            }
                        }

                        function printRelayedKOT(relayedList, optionalRequest) {

                            var allConfiguredPrintersList = window.localStorage.configuredPrintersData ? JSON.parse(window.localStorage.configuredPrintersData) : [];
                            var g = 0;
                            var allPrintersList = [];

                            while (allConfiguredPrintersList[g]) {

                                if (allConfiguredPrintersList[g].type == 'KOT') { //filter only KOT Printers
                                    for (var a = 0; a < allConfiguredPrintersList[g].list.length; a++) {
                                        allPrintersList.push({
                                            "name": allConfiguredPrintersList[g].list[a].name,
                                            "target": allConfiguredPrintersList[g].list[a].target,
                                            "template": allConfiguredPrintersList[g].list[a]
                                        });
                                    }

                                    //Start relay after some significant delay. 
                                    //Printing of relay skipped items might not be completed yet...
                                    if (optionalRequest == 'NO_DELAY_PLEASE') {
                                        startRelayPrinting(0);
                                    } else {
                                        setTimeout(function() {
                                            startRelayPrinting(0);
                                        }, 3000);
                                    }

                                    break;
                                }

                                if (g == allConfiguredPrintersList.length - 1) {
                                    if (optionalRequest == 'NO_DELAY_PLEASE') {
                                        startRelayPrinting(0);
                                    } else {
                                        setTimeout(function() {
                                            startRelayPrinting(0);
                                        }, 3000);
                                    }
                                }

                                g++;
                            }


                            function startRelayPrinting(index) {

                                console.log('Relay Print - Round ' + index + ' on ' + allPrintersList[index].name);

                                var relayedItems = [];
                                for (var i = 0; i < relayedList.length; i++) {
                                    if (relayedList[i].subcart.length > 0 && relayedList[i].printer == allPrintersList[index].name) {
                                        relayedItems = relayedItems.concat(relayedList[i].subcart)
                                    }

                                    if (i == relayedList.length - 1) { //last iteration
                                        if (relayedItems.length > 0) {
                                            var relayedNewObj = obj;
                                            relayedNewObj.cart = relayedItems;

                                            sendToPrinter(relayedNewObj, 'KOT', allPrintersList[index].template);

                                            if (allPrintersList[index + 1]) {
                                                //go to next after some delay
                                                setTimeout(function() {
                                                    startRelayPrinting(index + 1);
                                                }, 3000);
                                            } else {
                                                finishPrintingAnimation();

                                                //Process Next Order 
                                                setTimeout(function(){ initialiseProcessing(); }, 3000);
                                            }
                                        } else {
                                            //There are no items to relay. Go to next.
                                            if (allPrintersList[index + 1]) {
                                                startRelayPrinting(index + 1);
                                            } else {
                                                finishPrintingAnimation();
                                                
                                                //Process Next Order 
                                                setTimeout(function(){ initialiseProcessing(); }, 3000);
                                            }
                                        }
                                    }
                                }
                            }

                        }
                    } else { //no relay (normal case)

                        var defaultKOTPrinter = window.localStorage.systemOptionsSettings_defaultKOTPrinter ? window.localStorage.systemOptionsSettings_defaultKOTPrinter : '';

                        if (defaultKOTPrinter == '') {
                            sendToPrinter(obj, 'KOT');

                            //Process Next Order 
                            setTimeout(function(){ initialiseProcessing(); }, 3000);
                        } else {
                            var allConfiguredPrintersList = window.localStorage.configuredPrintersData ? JSON.parse(window.localStorage.configuredPrintersData) : [];
                            var selected_printer = '';

                            var g = 0;
                            while (allConfiguredPrintersList[g]) {
                                if (allConfiguredPrintersList[g].type == 'KOT') {
                                    for (var a = 0; a < allConfiguredPrintersList[g].list.length; a++) {
                                        if (allConfiguredPrintersList[g].list[a].name == defaultKOTPrinter) {
                                            selected_printer = allConfiguredPrintersList[g].list[a];
                                            sendToPrinter(obj, 'KOT', selected_printer);

                                            //Process Next Order 
                                            setTimeout(function(){ initialiseProcessing(); }, 3000);
                                            
                                            break;
                                        }
                                    }
                                }


                                if (g == allConfiguredPrintersList.length - 1) {
                                    if (selected_printer == '') { //No printer found, print on default!
                                        sendToPrinter(obj, 'KOT');

                                        //Process Next Order 
                                        setTimeout(function(){ initialiseProcessing(); }, 3000);

                                    }
                                }

                                g++;
                            }
                        }

                    }

              } //end - initialise KOT Prints
}

/* Printing Progress */
function showPrintingAnimation(text){

  document.getElementById("generalPrintingProgressModal").style.display = 'block';
  document.getElementById("printingProgressIcon").innerHTML = '<img src="assets/images/loading_oval.svg" class="printerLoadingIcon">';
  $('#generalPrintingProgressModal').removeClass('fade_background'); 

  if(!text || text == ''){
    document.getElementById("generalPrintingProgressText").innerHTML = 'Printing in Progress';
  }
  else{
    document.getElementById("generalPrintingProgressText").innerHTML = text;
  }
}

function finishPrintingAnimation(){

  document.getElementById("printingProgressIcon").innerHTML = '<img src="assets/images/flowery_done.png" class="printerLoadingDoneIcon">';
  $('#printingProgressIcon').addClass('quick_flash');
  

  setTimeout(function(){
    $('#generalPrintingProgressModal').addClass('fade_background'); 
    
    setTimeout(function(){
      hidePrintingAnimation();
    }, 1000);
  }, 1000);

  document.getElementById("generalPrintingProgressText").innerHTML = '';
}

function hidePrintingAnimation(){
  document.getElementById("generalPrintingProgressModal").style.display = 'none';
  document.getElementById("generalPrintingProgressText").innerHTML = '';
}


/* Duplicate KOT (Taps Order) */
function printDuplicateTapsKOT(data, requestData){

                    var obj = data;
                    var original_order_object_cart = obj.cart;
                    
                    var isKOTRelayingEnabled = window.localStorage.appOtherPreferences_KOTRelayEnabled ? (window.localStorage.appOtherPreferences_KOTRelayEnabled == 1 ? true : false) : false;
                    var isKOTRelayingEnabledOnDefault = window.localStorage.appOtherPreferences_KOTRelayEnabledDefaultKOT ? (window.localStorage.appOtherPreferences_KOTRelayEnabledDefaultKOT == 1 ? true : false) : false;

                        var default_set_KOT_printer = window.localStorage.systemOptionsSettings_defaultKOTPrinter ? window.localStorage.systemOptionsSettings_defaultKOTPrinter : '';
                        var default_set_KOT_printer_data = null;
                        var only_KOT_printer = null;


                        findDefaultKOTPrinter();

                        function findDefaultKOTPrinter(){

                              var allConfiguredPrintersList = window.localStorage.configuredPrintersData ? JSON.parse(window.localStorage.configuredPrintersData) : [];

                              var g = 0;
                              while(allConfiguredPrintersList[g]){

                                if(allConfiguredPrintersList[g].type == 'KOT'){
                                  for(var a = 0; a < allConfiguredPrintersList[g].list.length; a++){
                                      if(allConfiguredPrintersList[g].list[a].name == default_set_KOT_printer){
                                        default_set_KOT_printer_data = allConfiguredPrintersList[g].list[a];
                                      }
                                      else if(only_KOT_printer == null){
                                        only_KOT_printer = allConfiguredPrintersList[g].list[a];
                                      }
                                  }

                                  break;
                                }
                               
                                g++;
                              }
                        }

                        if(default_set_KOT_printer_data == null){
                          default_set_KOT_printer_data = only_KOT_printer;
                        }
                    



                    if(isKOTRelayingEnabled){

                      showPrintingAnimation();

                      var relayRuleList = window.localStorage.custom_kot_relays ? JSON.parse(window.localStorage.custom_kot_relays) : [];
                      var relaySkippedItems = [];

                      populateRelayRules();

                      function populateRelayRules(){
                        var n = 0;
                        while(relayRuleList[n]){

                          relayRuleList[n].subcart = [];

                          for(var i = 0; i < obj.cart.length; i++){
                            if(obj.cart[i].category == relayRuleList[n].name && relayRuleList[n].printer != ''){
                              relayRuleList[n].subcart.push(obj.cart[i]);
                            }
                          } 

                          if(n == relayRuleList.length - 1){
                            generateRelaySkippedItems();
                          }

                          n++;
                        }

                        if(relayRuleList.length == 0){
                          generateRelaySkippedItems();
                        }
                      }

                      function generateRelaySkippedItems(){
                        var m = 0;
                        while(obj.cart[m]){

                          if(relayRuleList.length != 0){
                            for(var i = 0; i < relayRuleList.length; i++){
                              if(obj.cart[m].category == relayRuleList[i].name && relayRuleList[i].printer != ''){
                                //item found
                                break;
                              }

                              if(i == relayRuleList.length - 1){ //last iteration and item not found
                                relaySkippedItems.push(obj.cart[m])
                              }
                            }
                          }
                          else{ //no relays set, skip all items
                            relaySkippedItems.push(obj.cart[m]);
                          } 

                          if(m == obj.cart.length - 1){

                            //Print Relay Skipped items (if exists)
                            var relay_skipped_obj = obj;
                            relay_skipped_obj.cart = relaySkippedItems;
                            
                            if(relaySkippedItems.length > 0){
                              
                                //sendToPrinter(relay_skipped_obj, 'DUPLICATE_KOT');

                                var defaultKOTPrinter = window.localStorage.systemOptionsSettings_defaultKOTPrinter ? window.localStorage.systemOptionsSettings_defaultKOTPrinter : '';
                                
                                if(defaultKOTPrinter == ''){
                                  sendToPrinter(relay_skipped_obj, 'DUPLICATE_KOT');
                                  if(isKOTRelayingEnabledOnDefault){
                                      sendToPrinter(relay_skipped_obj, 'DUPLICATE_KOT', default_set_KOT_printer_data);
                                  
                                      printRelayedKOT(relayRuleList); 
                                  }
                                  else{
                                      var preserved_order = obj;
                                      preserved_order.cart = original_order_object_cart;
                                      sendToPrinter(preserved_order, 'DUPLICATE_KOT', default_set_KOT_printer_data);
                                  
                                      printRelayedKOT(relayRuleList); 
                                  }

                                }
                                else{
                                      
                                      var allConfiguredPrintersList = window.localStorage.configuredPrintersData ? JSON.parse(window.localStorage.configuredPrintersData) : [];
                                      var selected_printer = '';

                                      var g = 0;
                                      while(allConfiguredPrintersList[g]){
                                        if(allConfiguredPrintersList[g].type == 'KOT'){
                                      for(var a = 0; a < allConfiguredPrintersList[g].list.length; a++){
                                            if(allConfiguredPrintersList[g].list[a].name == defaultKOTPrinter){
                                              selected_printer = allConfiguredPrintersList[g].list[a];
                                              
                                              if(isKOTRelayingEnabledOnDefault){
                                                sendToPrinter(relay_skipped_obj, 'DUPLICATE_KOT', default_set_KOT_printer_data);
                                              
                                                printRelayedKOT(relayRuleList); 
                                              }
                                              else{
                                                var preserved_order = obj;
                                                preserved_order.cart = original_order_object_cart;
                                                sendToPrinter(preserved_order, 'DUPLICATE_KOT', default_set_KOT_printer_data);
                                              
                                                printRelayedKOT(relayRuleList); 
                                              }

                                              break;
                                            }
                                        }
                                        }
                                        

                                        if(g == allConfiguredPrintersList.length - 1){
                                          if(selected_printer == ''){ //No printer found, print on default!
                                              if(isKOTRelayingEnabledOnDefault){
                                                sendToPrinter(relay_skipped_obj, 'DUPLICATE_KOT', default_set_KOT_printer_data);
                                              
                                                printRelayedKOT(relayRuleList); 
                                              }
                                              else{
                                                var preserved_order = obj;
                                                preserved_order.cart = original_order_object_cart;
                                                sendToPrinter(preserved_order, 'DUPLICATE_KOT', default_set_KOT_printer_data);
                                              
                                                printRelayedKOT(relayRuleList); 
                                              }
                                          }
                                        }
                                        
                                        g++;
                                      }
                                }                                
                            }
                            else{
                              if(!isKOTRelayingEnabledOnDefault){
                                var preserved_order = obj;
                                preserved_order.cart = original_order_object_cart;

                                sendToPrinter(preserved_order, 'DUPLICATE_KOT', default_set_KOT_printer_data);
                              
                                printRelayedKOT(relayRuleList); 
                              } 
                              else{
                                printRelayedKOT(relayRuleList, 'NO_DELAY_PLEASE'); 
                              }
                            }

                            
                            
                          }

                          m++;
                        }
                      }

                      function printRelayedKOT(relayedList, optionalRequest){

                        var allConfiguredPrintersList = window.localStorage.configuredPrintersData ? JSON.parse(window.localStorage.configuredPrintersData) : [];
                        var g = 0;
                        var allPrintersList = [];

                        while(allConfiguredPrintersList[g]){

                            if(allConfiguredPrintersList[g].type == 'KOT'){ //filter only KOT Printers
                                for(var a = 0; a < allConfiguredPrintersList[g].list.length; a++){
                                    allPrintersList.push({
                                      "name": allConfiguredPrintersList[g].list[a].name,
                                      "target": allConfiguredPrintersList[g].list[a].target,
                                      "template": allConfiguredPrintersList[g].list[a]
                                    });
                                }

                                //Start relay after some significant delay. 
                                //Printing of relay skipped items might not be completed yet...
                                if(optionalRequest == 'NO_DELAY_PLEASE'){
                                    startRelayPrinting(0);
                                }
                                else{
                                  setTimeout(function(){ 
                                     startRelayPrinting(0);
                                  }, 3000);
                                }

                            break;
                          }

                            if(g == allConfiguredPrintersList.length - 1){
                                if(optionalRequest == 'NO_DELAY_PLEASE'){
                                      startRelayPrinting(0);
                                }
                                else{
                                    setTimeout(function(){ 
                                       startRelayPrinting(0);
                                    }, 3000);
                                }
                            }
                          
                            g++;
                        }


                        function startRelayPrinting(index){
                          
                          console.log('Relay Print - Round '+index+' on '+allPrintersList[index].name);
                          
                          var relayedItems = [];
                          for(var i = 0; i < relayedList.length; i++){
                            if(relayedList[i].subcart.length > 0 && relayedList[i].printer == allPrintersList[index].name){
                              relayedItems = relayedItems.concat(relayedList[i].subcart)  
                            }

                            if(i == relayedList.length - 1){ //last iteration
                              if(relayedItems.length > 0){
                                var relayedNewObj = obj;
                                relayedNewObj.cart = relayedItems;

                                sendToPrinter(relayedNewObj, 'DUPLICATE_KOT', allPrintersList[index].template);

                                if(allPrintersList[index+1]){
                                  //go to next after some delay
                                  setTimeout(function(){ 
                                    startRelayPrinting(index+1);
                                  }, 3000);
                                }
                                else{
                                  finishPrintingAnimation();
                                    
                                  //go starting again, after some cool off.
                                  setTimeout(function(){ initialiseProcessing(); }, 5000);
                                  
                                }
                              }
                              else{
                                //There are no items to relay. Go to next.
                                if(allPrintersList[index+1]){
                                  startRelayPrinting(index+1);
                                }
                                else{
                                  finishPrintingAnimation();
                                    
                                  //go starting again, after some cool off.
                                  setTimeout(function(){ initialiseProcessing(); }, 5000);
                                  
                                }
                              }
                            }
                          }
                        }
                        

                      }
                    }
                    else{ //no relay (normal case)
                      
                      var defaultKOTPrinter = window.localStorage.systemOptionsSettings_defaultKOTPrinter ? window.localStorage.systemOptionsSettings_defaultKOTPrinter : '';
                      
                      if(defaultKOTPrinter == ''){
                        sendToPrinter(obj, 'DUPLICATE_KOT');
                                    
                        //go starting again, after some cool off.
                        setTimeout(function(){ initialiseProcessing(); }, 5000);
                                  
                      }
                      else{
                            
                            var allConfiguredPrintersList = window.localStorage.configuredPrintersData ? JSON.parse(window.localStorage.configuredPrintersData) : [];
                            var selected_printer = '';

                            var g = 0;
                            while(allConfiguredPrintersList[g]){
                              if(allConfiguredPrintersList[g].type == 'KOT'){
                            for(var a = 0; a < allConfiguredPrintersList[g].list.length; a++){
                                  if(allConfiguredPrintersList[g].list[a].name == defaultKOTPrinter){
                                    selected_printer = allConfiguredPrintersList[g].list[a];
                                    sendToPrinter(obj, 'DUPLICATE_KOT', selected_printer);
                                    
                                    //go starting again, after some cool off.
                                    setTimeout(function(){ initialiseProcessing(); }, 5000);
                                  
                                    break;
                                  }
                              }
                              }
                              

                              if(g == allConfiguredPrintersList.length - 1){
                                if(selected_printer == ''){ //No printer found, print on default!
                                  sendToPrinter(obj, 'DUPLICATE_KOT');
                                    
                                  //go starting again, after some cool off.
                                  setTimeout(function(){ initialiseProcessing(); }, 5000);
                                  
                                }
                              }
                              
                              g++;
                            }
                      }
                        
                    }
}


/* Bill Generation */
function confirmBillGeneration(kotData, actionRequestObj){

  $.ajax({
    type: "POST",
    url:
      ACCELERON_SERVER_ENDPOINT + "/billing/generate-bill?kotnumber=" + kotData.KOTNumber,
    contentType: "application/json",
    dataType: "json",
    timeout: 10000,
    beforeSend: function (xhr) {
      xhr.setRequestHeader("x-access-token",ACCELERON_SERVER_ACCESS_TOKEN);
    },
    success: function (data) {
      billResponse = data.data;
      if (billResponse) {

        let billNumber = billResponse.newBillFile.KOTNumber;
        var newBillFile = billResponse.newBillFile;



        //PRINTING THE BILL
        var set_bill_printer = findDefaultPrinter(actionRequestObj.machine, 'BILL');


        if(set_bill_printer != ''){
            sendToPrinter(newBillFile, 'BILL', set_bill_printer);
        }
        else{
            sendToPrinter(newBillFile, 'BILL');
        }


        clearAllMetaDataOfBilling();
        hideBillPreviewModal();
        const modeType = billResponse.billingMode;

        var isRenderingTableOnRight = window.localStorage.appCustomSettings_OrderPageRightPanelDisplay && window.localStorage.appCustomSettings_OrderPageRightPanelDisplay == "TABLE";
        if (optionalPageRef == "ORDER_PUNCHING") {

            if (isRenderingTableOnRight && (billResponse.isTableSetFree || billResponse.isTableStatusUpdated)) {
                //re-render right panel tables
                renderTables();
            }

          renderCustomerInfo();
          if (modeType != "DINE") {
            //Pop up bill settlement window
            settleBillAndPush(
              encodeURI(JSON.stringify(billResponse.newBillFile)),
              "ORDER_PUNCHING"
            );
          }
        } else if (optionalPageRef == "SEATING_STATUS") {
          //Already handled inside billTableMapping() call
            preloadTableStatus();
        } else if (optionalPageRef == "LIVE_ORDERS") {
          //DINE case Already handled inside billTableMapping() call
            renderAllKOTs();
        }




        if (modeType != "DINE") {
          //Pop up bill settlement window
          settleBillAndPush(encodeURI(JSON.stringify(billResponse.newBillFile)), "ORDER_PUNCHING");
        }

      

        if (optionalPageRef == "LIVE_ORDERS") {
          renderAllKOTs();
        }

        //Update bill number on server
      } else {
        showToast("Warning: Bill was not Generated. Try again.", "#e67e22");
      }
    },
    error: function (data) {
        addToErrorLog(moment().format('hh:mm a'), 'REQUEST', 'SYSTEM_BILL_ERROR', actionRequestObj.KOT, actionRequestObj);      

        showToast(
          "System Error: Unable to generate the bill. Please contact Accelerate Support if problem persists.",
          "#e74c3c"
        );
    },
  });
}

function properRoundOff(amount){
  return Math.round(amount);
}


//Returns today, and current time
function getCurrentTime(type){
          
          var today = new Date();
          var time;
          var dd = today.getDate();
          var mm = today.getMonth()+1; //January is 0!
          var yyyy = today.getFullYear();
          var hour = today.getHours();
          var mins = today.getMinutes();

          if(dd<10) {
              dd = '0'+dd;
          } 

          if(mm<10) {
              mm = '0'+mm;
          } 

          if(hour<10) {
              hour = '0'+hour;
          } 

          if(mins<10) {
              mins = '0'+mins;
          }

          today = dd + '-' + mm + '-' + yyyy;
          time = hour + '' + mins;


    if(type == 'TIME'){
      return time;
    }

    if(type == 'DATE')
      return today;

    if(type == 'DATE_DDMMYY')
      return dd+''+mm+''+yyyy;

    if(type == 'DATE_DD-MM-YY')
      return dd+'-'+mm+'-'+yyyy;

    if(type == 'DATE_YYYY-MM-DD')
      return yyyy+'-'+mm+'-'+dd;

    if(type == 'DATE_STAMP')
      return yyyy+''+mm+''+dd;
   
}

function billTableMapping(tableID, billNumber, payableAmount, status){

  if(status != 1 && status != 2 && status != 3){
    showToast('Warning: Table #'+tableID+' was not mapped. But Bill is generated.', '#e67e22');
    return '';
  }

    var today = new Date();
    var hour = today.getHours();
    var mins = today.getMinutes();

    if(hour<10) {
      hour = '0'+hour;
    } 

    if(mins<10) {
        mins = '0'+mins;
    }


    $.ajax({
      type: 'GET',
      url: COMMON_LOCAL_SERVER_IP+'/accelerate_tables/_design/filter-tables/_view/filterbyname?startkey=["'+tableID+'"]&endkey=["'+tableID+'"]',
      timeout: 10000,
      success: function(data) {
        if(data.rows.length == 1){

              var tableData = data.rows[0].value;

              var remember_id = null;
              var remember_rev = null;

              if(tableData.table == tableID){

                remember_id = tableData._id;
                remember_rev = tableData._rev;

                tableData.remarks = payableAmount;
                tableData.KOT = billNumber;
                tableData.status = status;
                tableData.lastUpdate = hour+''+mins;            


                    //Update
                    $.ajax({
                      type: 'PUT',
                      url: COMMON_LOCAL_SERVER_IP+'accelerate_tables/'+remember_id+'/',
                      data: JSON.stringify(tableData),
                      contentType: "application/json",
                      dataType: 'json',
                      timeout: 10000,
                      success: function(data) {


                      },
                      error: function(data) {
                        showToast('System Error: Unable to update Tables data. Please contact Accelerate Support.', '#e74c3c');
                      }
                    });   

              }
              else{
                showToast('Not Found Error: Tables data not found. Please contact Accelerate Support.', '#e74c3c');
              }
        }
        else{
          showToast('Not Found Error: Tables data not found. Please contact Accelerate Support.', '#e74c3c');
        }

      },
      error: function(data) {
        showToast('System Error: Unable to read Tables data. Please contact Accelerate Support.', '#e74c3c');
      }

    });
}


function deleteKOTFromServer(id, revID){
    $.ajax({
      type: 'DELETE',
      url: COMMON_LOCAL_SERVER_IP+'/accelerate_kot/'+id+'?rev='+revID,
      contentType: "application/json",
      dataType: 'json',
      timeout: 10000,
      success: function(data) {

      },
      error: function(data) {
        showToast('Server Warning: Unable to modify Order KOT. Please contact Accelerate Support.', '#e67e22');
      }
    }); 
}



