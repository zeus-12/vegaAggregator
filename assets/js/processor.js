let PAUSE_FLAG = false;

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

/* 
  ERROR LOGGING
*/

function addToErrorLog(time, category, type, kot_id, optionalParametersObject){
  console.log(time, category, type, kot_id, optionalParametersObject)

  /*
    category --> REQUEST or ORDER
    type --> 'KOT_NOT_FOUND' etc.
    optionalParametersObject --> requestObject etc.
  */

  var log = window.localStorage.errorLog && window.localStorage.errorLog != "" ? JSON.parse(window.localStorage.errorLog) : [];

  //Check if already added.
  var n = 0;
  while(log[n]){
    if(category == "REQUEST"){
      if(log[n].parameters.action == optionalParametersObject.action && log[n].kotId == kot_id){
        return '';
      }
    }
    else if(category == "ORDER"){
      if(log[n].category == "ORDER" && log[n].type == "KOT_NOT_FOUND"){
        if(log[n].kotId == kot_id){
          return '';
        }
      }
      else if (log[n].category == "ORDER" && log[n].type == "SYSTEM_KOT_ERROR"){
        return '';
      }
    }
    else if(category == "PRINT"){
      console.log(time, category, type, kot_id, optionalParametersObject)
      if(log[n].parameters.action == optionalParametersObject.action && log[n].kotId == kot_id){
        return '';
      }
    }
    
    n++;
  }


  log.push({
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
          renderContent += '<tag class="errorListingItem"><time class="errorListingTime">'+log[n].time+' <span class="errorWarning">System has been failing to Punch Orders from mobile devices. <i class="fa fa-warning"></i></span></time><span class="systemError blink_me">SYSTEM ERROR</span> Fix KOT Index and try again. Contact Accelerate Support if problem persists. <tag class="errorListingOwner">by '+log[n].parameters.staffName+'</tag><tag onclick="restartProcessing()" class="errorListingFixButton">Try Now</tag></tag>';
        }
        else{
          renderContent += '<tag class="errorListingItem"><time class="errorListingTime">'+log[n].time+' on '+(log[n].parameters.machine != "" ? log[n].parameters.machine : 'Unknown Device')+'</time>Failed to edit the <b>Running Order</b> on Table #'+log[n].parameters.table+' <tag class="errorListingOwner">by '+log[n].parameters.staffName+'</tag><tag onclick="removeOrderRequest(\''+log[n].kotId+'\')" class="errorListingFixButton">Remove</tag></tag>';
        }
      }
      else if(log[n].category == 'REQUEST'){
        
        switch(log[n].parameters.action){
          case "PRINT_VIEW":{
            renderContent += '<tag class="errorListingItem"><time class="errorListingTime">'+log[n].time+' on '+(log[n].parameters.machine != "" ? log[n].parameters.machine : 'Unknown Device')+'</time>Printing <b>View</b> failed on Table #'+log[n].parameters.table+' <tag class="errorListingOwner">by '+log[n].parameters.staffName+'</tag><tag onclick="ignoreActionRequest(\''+log[n].parameters._id+'\')" class="errorListingFixButton">Ignore</tag></tag>';
            break;
          }
          case "PRINT_KOT":{
            renderContent += '<tag class="errorListingItem"><time class="errorListingTime">'+log[n].time+' on '+(log[n].parameters.machine != "" ? log[n].parameters.machine : 'Unknown Device')+'</time>Printing <b>Duplicate KOT</b> failed on Table #'+log[n].parameters.table+' <tag class="errorListingOwner">by '+log[n].parameters.staffName+'</tag><tag onclick="ignoreActionRequest(\''+log[n].parameters._id+'\')" class="errorListingFixButton">Ignore</tag></tag>';
            break;
          }
          case "PRINT_BILL":{
            if(log[n].type == 'SYSTEM_BILL_ERROR'){
              renderContent += '<tag class="errorListingItem"><time class="errorListingTime">'+log[n].time+' on '+(log[n].parameters.machine != "" ? log[n].parameters.machine : 'Unknown Device')+'</time><span class="systemError blink_me">SYSTEM ERROR</span> Generating <b>Bill</b> failed on Table #'+log[n].parameters.table+' <tag class="errorListingOwner">by '+log[n].parameters.staffName+'</tag><tag onclick="reissueActionRequest(\''+log[n].parameters._id+'\')" class="errorListingTryButton">Try Now</tag></tag>';
            }
            else if(log[n].type == 'BILL_GENERATION_FAILED'){  
              renderContent += '<tag class="errorListingItem"><time class="errorListingTime">'+log[n].time+' on '+(log[n].parameters.machine != "" ? log[n].parameters.machine : 'Unknown Device')+'</time>Generating <b>Bill</b> failed on Table #'+log[n].parameters.table+' <tag class="errorListingOwner">by '+log[n].parameters.staffName+'</tag><tag onclick="reissueActionRequest(\''+log[n].parameters._id+'\')" class="errorListingTryButton">Try Now</tag></tag>';
            }
            else{  
              renderContent += '<tag class="errorListingItem"><time class="errorListingTime">'+log[n].time+' on '+(log[n].parameters.machine != "" ? log[n].parameters.machine : 'Unknown Device')+'</time>Generating <b>Bill</b> failed on Table #'+log[n].parameters.table+' <tag class="errorListingOwner">by '+log[n].parameters.staffName+'</tag><tag onclick="ignoreActionRequest(\''+log[n].parameters._id+'\')" class="errorListingFixButton">Ignore</tag></tag>';
            }
            break;
          }
        }

      }
      else if(log[n].category == 'PRINT' && log[n].type == 'REQUEST_DELETE_FAILED'){

        switch(log[n].parameters.action){
          case "KOT_NEW":{
            renderContent += '<tag class="errorListingItem"><time class="errorListingTime">'+log[n].time+' on '+(log[n].parameters.machine != "" ? log[n].parameters.machine : 'Unknown Device')+'</time>Duplicate request to <b>Print KOT</b> on Table #'+log[n].parameters.table+' <tag class="errorListingOwner">by '+log[n].parameters.staffName+'</tag><tag onclick="forceDeletePrintRequest(\''+log[n].parameters.requestID+'\')" class="errorListingFixButton">Remove</tag></tag>';
            break;
          }
          case "KOT_EDITING":{
            renderContent += '<tag class="errorListingItem"><time class="errorListingTime">'+log[n].time+' on '+(log[n].parameters.machine != "" ? log[n].parameters.machine : 'Unknown Device')+'</time>Duplicate request to <b>Print Edited KOT</b> on Table #'+log[n].parameters.table+' <tag class="errorListingOwner">by '+log[n].parameters.staffName+'</tag><tag onclick="forceDeletePrintRequest(\''+log[n].parameters.requestID+'\')" class="errorListingFixButton">Remove</tag></tag>';
            break;
          }
          case "KOT_DUPLICATE":{
            renderContent += '<tag class="errorListingItem"><time class="errorListingTime">'+log[n].time+' on '+(log[n].parameters.machine != "" ? log[n].parameters.machine : 'Unknown Device')+'</time>Multiple requests to <b>Print Duplicate KOT</b> on Table #'+log[n].parameters.table+' <tag class="errorListingOwner">by '+log[n].parameters.staffName+'</tag><tag onclick="forceDeletePrintRequest(\''+log[n].parameters.requestID+'\')" class="errorListingFixButton">Remove</tag></tag>';
            break;
          }
          case "KOT_CANCEL":{
            renderContent += '<tag class="errorListingItem"><time class="errorListingTime">'+log[n].time+' on '+(log[n].parameters.machine != "" ? log[n].parameters.machine : 'Unknown Device')+'</time>Duplicate request to <b>Print Cancellation KOT</b> on Table #'+log[n].parameters.table+' <tag class="errorListingOwner">by '+log[n].parameters.staffName+'</tag><tag onclick="forceDeletePrintRequest(\''+log[n].parameters.requestID+'\')" class="errorListingFixButton">Remove</tag></tag>';
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

function reissueActionRequest(request_id){
          $.ajax({
            type: 'GET',
            url: COMMON_LOCAL_SERVER_IP+'/accelerate_action_requests/'+request_id,
            timeout: 10000,
            success: function(data) {
              
              var log = window.localStorage.errorLog && window.localStorage.errorLog != "" ? JSON.parse(window.localStorage.errorLog) : [];
              
              var n = 0;
              while(log[n]){

                if(log[n].parameters._id == request_id){
                  log.splice(n,1);
                  break;
                }

                n++;
              }

              window.localStorage.errorLog = JSON.stringify(log);
              renderErrorsLogCount();
            },
            error: function(data){
                showToast('Unable to find the request on the server. Please try again.', '#e74c3c');
            }

          });      
}


function ignoreActionRequest(request_id){

          $.ajax({
            type: 'GET',
            url: COMMON_LOCAL_SERVER_IP+'/accelerate_action_requests/'+request_id,
            timeout: 10000,
            success: function(data) {
              
              var log = window.localStorage.errorLog && window.localStorage.errorLog != "" ? JSON.parse(window.localStorage.errorLog) : [];
              
              var n = 0;
              while(log[n]){

                if(log[n].parameters._id == request_id){
                  log.splice(n,1);
                  break;
                }

                n++;
              }

              window.localStorage.errorLog = JSON.stringify(log);

              removeAlreadyProccessedActionRequest(data._id, data._rev, 'RENDER_ERROR_LOG');
            },
            error: function(data){
                showToast('Unable to find the request on the server. Please try again.', '#e74c3c');
            }

          });     
}


function removeOrderRequest(kot_id){

          $.ajax({
            type: 'GET',
            url: COMMON_LOCAL_SERVER_IP+'/accelerate_taps_orders/'+kot_id,
            timeout: 10000,
            success: function(data) {
              
              var log = window.localStorage.errorLog && window.localStorage.errorLog != "" ? JSON.parse(window.localStorage.errorLog) : [];
              
              var n = 0;
              while(log[n]){

                if(log[n].kotId == kot_id && log[n].category == "ORDER"){
                  log.splice(n,1);
                  break;
                }

                n++;
              }

              window.localStorage.errorLog = JSON.stringify(log);

              removeAlreadyPrintedTapOrder(data._id, data._rev, 'RENDER_ERROR_LOG');
            },
            error: function(data){
              showToast('Unable to find the KOT on the server. Please try again.', '#e74c3c');
            }

          });   

}

function forceDeletePrintRequest(print_request_id){

          $.ajax({
            type: 'GET',
            url: COMMON_LOCAL_SERVER_IP+'/accelerate_kot_print_requests/'+print_request_id,
            timeout: 10000,
            success: function(data) {
              
              var log = window.localStorage.errorLog && window.localStorage.errorLog != "" ? JSON.parse(window.localStorage.errorLog) : [];
              
              var n = 0;
              while(log[n]){

                if(log[n].parameters.action == data.printRequest.action && log[n].kotId == data.printRequest.KOT){
                  log.splice(n,1);
                  break;
                }

                n++;
              }

              window.localStorage.errorLog = JSON.stringify(log);

              removeKOTPrintRequestForce(data._id, data._rev, 'RENDER_ERROR_LOG');
            },
            error: function(data){
              showToast('Unable to find the KOT on the server. Please try again.', '#e74c3c');
            }

          });   
}




/*
  MAIN PROCESSING FUNCTION
*/


function initialiseProcessing(){

        if(PAUSE_FLAG){
            return '';
        }


        //Ignore List (to skip these already noted errors)
        var ignoreList = window.localStorage.errorLog && window.localStorage.errorLog != "" ? JSON.parse(window.localStorage.errorLog) : [];


        checkForRequests(0);

        //Round 1: Check for Requests
        function checkForRequests(index){

          console.log('Checking for Requests...');

          $.ajax({
            type: 'GET',
            url: COMMON_LOCAL_SERVER_IP+'/accelerate_action_requests/_design/requests/_view/fetchall',
            contentType: "application/json",
            dataType: 'json',
            timeout: 10000,
            success: function(data) {

              if(data.rows.length == 0){
                //go to next step 2 without cool off. no printing involved.
                checkForOrders(0);
              }
              else{
                        var requestData = data.rows[index].value;
              
                        //Check if this is added into the ignoreList
                        var e = 0;
                        while(ignoreList[e]){
                          if(ignoreList[e].kotId == requestData.KOT && ignoreList[e].parameters.action == requestData.action){
                            
                            if(data.rows.length > index + 1){ //more requests pending..
                              //iterate same step 1 (no cool off needed)
                              checkForRequests(index + 1);
                              return '';
                            }
                            else{
                              //go to next step 2 (no cool off needed)
                              checkForOrders(0);
                              return '';
                            }
                            
                          }
                          e++;
                        }



                        //fetch KOT
                        var kot_request_data = requestData.KOT;

                        $.ajax({
                          type: 'GET',
                          url: COMMON_LOCAL_SERVER_IP+'/accelerate_kot/'+kot_request_data,
                          timeout: 10000,
                          success: function(kotData) {
                            if(data._id != ""){
                                
                                switch(requestData.action){
                                  case "PRINT_VIEW":{
                                    sendToPrinter(kotData, 'VIEW');
                                    showToast('Items View of #'+kotData.KOTNumber+' generated Successfully', '#27ae60');
                                    
                                    removeAlreadyProccessedActionRequest(requestData._id, requestData._rev);
                                    
                                    //go starting again, after some cool off.
                                    setTimeout(function(){ initialiseProcessing(); }, 5000);
                                    break;
                                  }
                                  case "PRINT_KOT":{
                                    printDuplicateTapsKOT(kotData, requestData);
                                    break;
                                  }
                                  case "PRINT_BILL":{ 
                                    confirmBillGeneration(kotData, requestData);
                                    
                                    //go starting again, after some cool off.
                                    setTimeout(function(){ initialiseProcessing(); }, 5000);
                                    break;
                                  }
                                  default:{
                                    //go starting again, after some cool off.
                                    setTimeout(function(){ initialiseProcessing(); }, 5000);
                                    break;
                                  }
                                }                                

                            }
                            else{
                              showToast('System Error: KOT is not found. Please contact Accelerate Support if problem persists.', '#e74c3c');
                              
                              //go to next step 2 without any cool off.
                              checkForOrders(0);
                            }
                          },
                          error: function(data) {

                                var action_name = '';
                                switch(requestData.action){
                                  case "PRINT_VIEW":{
                                    action_name = 'Printing View';
                                    break;
                                  }
                                  case "PRINT_KOT":{
                                    action_name = 'Printing Duplicate KOT';
                                    break;
                                  }
                                  case "PRINT_BILL":{ 
                                    action_name = 'Generating Bill';
                                    break;
                                  }
                                }   


                                //KOT not found 
                                var splits = kot_request_data.split('_');
                                showToast(action_name+' has been Failed: KOT #<b>'+splits[2]+'</b> is not found.', '#e74c3c');

                                //Add to Error Log
                                addToErrorLog(moment().format('hh:mm a'), 'REQUEST', 'KOT_NOT_FOUND', requestData.KOT, requestData);

                                //go to next step 2 without cool off.
                                checkForOrders(0);
                          }
                        });
                    
              }
            },
            error: function(data){
              showToast('System Error: Unable to fetch print requests. Please contact Accelerate Support if problem persists.', '#e74c3c');
              
              //go to next step 2 without cool off.  
              checkForOrders(0);
            }

          });    
        
        }


        //Round 2: Check for Orders
        function checkForOrders(index){

          console.log('Checking for Orders...');

          $.ajax({
            type: 'GET',
            url: COMMON_LOCAL_SERVER_IP+'/accelerate_taps_orders/_design/orders/_view/view?include_docs=true',
            contentType: "application/json",
            dataType: 'json',
            timeout: 10000,
            success: function(data) {

              if(data.total_rows == 0){
                document.getElementById("pendingOrderMessage").innerHTML = 'No Pending Orders';
                
                //go to next round 3, no need of any cool off.
                checkForPrints(0);
              }
              else{
                    //Update Message
                    document.getElementById("pendingOrderMessage").innerHTML = data.total_rows+' Pending Order'+(data.total_rows > 1 ? 's': '');
              
                    var orderData = data.rows[index].doc;


                    //Check if this is added into the ignoreList
                    var e = 0;
                    while(ignoreList[e]){
                      if(ignoreList[e].kotId == orderData._id && ignoreList[e].category == "ORDER"){

                            //show warning symbol
                            document.getElementById("pendingOrderMessage").innerHTML = data.total_rows+' Pending Order'+(data.total_rows > 1 ? 's': '')+' <i onclick="renderErrorsLog()" class="fa fa-warning" style="color: #ff0000; cursor: pointer;"></i>';

                            if(data.rows.length > index + 1){ //more orders pending..
                              //iterate the same step 2 without any cool off
                              checkForOrders(index + 1);
                              return '';
                            }
                            else{

                              //go to next round 3 without any cool off.
                              checkForPrints(0);

                              return '';
                            }

                      }
                      
                      e++;
                    }




                    if(orderData.KOTNumber != ''){ //Editing Order case..

                        var kotID = orderData.KOTNumber;

                        //Check if it's already existing KOT (editing or not)
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
                          success: function(oldKOTData) {
                            if(data._id != ""){
                              printEditedKOT(oldKOTData, orderData);
                            }
                            else{
                              showToast('System Error: KOT is not found. Please contact Accelerate Support if problem persists.', '#e74c3c');
                              
                              //start again
                              initialiseProcessing();

                            }
                          },
                          error: function(data) {

                            //KOT not found 
                            showToast('Editing KOT Failed: KOT #<b>'+kotID+'</b> is not found on the server.', '#e74c3c');

                            //Add to Error Log
                            var errorObj = {
                              "table" : orderData.table,
                              "staffName" : orderData.stewardName,
                              "staffCode" : orderData.stewardCode,
                              "machine": orderData.machineName
                            }

                            addToErrorLog(moment().format('hh:mm a'), 'ORDER', 'KOT_NOT_FOUND', kot_request_data, errorObj);

                            //start again
                            initialiseProcessing();

                          }
                        });
                    }
                    else{
                        printFreshKOT(orderData); //Fresh Order case..
                    }
                    
              }
            },
            error: function(data){
              showToast('System Error: Unable to fetch orders. Please contact Accelerate Support if problem persists.', '#e74c3c');
              
              //go to next round - 3
              checkForPrints(0);
            }

          }); 

        }    


        //Round 3: Check for Prints (running KOTs punched from Non-mobile devices)
        function checkForPrints(index){

          console.log('Checking for Prints...')

          $.ajax({
            type: 'GET',
            url: COMMON_LOCAL_SERVER_IP+'/accelerate_kot_print_requests/_design/print-requests/_view/fetchall',
            contentType: "application/json",
            dataType: 'json',
            timeout: 10000,
            success: function(data) {

              if(data.rows.length == 0){
                //Relax! and start again! 
                setTimeout(function(){ initialiseProcessing(); }, 5000);
              }
              else{
                        var requestData = data.rows[index].value;
              
                        //Check if this is added into the ignoreList
                        var e = 0;
                        while(ignoreList[e]){
                          if(ignoreList[e].kotId == requestData.printRequest.KOT && ignoreList[e].parameters.action == requestData.printRequest.action){
                            
                            if(data.rows.length > index + 1){ //more print requests pending..
                              //iterate same step 3 (no cool off needed)
                              checkForPrints(index + 1);
                              return '';
                            }
                            else{
                              //go to starting again
                              setTimeout(function(){ initialiseProcessing(); }, 5000);
                              return '';
                            }
                            
                          }
                          e++;
                        }


                        switch(requestData.printRequest.action){
                          case "KOT_NEW":{
                            printKOTRequestNew(requestData)
                            break;
                          }
                          case "KOT_EDITING":{
                            printKOTRequestEdited(requestData, requestData.printRequest.comparison)
                            break;
                          }
                          case "KOT_DUPLICATE":{
                            printKOTRequestDuplicate(requestData);
                            break;
                          }
                          case "KOT_CANCEL":{
                            printKOTRequestCancel(requestData);
                            break;
                          }
                          default:{

                            //go to starting again, after some cool off.
                            setTimeout(function(){ initialiseProcessing(); }, 5000);
                            
                            break;
                          }
                        }

             
              }
            },
            error: function(data){
              showToast('System Error: Unable to fetch print requests. Please contact Accelerate Support if problem persists.', '#e74c3c');
              
              //Relax! and start again! 
              setTimeout(function(){ initialiseProcessing(); }, 5000);
            }

          });    

        }

}




initialiseProcessing();
refreshRecentOrdersStream();


/* KOT Printing : New / Editing / Duplicate / Cancellation */

//To print NEW KOT
function printKOTRequestNew(obj){
    
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
                                removeKOTPrintRequest(obj._id, obj._rev, obj.printRequest);

                                //Process Next Print 
                                setTimeout(function(){ initialiseProcessing(); }, 3000);                                   
                            }
                        } else {
                            //There are no items to relay. Go to next.
                            if (allPrintersList[index + 1]) {
                                startRelayPrinting(index + 1);
                            } else {
                                finishPrintingAnimation();
                                removeKOTPrintRequest(obj._id, obj._rev, obj.printRequest);

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
            removeKOTPrintRequest(obj._id, obj._rev, obj.printRequest);

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
                            removeKOTPrintRequest(obj._id, obj._rev, obj.printRequest);

                            //Process Next Print 
                            setTimeout(function(){ initialiseProcessing(); }, 3000);                               
                            break;
                        }
                    }
                }


                if (g == allConfiguredPrintersList.length - 1) {
                    if (selected_printer == '') { //No printer found, print on default!
                        sendToPrinter(obj, 'KOT');
                        removeKOTPrintRequest(obj._id, obj._rev, obj.printRequest);

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
                                removeKOTPrintRequest(kot._id, kot._rev, kot.printRequest);

                                //Process Next Print 
                                setTimeout(function(){ initialiseProcessing(); }, 3000);


                            }
                        } else {
                            //There are no items to relay. Go to next.
                            if (allPrintersList[index + 1]) {
                                startRelayPrinting(index + 1);
                            } else {
                                finishPrintingAnimation();
                                removeKOTPrintRequest(kot._id, kot._rev, kot.printRequest);

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
            removeKOTPrintRequest(kot._id, kot._rev, kot.printRequest);

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
                            removeKOTPrintRequest(kot._id, kot._rev, kot.printRequest);

                            //Process Next Print 
                            setTimeout(function(){ initialiseProcessing(); }, 3000);
                            break;
                        }
                    }
                }


                if (g == allConfiguredPrintersList.length - 1) {
                    if (selected_printer == '') { //No printer found, print on default!
                        sendKOTChangesToPrinter(kot, compareObject);
                        removeKOTPrintRequest(kot._id, kot._rev, kot.printRequest);

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
                                removeKOTPrintRequest(data._id, data._rev, data.printRequest);

                                //Process Next Print 
                                setTimeout(function(){ initialiseProcessing(); }, 3000);
                            }
                        } else {
                            //There are no items to relay. Go to next.
                            if (allPrintersList[index + 1]) {
                                startRelayPrinting(index + 1);
                            } else {
                                finishPrintingAnimation();
                                removeKOTPrintRequest(data._id, data._rev, data.printRequest);

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
            removeKOTPrintRequest(data._id, data._rev, data.printRequest);

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
                            removeKOTPrintRequest(data._id, data._rev, data.printRequest);

                            //Process Next Print 
                            setTimeout(function(){ initialiseProcessing(); }, 3000);
                            
                            break;
                        }
                    }
                }


                if (g == allConfiguredPrintersList.length - 1) {
                    if (selected_printer == '') { //No printer found, print on default!
                        sendToPrinter(obj, 'DUPLICATE_KOT');
                        removeKOTPrintRequest(data._id, data._rev, data.printRequest);

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
                                removeKOTPrintRequest(obj._id, obj._rev, obj.printRequest);

                                //Process Next Print 
                                setTimeout(function(){ initialiseProcessing(); }, 3000);
                            }
                        } else {
                            //There are no items to relay. Go to next.
                            if (allPrintersList[index + 1]) {
                                startRelayPrinting(index + 1);
                            } else {
                                finishPrintingAnimation();
                                removeKOTPrintRequest(obj._id, obj._rev, obj.printRequest);

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
            removeKOTPrintRequest(obj._id, obj._rev, obj.printRequest);

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
                            removeKOTPrintRequest(obj._id, obj._rev, obj.printRequest);

                            //Process Next Print 
                            setTimeout(function(){ initialiseProcessing(); }, 3000);

                            break;
                        }
                    }
                }


                if (g == allConfiguredPrintersList.length - 1) {
                    if (selected_printer == '') { //No printer found, print on default!
                        sendToPrinter(obj, 'CANCELLED_KOT');
                        removeKOTPrintRequest(obj._id, obj._rev, obj.printRequest);

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

          generateEditedKOTAfterProcess(originalData.KOTNumber, changed_cart_products, comparisonResult, hasRestrictedEdits, errorLogObj)
        } 

        j++;
      }
    }

  }




  function generateEditedKOTAfterProcess(kotID, newCart, compareObject, hasRestrictedEdits, errorLogObj){

      var isUserAnAdmin = false;

      if(compareObject.length == 0){
        //Process Next KOT
        setTimeout(function(){ initialiseProcessing(); }, 5000);
        return ''
      }

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
                       
                          sendKOTChangesToPrinterPreProcess(kot, compareObject);
                          removeAlreadyPrintedTapOrder(super_memory_id, super_memory_rev);

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
              '<p class="lastOrder1"><b>'+order_stream[0].KOTNumber+'</b> on <b>'+order_stream[0].table+'</b> by <tag class="stewardName">'+(order_stream[0].steward != '' ? order_stream[0].steward : 'Unknown')+'</tag><tag class="orderTime"> at '+order_stream[0].time+'</tag></p>';
    }
    else if(order_stream.length == 2){
        document.getElementById("recentOrdersList").innerHTML = ''+
              '<tag class="recentOrderHead">RECENT ORDERS</tag>'+
              '<p class="lastOrder1"><b>'+order_stream[1].KOTNumber+'</b> on <b>'+order_stream[1].table+'</b> by <tag class="stewardName">'+(order_stream[1].steward != '' ? order_stream[1].steward : 'Unknown')+'</tag><tag class="orderTime"> at '+order_stream[1].time+'</tag></p>'+
              '<p class="lastOrder2"><b>'+order_stream[0].KOTNumber+'</b> on <b>'+order_stream[0].table+'</b> by <tag class="stewardName">'+(order_stream[0].steward != '' ? order_stream[0].steward : 'Unknown')+'</tag><tag class="orderTime"> at '+order_stream[0].time+'</tag></p>';
    }
    else if(order_stream.length == 3){
        document.getElementById("recentOrdersList").innerHTML = ''+
              '<tag class="recentOrderHead">RECENT ORDERS</tag>'+
              '<p class="lastOrder1"><b>'+order_stream[2].KOTNumber+'</b> on <b>'+order_stream[2].table+'</b> by <tag class="stewardName">'+(order_stream[2].steward != '' ? order_stream[2].steward : 'Unknown')+'</tag><tag class="orderTime"> at '+order_stream[2].time+'</tag></p>'+
              '<p class="lastOrder2"><b>'+order_stream[1].KOTNumber+'</b> on <b>'+order_stream[1].table+'</b> by <tag class="stewardName">'+(order_stream[1].steward != '' ? order_stream[1].steward : 'Unknown')+'</tag><tag class="orderTime"> at '+order_stream[1].time+'</tag></p>'+
              '<p class="lastOrder3"><b>'+order_stream[0].KOTNumber+'</b> on <b>'+order_stream[0].table+'</b> by <tag class="stewardName">'+(order_stream[0].steward != '' ? order_stream[0].steward : 'Unknown')+'</tag><tag class="orderTime"> at '+order_stream[0].time+'</tag></p>';
    }
    else{
        document.getElementById("recentOrdersList").innerHTML = '';
    }
}


function removeAlreadyPrintedTapOrder(id, revID, optionalRequest){

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
            showToast('Server Warning: Unable to modify Order KOT. Please contact Accelerate Support.', '#e67e22');
          }
        });         
}


function removeAlreadyProccessedActionRequest(id, revID, optionalRequest){

        $.ajax({
          type: 'DELETE',
          url: COMMON_LOCAL_SERVER_IP+'/accelerate_action_requests/'+id+'?rev='+revID,
          contentType: "application/json",
          dataType: 'json',
          timeout: 10000,
          success: function(data) {     
            if(optionalRequest == 'RENDER_ERROR_LOG'){
              renderErrorsLogCount();
            }
          },
          error: function(data) {
            showToast('Server Warning: Unable to modify action request. Please contact Accelerate Support.', '#e67e22');
          }
        });         
}

function removeKOTPrintRequest(id, revID, paramsObj, optionalRequest){

        $.ajax({
          type: 'DELETE',
          url: COMMON_LOCAL_SERVER_IP+'/accelerate_kot_print_requests/'+id+'?rev='+revID,
          contentType: "application/json",
          dataType: 'json',
          timeout: 10000,
          success: function(data) {     
            if(optionalRequest == 'RENDER_ERROR_LOG'){
              renderErrorsLogCount();
            }              
          },
          error: function(data) {
            showToast('Server Warning: Unable to modify Print Request. Please contact Accelerate Support.', '#e67e22');
            
            //Add to Error Log
            var tempObj = paramsObj;
            tempObj.requestID = id;
            tempObj.table = 

            addToErrorLog(moment().format('hh:mm a'), 'PRINT', 'REQUEST_DELETE_FAILED', paramsObj.KOT, tempObj);
          
          }
        });         
}

function removeKOTPrintRequestForce(id, revID, optionalRequest){

        $.ajax({
          type: 'DELETE',
          url: COMMON_LOCAL_SERVER_IP+'/accelerate_kot_print_requests/'+id+'?rev='+revID,
          contentType: "application/json",
          dataType: 'json',
          timeout: 10000,
          success: function(data) {     
            if(optionalRequest == 'RENDER_ERROR_LOG'){
              renderErrorsLogCount();
            }              
          },
          error: function(data) {
            showToast('Server Warning: Unable to modify Print Request. Please contact Accelerate Support.', '#e67e22');
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



function printFreshKOT(new_kot){

           var obj = new_kot;

           var super_memory_id = obj._id;
           var super_memory_rev = obj._rev;

           delete obj._rev;

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
                      var original_order_object_cart = obj.cart;

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

                            //Add to table maping
                            addToTableMapping(obj.table, kot, obj.stewardName);
                          

                            //Render order stream
                            var order_stream = window.localStorage.orderStream && window.localStorage.orderStream != '' ? JSON.parse(window.localStorage.orderStream) : [];

                            if(order_stream.length < 3){
                                order_stream.push({
                                    "KOTNumber" : new_kot.KOTNumber,
                                    "table": new_kot.table,
                                    "steward": new_kot.stewardName,
                                    "time": new_kot.timeKOT != '' ? moment(new_kot.timeKOT, 'HHmm').format('hh:mm a') : moment(new_kot.timePunch, 'HHmm').format('hh:mm A')
                                });
                                window.localStorage.orderStream = JSON.stringify(order_stream);
                            }
                            else{
                                order_stream.push({
                                    "KOTNumber" : new_kot.KOTNumber,
                                    "table": new_kot.table,
                                    "steward": new_kot.stewardName,
                                    "time": new_kot.timeKOT != '' ?  moment(new_kot.timeKOT, 'HHmm').format('hh:mm a') : moment(new_kot.timePunch, 'HHmm').format('hh:mm A')
                                });

                                var new_stream = order_stream.slice(1, 4);
                                window.localStorage.orderStream = JSON.stringify(new_stream);
                            }


                            refreshRecentOrdersStream();
                            initialiseKOTPrinting();
                            removeAlreadyPrintedTapOrder(super_memory_id, super_memory_rev);

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
                                  removeAlreadyProccessedActionRequest(requestData._id, requestData._rev);
                                    
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
                                  removeAlreadyProccessedActionRequest(requestData._id, requestData._rev);
                                    
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
                        removeAlreadyProccessedActionRequest(requestData._id, requestData._rev);
                                    
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
                                    removeAlreadyProccessedActionRequest(requestData._id, requestData._rev);
                                    
                                    //go starting again, after some cool off.
                                    setTimeout(function(){ initialiseProcessing(); }, 5000);
                                  
                                    break;
                                  }
                              }
                              }
                              

                              if(g == allConfiguredPrintersList.length - 1){
                                if(selected_printer == ''){ //No printer found, print on default!
                                  sendToPrinter(obj, 'DUPLICATE_KOT');
                                  removeAlreadyProccessedActionRequest(requestData._id, requestData._rev);
                                    
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

    var requestData = {
      "selector"  :{ 
                    "identifierTag": "ACCELERATE_BILL_INDEX" 
                  },
      "fields"    : ["_rev", "identifierTag", "value"]
    }

    $.ajax({
      type: 'POST',
      url: COMMON_LOCAL_SERVER_IP+'/accelerate_settings/_find',
      data: JSON.stringify(requestData),
      contentType: "application/json",
      dataType: 'json',
      timeout: 10000,
      success: function(data) {
        if(data.docs.length > 0){
          if(data.docs[0].identifierTag == 'ACCELERATE_BILL_INDEX'){

            var billNumber = parseInt(data.docs[0].value) + 1;
            confirmBillGenerationAfterProcess(billNumber, kotData, data.docs[0]._rev, actionRequestObj);
                
          }
          else{
            showToast('Not Found Error: Bill Index data not found. Please contact Accelerate Support.', '#e74c3c');
          }
        }
        else{
          showToast('Not Found Error: Bill Index data not found. Please contact Accelerate Support.', '#e74c3c');
        }

      },
      error: function(data) {
        showToast('System Error: Unable to read Bill Index. Please contact Accelerate Support.', '#e74c3c');
        
        //Add to Error Log
        addToErrorLog(moment().format('hh:mm a'), 'REQUEST', 'SYSTEM_BILL_ERROR', actionRequestObj.KOT, actionRequestObj);      

      }
    });
}


function confirmBillGenerationAfterProcess(billNumber, kotData, revID, actionRequestObj){

          console.log('Generating Bill > '+billNumber+' from KOT '+kotData.KOTNumber);

          var kotfile = kotData;

          var raw_cart = kotfile.cart;
          var beautified_cart = [];

          for(var n = 0; n < raw_cart.length; n++){
            
            if(n == 0){
              beautified_cart.push(raw_cart[0]);
            }
            else{

              var duplicateFound = false;
              var k = 0;
              while(beautified_cart[k]){
                if(beautified_cart[k].code == raw_cart[n].code){
                  if(beautified_cart[k].isCustom && raw_cart[n].isCustom){
                    if(beautified_cart[k].variant == raw_cart[n].variant){
                      beautified_cart[k].qty = beautified_cart[k].qty + raw_cart[n].qty;
                      duplicateFound = true;
                      break;
                    }
                  }
                  else{
                    beautified_cart[k].qty = beautified_cart[k].qty + raw_cart[n].qty;
                    duplicateFound = true;
                    break;
                  }
                }

                k++;
              }

              if(!duplicateFound){
                beautified_cart.push(raw_cart[n]);
              }

            }

          }


          kotfile.cart = beautified_cart;


          var memory_id = kotfile._id;
          var memory_rev = kotfile._rev;

          kotfile.billNumber = billNumber,
          kotfile.paymentMode = "";
          kotfile.totalAmountPaid = "";
          kotfile.paymentReference = "";

          var branch_code = window.localStorage.accelerate_licence_branch ? window.localStorage.accelerate_licence_branch : '';
          kotfile.outletCode = branch_code != '' ? branch_code : 'UNKNOWN';


          /* BILL SUM CALCULATION */

          //Calculate Sum to be paid
          var grandPayableBill = 0;
          var n = 0;
          while(kotfile.cart[n]){
            grandPayableBill += kotfile.cart[n].price * kotfile.cart[n].qty;
            n++;
          }

          //add extras
          if(!jQuery.isEmptyObject(kotfile.extras)){
            var m = 0;
            while(kotfile.extras[m]){
              grandPayableBill += kotfile.extras[m].amount;
              m++;
            }
          } 

          //add custom extras if any
          if(!jQuery.isEmptyObject(kotfile.customExtras)){
            grandPayableBill += kotfile.customExtras.amount;
          }  


          //substract discounts if any
          if(!jQuery.isEmptyObject(kotfile.discount)){
            grandPayableBill -= kotfile.discount.amount;
          }  

          grandPayableBill = parseFloat(grandPayableBill).toFixed(2);   
          grandPayableBillRounded = properRoundOff(grandPayableBill);   

          kotfile.payableAmount = grandPayableBillRounded;
          kotfile.calculatedRoundOff = Math.round((grandPayableBillRounded - grandPayableBill) * 100) / 100;

          kotfile.timeBill = getCurrentTime('TIME');
          

          //Remove Unwanted Stuff
          delete kotfile.specialRemarks;
          delete kotfile.allergyInfo;

          var c = 0;
          while(kotfile.cart[c]){
            
            delete kotfile.cart[c].ingredients;
            delete kotfile.cart[c].comments;
            
            c++;
          }


            /*Save NEW BILL*/

            //Remove _rev and _id (KOT File Scraps!)
            var newBillFile = kotfile;
            delete newBillFile._id;
            delete newBillFile._rev


            //Set _id from Branch mentioned in Licence
            var accelerate_licencee_branch = window.localStorage.accelerate_licence_branch ? window.localStorage.accelerate_licence_branch : ''; 
            if(!accelerate_licencee_branch || accelerate_licencee_branch == ''){
              showToast('Invalid Licence Error: Bill can not be generated. Please contact Accelerate Support if problem persists.', '#e74c3c');
              return '';
            }

            kotfile._id = accelerate_licencee_branch+'_BILL_'+billNumber;


            //Post to local Server
            $.ajax({
              type: 'POST',
              url: COMMON_LOCAL_SERVER_IP+'/accelerate_bills/',
              data: JSON.stringify(newBillFile),
              contentType: "application/json",
              dataType: 'json',
              timeout: 10000,
              success: function(data) {
                if(data.ok){

                        //DELETE THE KOT
                        deleteKOTFromServer(memory_id, memory_rev);

                        //DELETE ACTION REQUEST
                        removeAlreadyProccessedActionRequest(actionRequestObj._id, actionRequestObj._rev);

                        //PRINTING THE BILL
                        sendToPrinter(newBillFile, 'BILL');
                        billTableMapping(kotfile.table, billNumber, kotfile.payableAmount, 2);


                        //Update bill number on server
                        var updateData = {
                            "_rev": revID,
                            "identifierTag": "ACCELERATE_BILL_INDEX",
                            "value": billNumber
                        }

                        $.ajax({
                            type: 'PUT',
                            url: COMMON_LOCAL_SERVER_IP+'accelerate_settings/ACCELERATE_BILL_INDEX/',
                            data: JSON.stringify(updateData),
                            contentType: "application/json",
                            dataType: 'json',
                            timeout: 10000,
                            success: function(data) {
                              
                            },
                            error: function(data) {
                              showToast('System Error: Unable to update Billing Index. Next Bill Number might be faulty. Please contact Accelerate Support.', '#e74c3c');
                            
                              //Add to Error Log
                              addToErrorLog(moment().format('hh:mm a'), 'REQUEST', 'SYSTEM_BILL_ERROR', actionRequestObj.KOT, actionRequestObj);      
                            }

                        });  
                }
                else{
                  showToast('Warning: Bill was not Generated. Try again.', '#e67e22');
                }
              },
              error: function(data){   
                if(data.responseJSON.error == "conflict"){
                  showToast('Bill Number Conflict: <b>Apply Quick Fix #2</b> and try again. Please contact Accelerate Support if problem persists.', '#e74c3c');   
                } 
                else{
                  showToast('System Error: Unable to generate the bill. Please contact Accelerate Support if problem persists.', '#e74c3c');
                }  

                //Add to Error Log
                addToErrorLog(moment().format('hh:mm a'), 'REQUEST', 'BILL_GENERATION_FAILED', actionRequestObj.KOT, actionRequestObj);           
              }
            });  
            //End - post KOT to Server
   
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

