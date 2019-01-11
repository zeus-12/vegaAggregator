
let COMMON_LOCAL_SERVER_IP = 'http://admin:admin@127.0.0.1:5984/';


let $ = jQuery.noConflict();

/* Digital Clock */
function updateClock() {
    document.getElementById('globalTimeDisplay').innerHTML = moment().format('hh:mm:ss a')
}

function timedUpdate () {
  updateClock();
  setTimeout(timedUpdate, 1000);
}

timedUpdate();



/*Toast*/
var toastShowingInterval;
function showToast(message, color){

      clearInterval(toastShowingInterval);

      var x = document.getElementById("infobar")
      if(color){
        x.style.background = color;
      }

      x.innerHTML = message;
      x.className = "show";
      toastShowingInterval = setTimeout(function(){ x.className = x.className.replace("show", ""); }, 5000); 
}




function openSettingsWindow(){
  
  document.getElementById("serverConnectionURLDisplayModal").style.display = 'block';

  var default_url = 'http://admin:admin@127.0.0.1:5984/';
  var saved_url = window.localStorage.serverConnectionURL ? window.localStorage.serverConnectionURL : ''; 
  var saved_client = window.localStorage.dataAggregatorClient ? window.localStorage.dataAggregatorClient : '';


  if(saved_url == ''){
    $('#add_custom_server_url').val(default_url);
  }
  else{
    $('#add_custom_server_url').val(saved_url);
  }

  $('#add_custom_slave_client_id').val(saved_client);

}

function hideSettingsWindow(){
  document.getElementById("serverConnectionURLDisplayModal").style.display = 'none';
}

function setServerConnectionDetails(){

  var url = $('#add_custom_server_url').val();
  url = url.replace(/\s/g,'');

  var machine_id = $('#add_custom_slave_client_id').val();
  machine_id = machine_id.replace(/\s/g,'');

  var default_url = 'http://admin:admin@127.0.0.1:5984/';

  if(url == ''){
    showToast('Error: Add a Server URL', '#e74c3c');
    return '';
  }

  if(machine_id == ''){
    showToast('Error: Add the machine ID of the Slave Client', '#e74c3c');
    return '';
  }

  if(url != '' && machine_id != ''){
    window.localStorage.serverConnectionURL = url;
    window.localStorage.dataAggregatorClient = machine_id;

    COMMON_LOCAL_SERVER_IP = url;

    hideSettingsWindow();

    checkClientConnection();
  }
  
}



function checkClientConnection(){


    var dataAggregatorClient = window.localStorage.dataAggregatorClient ? window.localStorage.dataAggregatorClient : '';

    if(dataAggregatorClient == ''){
      document.getElementById("applicationErrorLock").style.display = 'block';
        showToast('Error: Please check the Slave Client ID', '#8e44ad');
      return '';
    }

    //Read from Server, apply changes, and save to LocalStorage
    var requestData = {
      "selector"  :{ 
                    "identifierTag": "ACCELERATE_CONFIGURED_MACHINES" 
                  },
      "fields"    : ["identifierTag", "value"]
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
          if(data.docs[0].identifierTag == 'ACCELERATE_CONFIGURED_MACHINES'){

              var machinesList = data.docs[0].value;

              var n = 0;
              while(machinesList[n]){

                if(machinesList[n].machineUID == dataAggregatorClient){

                  document.getElementById("applicationErrorLock").style.display = 'none';

                  window.localStorage.accelerate_licence_number = machinesList[n].licence;
                  window.localStorage.accelerate_licence_branch = machinesList[n].branch;
                  window.localStorage.accelerate_licence_branch_name = machinesList[n].branchName ? machinesList[n].branchName : machinesList[n].branch;
                  window.localStorage.accelerate_licence_client_name = machinesList[n].client ? machinesList[n].client : '';
                  window.localStorage.accelerate_licence_machineUID = machinesList[n].machineUID;
                  window.localStorage.appCustomSettings_SystemName = machinesList[n].machineCustomName;
                  window.localStorage.accelerate_licence_online_enabled = machinesList[n].isOnlineEnabled ? 1 : 0;
                  
                  //Success Callbacks
                  testLocalServerConnection();
                  applySystemOptionSettings();
                  applyKOTRelays();
                  applyConfiguredPrinters();


                  break;
                }

                if(n == machinesList.length - 1){ //Last iteration
                  document.getElementById("applicationErrorLock").style.display = 'block';
                  showToast('Error: Please check the Slave Client ID', '#8e44ad');
                  return '';                  
                }

                n++;
              }

          }
          else{
            document.getElementById("applicationErrorLock").style.display = 'block';
            showToast('Error: Please check the Slave Client ID', '#8e44ad');
            return '';          
          }
        }
        else{
            document.getElementById("applicationErrorLock").style.display = 'block';
            showToast('Error: Please check the Slave Client ID', '#8e44ad');
            return '';    
        }
      },
      error: function(data) {
        document.getElementById("serverErrorLock").style.display = 'block';
        return '';          
      }
    });  
  
}

checkClientConnection();







/* CouchDB Local Server Connection Test */
var checkServerRefreshInterval;
var serverRefreshCounter = 10;

function testLocalServerConnection(retryFlag){

        serverRefreshCounter = 10;
        clearInterval(checkServerRefreshInterval);

        showLoading(10000, 'Trying to reach the Server'); 
        $.ajax({
            type: 'GET',
            url: COMMON_LOCAL_SERVER_IP,
            timeout: 10000,
            success: function(data) {
              
              hideLoading();
              document.getElementById("serverErrorLock").style.display = 'none';

              if(retryFlag && retryFlag == 1){
                showToast('Connected to the Server', '#27ae60');
                checkClientConnection(); //TWEAK
              }

              clearInterval(checkServerRefreshInterval);
            },
            error: function(data){

              hideLoading();

              checkServerRefreshInterval = window.setInterval(function() { 
                if(serverRefreshCounter == 1){
                  serverRefreshCounter = 10;
                  testLocalServerConnection(1);
                }
                else{
                  serverRefreshCounter--;
                }

                document.getElementById("refreshServerCheckCounter").innerHTML = 'Auto retry in '+serverRefreshCounter+' seconds';
              }, 1000);

              document.getElementById("serverErrorLock").style.display = 'block';
              showToast('The local Server is not running or not connected. Please check the connection and start the server.', '#8e44ad')
            }
        });     
}



/* Loading */
var loadingLapsedInterval;
function showLoading(time, text){

  document.getElementById("generalLoadingModal").style.display = 'block';

  if(!text && text == ''){
    document.getElementById("generalLoaderText").innerHTML = 'Loading...';
  }
  else{
    document.getElementById("generalLoaderText").innerHTML = text;
  }
  

  var startCount = 10;
  if(time && time != ''){
    startCount = parseInt(time)/1000;
  }

  document.getElementById("generalLoaderCount").innerHTML = startCount;

  loadingLapsedInterval = window.setInterval(function() {
    if(startCount == 1){
      clearInterval(loadingLapsedInterval);
      document.getElementById("generalLoadingModal").style.display = 'none';
    }

    startCount--;
    document.getElementById("generalLoaderCount").innerHTML = startCount;
    console.log('Am Secretly running...')
  }, 1000); 

}



function hideLoading(){
  clearInterval(loadingLapsedInterval);
  document.getElementById("generalLoadingModal").style.display = 'none';
  document.getElementById("generalLoaderCount").innerHTML = '';
  document.getElementById("generalLoaderText").innerHTML = 'Loading...';
}





/* Apply Personalisations */
function applySystemOptionSettings(){
  
    //Read from Server, apply changes, and save to LocalStorage
    var requestData = {
      "selector"  :{ 
                    "identifierTag": "ACCELERATE_SYSTEM_OPTIONS" 
                  },
      "fields"    : ["identifierTag", "value"]
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
          if(data.docs[0].identifierTag == 'ACCELERATE_SYSTEM_OPTIONS'){

              var settingsList = data.docs[0].value;

              var machineName = window.localStorage.accelerate_licence_machineUID ? window.localStorage.accelerate_licence_machineUID : '';
              if(!machineName || machineName == ''){
                machineName = 'Any';
              }

              for(var n=0; n<settingsList.length; n++){

                if(settingsList[n].systemName == machineName){

                    var params = settingsList[n].data;

                    //Render
                    for (var i=0; i<params.length; i++){
                      if(params[i].name == "notifications"){           
                        window.localStorage.systemOptionsSettings_notifications = params[i].value;
                        NOTIFICATION_FILTER = params[i].value;
                      }
                      else if(params[i].name == "onlineOrders"){

                        var tempVal = params[i].value == 'YES'? true: false;

                        /*update localstorage*/             
                        window.localStorage.systemOptionsSettings_OnlineOrders = tempVal;
                      }
                      else if(params[i].name == "resetCountersAfterReport"){

                        var tempVal = (params[i].value == 'YES'? 1: 0);

                        /*update localstorage*/             
                        window.localStorage.appOtherPreferences_resetCountersAfterReport = tempVal;
                      }
                      else if(params[i].name == "orderEditingAllowed"){

                        var tempVal = (params[i].value == 'YES'? 1: 0);

                        /*update localstorage*/             
                        window.localStorage.appOtherPreferences_orderEditingAllowed = tempVal;
                      }
                      else if(params[i].name == "syncOnlineMenu"){

                        var tempVal = (params[i].value == 'YES'? 1: 0);

                        /*update localstorage*/             
                        window.localStorage.appOtherPreferences_syncOnlineMenu = tempVal;
                      }
                      else if(params[i].name == "minimumCookingTime"){

                        var tempVal = (params[i].value == 'YES'? 1: 0);

                        /*update localstorage*/             
                        window.localStorage.appOtherPreferences_minimumCookingTime = tempVal;
                      }
                      else if(params[i].name == "expectedReadyTime"){

                        var tempVal = (params[i].value == 'YES'? 1: 0);

                        /*update localstorage*/             
                        window.localStorage.appOtherPreferences_expectedReadyTime = tempVal;
                      }
                      else if(params[i].name == "onlineOrdersNotification"){

                        var tempVal = (params[i].value == 'YES'? true: false);

                        /*update localstorage*/             
                        window.localStorage.systemOptionsSettings_OnlineOrdersNotification = tempVal;
                      }
                      else if(params[i].name == "billSettleLater"){

                        var tempVal = (params[i].value == 'YES'? 1: 0);

                        /*update localstorage*/             
                        window.localStorage.appOtherPreferences_SettleLater = tempVal;
                      }
                      else if(params[i].name == "adminIdleLogout"){

                        var tempVal = (params[i].value == 'YES'? 1: 0);

                        /*update localstorage*/             
                        window.localStorage.appOtherPreferences_AdminIdleLogout = tempVal;
                      }
                      else if(params[i].name == "KOTRelayEnabled"){

                        var tempVal = (params[i].value == 'YES'? 1: 0);

                        /*update localstorage*/             
                        window.localStorage.appOtherPreferences_KOTRelayEnabled = tempVal;
                      }
                      else if(params[i].name == "KOTRelayEnabledDefaultKOT"){

                        var tempVal = (params[i].value == 'YES'? 1: 0);

                        /*update localstorage*/             
                        window.localStorage.appOtherPreferences_KOTRelayEnabledDefaultKOT = tempVal;
                      }
                      else if(params[i].name == "defaultPrepaidName"){
                        var tempVal = params[i].value;
                        
                        /*update localstorage*/             
                        window.localStorage.systemOptionsSettings_defaultPrepaidName = tempVal;
                      }
                      else if(params[i].name == "reportEmailList"){
                        var tempVal = params[i].value;
                        
                        /*update localstorage*/             
                        window.localStorage.appOtherPreferences_reportEmailList = tempVal;
                      }
                      else if(params[i].name == "defaultDeliveryMode"){
                        var tempVal = params[i].value;
                        
                        /*update localstorage*/             
                        window.localStorage.systemOptionsSettings_defaultDeliveryMode = tempVal;
                      } 
                      else if(params[i].name == "defaultTakeawayMode"){
                        var tempVal = params[i].value;
                        
                        /*update localstorage*/             
                        window.localStorage.systemOptionsSettings_defaultTakeawayMode = tempVal;
                      } 
                      else if(params[i].name == "defaultDineMode"){

                        var tempVal = params[i].value;
                        
                        /*update localstorage*/             
                        window.localStorage.systemOptionsSettings_defaultDineMode = tempVal;
                      }
                      else if(params[i].name == "defaultKOTPrinter"){

                        var tempVal = params[i].value;
                        
                        /*update localstorage*/             
                        window.localStorage.systemOptionsSettings_defaultKOTPrinter = tempVal;
                      }
                      else if(params[i].name == "scanPayEnabled"){

                        var tempVal = params[i].value;
                        
                        /*update localstorage*/             
                        window.localStorage.scanPaySettings_scanPayEnabled = tempVal;
                      }
                      else if(params[i].name == "scanPayAPI"){

                        var tempVal = params[i].value;
                        
                        /*update localstorage*/             
                        window.localStorage.scanPaySettings_scanPayAPI = tempVal;
                      }
                      else if(params[i].name == "showDefaultQRCode"){

                        var tempVal = params[i].value;
                        
                        /*update localstorage*/             
                        window.localStorage.scanPaySettings_showDefaultQR = tempVal;
                      }
                      else if(params[i].name == "showDefaultQRTarget"){

                        var tempVal = params[i].value;
                        
                        /*update localstorage*/             
                        window.localStorage.scanPaySettings_defaultQRTarget = tempVal;
                      }         
                      else if(params[i].name == "sendMetadataToQR"){

                        var tempVal = params[i].value;
                        
                        /*update localstorage*/             
                        window.localStorage.scanPaySettings_sendMetadataToQR = tempVal;
                      }             
                    } //end FOR (Render)

                    break;
                }
              }

          }
          else{
            showToast('Not Found Error: System Options data not found. Please contact Accelerate Support.', '#e74c3c');
          }
        }
        else{
          showToast('Not Found Error: System Options data not found. Please contact Accelerate Support.', '#e74c3c');
        }
        
      },
      error: function(data) {
        showToast('System Error: Unable to read System Options data. Please contact Accelerate Support.', '#e74c3c');
      }

    });  
  
}




/* Apply KOT Relays */
function applyKOTRelays(){
  
    //Read from Server, apply changes, and save to LocalStorage
    var requestData = {
      "selector"  :{ 
                    "identifierTag": "ACCELERATE_KOT_RELAYING" 
                  },
      "fields"    : ["identifierTag", "value"]
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
          if(data.docs[0].identifierTag == 'ACCELERATE_KOT_RELAYING'){

              var settingsList = data.docs[0].value;

              var machineName = window.localStorage.dataAggregatorClient ? window.localStorage.dataAggregatorClient : '';
              if(!machineName || machineName == ''){
                machineName = 'Any';
              }

              for(var n=0; n<settingsList.length; n++){
                if(settingsList[n].systemName == machineName){
                    window.localStorage.custom_kot_relays = JSON.stringify(settingsList[n].data);
                    break;
                }
              }

          }
          else{
            showToast('Not Found Error: KOT Relays data not found. Please contact Accelerate Support.', '#e74c3c');
          }
        }
        else{
          showToast('Not Found Error: KOT Relays data not found. Please contact Accelerate Support.', '#e74c3c');
        }
      },
      error: function(data) {
        showToast('System Error: Unable to read KOT Relays data. Please contact Accelerate Support.', '#e74c3c');
      }

    });    
}




/* apply configured printers */
function applyConfiguredPrinters(){

  var printersList = window.localStorage.connectedPrintersList ? JSON.parse(window.localStorage.connectedPrintersList) : [];

  var list_bills = [];
  var list_bills_duplicate = [];
  var list_kot = [];
  var list_report = [];
  var list_view = [];


    var requestData = {
      "selector"  :{ 
                    "identifierTag": "ACCELERATE_CONFIGURED_PRINTERS" 
                  },
      "fields"    : ["identifierTag", "value"]
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
          if(data.docs[0].identifierTag == 'ACCELERATE_CONFIGURED_PRINTERS'){

            var printersList = data.docs[0].value;

            var machineName = window.localStorage.dataAggregatorClient ? window.localStorage.dataAggregatorClient : '';
            if(!machineName || machineName == ''){
                machineName = 'Any';
            }

              var printers = [];

              for(var i=0; i<printersList.length; i++){
                if(printersList[i].systemName == machineName){
                  printers = printersList[i].data;
                  break;
                }
              }


              //Sort Printers
              var n = 0;
              while(printers[n]){

                for(var p = 0; p < printers[n].actions.length; p++){
                  switch(printers[n].actions[p]){
                    case "KOT":{
                      list_kot.push({
                        "target" : printers[n].type,
                        "name" : printers[n].name,
                        "settings": {
                                      "marginsType": 1, //No Margin
                                      "printBackground": true, 
                                      "pageSize": {
                                        "height": printers[n].height > 0 ? printers[n].height * 1000 : 891000,
                                        "width": printers[n].width * 1000
                                      },
                                      "silent": true
                                    }
                      });
                      break;
                    }
                    case "BILL":{
                      list_bills.push({
                        "target" : printers[n].type,
                        "name" : printers[n].name,
                        "settings": {
                                      "marginsType": 1, //No Margin
                                      "printBackground": true, 
                                      "pageSize": {
                                        "height": printers[n].height > 0 ? printers[n].height * 1000 : 891000,
                                        "width": printers[n].width * 1000
                                      },
                                      "silent": true
                                    }
                      });
                      break;
                    }
                    case "DUPLICATE_BILL":{
                      list_bills_duplicate.push({
                        "target" : printers[n].type,
                        "name" : printers[n].name,
                        "settings": {
                                      "marginsType": 1, //No Margin
                                      "printBackground": true, 
                                      "pageSize": {
                                        "height": printers[n].height > 0 ? printers[n].height * 1000 : 891000,
                                        "width": printers[n].width * 1000
                                      },
                                      "silent": true
                                    }
                      });
                      break;
                    }
                    case "REPORT":{
                      list_report.push({
                        "target" : printers[n].type,
                        "name" : printers[n].name,
                        "settings": {
                                      "marginsType": 1, //No Margin
                                      "printBackground": true, 
                                      "pageSize": {
                                        "height": printers[n].height > 0 ? printers[n].height * 1000 : 891000,
                                        "width": printers[n].width * 1000
                                      },
                                      "silent": true
                                    }
                      });
                      break;
                    }
                    case "VIEW":{
                      list_view.push({
                        "target" : printers[n].type,
                        "name" : printers[n].name,
                        "settings": {
                                      "marginsType": 1, //No Margin
                                      "printBackground": true, 
                                      "pageSize": {
                                        "height": printers[n].height > 0 ? printers[n].height * 1000 : 891000,
                                        "width": printers[n].width * 1000
                                      },
                                      "silent": true
                                    }
                      });
                      break;
                    }
                  }
                }
                n++;
              }

              var printersMasterList = [
                {"type": "KOT", "list": list_kot},
                {"type": "BILL", "list": list_bills},
                {"type": "DUPLICATE_BILL", "list": list_bills_duplicate},
                {"type": "REPORT", "list": list_report},
                {"type": "VIEW", "list": list_view}
              ];

              window.localStorage.configuredPrintersData = JSON.stringify(printersMasterList);

          }
          else{
            showToast('Not Found Error: Configured Printers data not found. Please contact Accelerate Support.', '#e74c3c');
          }
        }
        else{
          showToast('Not Found Error: Configured Printers data not found. Please contact Accelerate Support.', '#e74c3c');
        }
        
      },
      error: function(data) {
        showToast('System Error: Unable to read Configured Printers data. Please contact Accelerate Support.', '#e74c3c');
      }

    });  
}


/* Common Functions */

function getFancyTime(time){
  var fancy = moment(time, 'hhmm').format('hh:mm A');
  return fancy == 'Invalid date' ? '--:--' : fancy;
}





