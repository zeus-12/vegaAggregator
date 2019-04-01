/*
  SERVER DETAILS
*/

var default_server_url_common = 'http://admin:admin@127.0.0.1:5984/';

var serverURL = window.localStorage.serverConnectionURL && window.localStorage.serverConnectionURL != '' ? JSON.parse(decodeURI(window.localStorage.serverConnectionURL)) : '';

var saved_server_url_manual = '';

  if(serverURL.ip != '' && serverURL.portNumber != ''){
    if(serverURL.username != '' && serverURL.password != ''){
      saved_server_url_manual = 'http://'+serverURL.username+':'+serverURL.password+'@'+serverURL.ip+':'+serverURL.portNumber+'/';
    }
    else{
      saved_server_url_manual = 'http://'+serverURL.ip+':'+serverURL.portNumber+'/';
    }
  }
  else{
    saved_server_url_manual = '';
  }


let COMMON_LOCAL_SERVER_IP = saved_server_url_manual != '' ? saved_server_url_manual : default_server_url_common;








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



/*
  SERVER CREDENTIALS
*/

function openSettingsWindow(){

  document.getElementById("serverConnectionURLDisplayModal").style.display = 'block';

  var default_ip = '127.0.0.1';
  var default_port = '5984';
  var default_username = 'admin';
  var default_password = 'admin';

  var saved_url = window.localStorage.serverConnectionURL && window.localStorage.serverConnectionURL != '' ? JSON.parse(decodeURI(window.localStorage.serverConnectionURL)) : '';
  var saved_client = window.localStorage.dataAggregatorClient ? window.localStorage.dataAggregatorClient : '';


  if(saved_url == ''){
    $('#add_custom_server_ip').val(default_ip);
    $('#add_custom_server_port').val(default_port);
    $('#add_custom_server_username').val(default_username);
    $('#add_custom_server_password').val(default_password);
  }
  else{
    $('#add_custom_server_ip').val(saved_url.ip);
    $('#add_custom_server_port').val(saved_url.portNumber);
    $('#add_custom_server_username').val(saved_url.username);
    $('#add_custom_server_password').val(saved_url.password);
  }

  $('#add_custom_slave_client_id').val(saved_client);
}

function viewServerURLHide(){
  document.getElementById("serverConnectionURLDisplayModal").style.display = 'none';
}


function setServerConnectionDetails(){

  var userURL = {
    'ip' : $('#add_custom_server_ip').val(),
    'portNumber' : $('#add_custom_server_port').val(),
    'username': $('#add_custom_server_username').val(),
    'password': $('#add_custom_server_password').val()
  };

  userURL.ip = (userURL.ip).replace(/\s/g,'');
  userURL.portNumber = (userURL.portNumber).replace(/\s/g,'');
  userURL.username = (userURL.username).replace(/\s/g,'');
  userURL.password = (userURL.password).replace(/\s/g,'');

  var default_url = 'http://admin:admin@127.0.0.1:5984/';

  if(userURL.ip != '' && userURL.portNumber != ''){
    
    window.localStorage.serverConnectionURL = encodeURI(JSON.stringify(userURL));
    
    if(userURL.username != '' && userURL.password != ''){
      COMMON_LOCAL_SERVER_IP = 'http://'+userURL.username+':'+userURL.password+'@'+userURL.ip+':'+userURL.portNumber+'/';
    }
    else{
      COMMON_LOCAL_SERVER_IP = 'http://'+userURL.ip+':'+userURL.portNumber+'/';
    }
  }
  else{
    COMMON_LOCAL_SERVER_IP = default_url;
    showToast('Error: Add valid Server Credentials', '#e74c3c');
  }


  //Slave Machine
  var machine_id = $('#add_custom_slave_client_id').val();
  machine_id = machine_id.replace(/\s/g,'');
  
  if(machine_id == ''){
    showToast('Error: Add the machine ID of the Slave Client', '#e74c3c');
    return '';
  }
  
  window.localStorage.dataAggregatorClient = machine_id;

  viewServerURLHide();
  checkClientConnection();

}


/*
  APPROVED FUNCTIONS
*/


function openApprovedFunctionsWindow(){
  
  var approval_taps = window.localStorage.approvedActionsData_tapsOrders && window.localStorage.approvedActionsData_tapsOrders != "" ? window.localStorage.approvedActionsData_tapsOrders : 0;
  var approval_actions = window.localStorage.approvedActionsData_actionRequests && window.localStorage.approvedActionsData_actionRequests != "" ? window.localStorage.approvedActionsData_actionRequests : 0;
  var approval_printRequests = window.localStorage.approvedActionsData_printRequests && window.localStorage.approvedActionsData_printRequests != "" ? window.localStorage.approvedActionsData_printRequests : 0;

  document.getElementById("approvedServicesWindow").style.display = 'block';

  //render content
  var renderContent =       '<tr role="row">'+
                               '<td style="border: none; color: #f39c12; font-family: \'Roboto\'; font-size: 18px; font-weight: 300;"><i class="fa fa-circle-o" style="margin-right: 10px;"></i>Server based KOT Printing</td>'+
                               '<td style="border: none; text-align: center; position: relative">'+(approval_printRequests == 1 ? '<button onclick="unsetApprovedService(\'PRINT_REQUESTS\')" class="btn btn-success btn-sm"><i class="fa fa-check"></i> Approved</button>' : '<button onclick="approveService(\'PRINT_REQUESTS\')" class="btn btn-default btn-sm" style="font-style: italic">Not Approved</button>')+'</td>'+
                            '</tr>'+
                            '<tr role="row">'+
                               '<td style="color: #f39c12; font-family: \'Roboto\'; font-size: 18px; font-weight: 300;"><i class="fa fa-circle-o" style="margin-right: 10px;"></i>Accept Taps Orders</td>'+
                               '<td style="text-align: center; position: relative">'+(approval_taps == 1 ? '<button onclick="unsetApprovedService(\'TAPS_ORDERS\')" class="btn btn-success btn-sm"><i class="fa fa-check"></i> Approved</button>' : '<button onclick="approveService(\'TAPS_ORDERS\')" class="btn btn-default btn-sm" style="font-style: italic">Not Approved</button>')+'</td>'+
                            '</tr>'+
                            '<tr role="row">'+
                               '<td style="color: #f39c12; font-family: \'Roboto\'; font-size: 18px; font-weight: 300;"><i class="fa fa-circle-o" style="margin-right: 10px;"></i>Accept Taps Action Requests</td>'+
                               '<td style="text-align: center; position: relative">'+(approval_actions == 1 ? '<button onclick="unsetApprovedService(\'ACTION_REQUESTS\')" class="btn btn-success btn-sm"><i class="fa fa-check"></i> Approved</button>' : '<button onclick="approveService(\'ACTION_REQUESTS\')" class="btn btn-default btn-sm" style="font-style: italic">Not Approved</button>')+'</td>'+
                            '</tr>';

  document.getElementById("approvedServicesContent").innerHTML = renderContent;

}

function hideApprovedFunctionsWindow(){
  document.getElementById("approvedServicesContent").innerHTML = '';
  document.getElementById("approvedServicesWindow").style.display = 'none';
}

function unsetApprovedService(request){
  if(request == 'PRINT_REQUESTS'){
    window.localStorage.approvedActionsData_printRequests = 0;
  }
  else if(request == 'TAPS_ORDERS'){
    window.localStorage.approvedActionsData_tapsOrders = 0;
  }
  else if(request == 'ACTION_REQUESTS'){
    window.localStorage.approvedActionsData_actionRequests = 0;
  }

  openApprovedFunctionsWindow();
  fetchApprovedServices();
}

function approveService(request){
  if(request == 'PRINT_REQUESTS'){
    window.localStorage.approvedActionsData_printRequests = 1;
  }
  else if(request == 'TAPS_ORDERS'){
    window.localStorage.approvedActionsData_tapsOrders = 1;
  }
  else if(request == 'ACTION_REQUESTS'){
    window.localStorage.approvedActionsData_actionRequests = 1;
  }

  openApprovedFunctionsWindow();
  fetchApprovedServices();
}


/*
  CONNECTED DEVICES
*/


function openDevicesWindow(){
  
  var devices_list = window.localStorage.registeredDevicesData && window.localStorage.registeredDevicesData != "" ? JSON.parse(window.localStorage.registeredDevicesData) : [];

  if(devices_list.length == 0){
    showToast('Warning: There are no registered Devices found.', '#e67e22');   
    return '';
  }

  document.getElementById("connectedDevicesSettingsWindow").style.display = 'block';

  //render content
  var renderContent = '';
  
  var n = 0;
  while(devices_list[n]){

    renderContent +=        '<tr role="row">'+
                               '<td><b style="color: #32404c; font-family:\'Oswald\'; font-size: 18px;">'+(devices_list[n].machineCustomName != "" ? devices_list[n].machineCustomName : devices_list[n].machineUID)+'</b><tag style="color: #a0a0a0; display: block; font-size: 11px;">'+devices_list[n].machineUID+'</tag></td>'+
                               '<td style="text-align: center; position: relative">'+(devices_list[n].defaultPrinters.VIEW && devices_list[n].defaultPrinters.VIEW != "" ? '<button onclick="assignDevicePrinter(\''+devices_list[n].machineUID+'\', \'VIEW\', \''+(devices_list[n].defaultPrinters.VIEW)+'\')" class="btn btn-success btn-sm"><i class="fa fa-print"></i> '+devices_list[n].defaultPrinters.VIEW+'</button>' : '<button onclick="assignDevicePrinter(\''+devices_list[n].machineUID+'\', \'VIEW\', \'\')" class="btn btn-default btn-sm" style="font-style: italic">Not Set</button>')+
                                  '<div class="blue-box" style="width: 100%; position: relative; top: -30px;" id="printerSelection_VIEW_'+devices_list[n].machineUID+'"> </div>'+
                                  '<tag class="selectModeUnset" onclick="unsetPrinterSelectionWindow(\''+devices_list[n].machineUID+'\', \'VIEW\')" id="printerSelectionUnset_VIEW_'+devices_list[n].machineUID+'">UNSET</tag>'+
                                  '<tag class="selectModeClose" onclick="closePrinterSelectionWindow(\''+devices_list[n].machineUID+'\', \'VIEW\')" id="printerSelectionClose_VIEW_'+devices_list[n].machineUID+'">CLOSE</tag>'+
                               '</td>'+
                               '<td style="text-align: center; position: relative">'+(devices_list[n].defaultPrinters.BILL && devices_list[n].defaultPrinters.BILL != "" ? '<button onclick="assignDevicePrinter(\''+devices_list[n].machineUID+'\', \'BILL\', \''+(devices_list[n].defaultPrinters.BILL)+'\')" class="btn btn-success btn-sm"><i class="fa fa-print"></i> '+devices_list[n].defaultPrinters.BILL+'</button>' : '<button onclick="assignDevicePrinter(\''+devices_list[n].machineUID+'\', \'BILL\', \'\')" class="btn btn-default btn-sm" style="font-style: italic">Not Set</button>')+
                                  '<div class="blue-box" style="width: 100%; position: relative; top: -30px;" id="printerSelection_BILL_'+devices_list[n].machineUID+'"> </div>'+
                                  '<tag class="selectModeUnset" onclick="unsetPrinterSelectionWindow(\''+devices_list[n].machineUID+'\', \'BILL\')" id="printerSelectionUnset_BILL_'+devices_list[n].machineUID+'">UNSET</tag>'+
                                  '<tag class="selectModeClose" onclick="closePrinterSelectionWindow(\''+devices_list[n].machineUID+'\', \'BILL\')" id="printerSelectionClose_BILL_'+devices_list[n].machineUID+'">CLOSE</tag>'+
                               '</td>'+
                            '</tr>';
    n++;
  }

  document.getElementById("devicesListingContent").innerHTML = renderContent;

}

function hideDevicesSettingsWindow(){
  document.getElementById("devicesListingContent").innerHTML = '';
  document.getElementById("connectedDevicesSettingsWindow").style.display = 'none';
}


function closePrinterSelectionWindow(machineUID, printerType){
  document.getElementById("printerSelection_"+printerType+"_"+machineUID).innerHTML = '';
  document.getElementById("printerSelectionUnset_"+printerType+"_"+machineUID).style.display = 'none';
  document.getElementById("printerSelectionClose_"+printerType+"_"+machineUID).style.display = 'none';
}

function unsetPrinterSelectionWindow(machineUID, action){

  document.getElementById("printerSelection_"+action+"_"+machineUID).innerHTML = '';
  document.getElementById("printerSelectionUnset_"+action+"_"+machineUID).style.display = 'none';
  document.getElementById("printerSelectionClose_"+action+"_"+machineUID).style.display = 'none';


    //Read from Server, apply changes, and save to LocalStorage
    var requestData = {
      "selector"  :{ 
                    "identifierTag": "ACCELERATE_CONFIGURED_MACHINES" 
                  },
      "fields"    : ["identifierTag", "value", "_rev"]
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
                if(machinesList[n].machineUID == machineUID){

                  if(action == 'VIEW'){
                    machinesList[n].defaultPrinters.VIEW = "";
                  }
                  else if(action == 'BILL'){
                    machinesList[n].defaultPrinters.BILL = "";
                  }

                  break;
                }
                n++;
              }



                  //Update
                  var updateData = {
                    "_rev": data.docs[0]._rev,
                    "identifierTag": "ACCELERATE_CONFIGURED_MACHINES",
                    "value": machinesList
                  }

                  $.ajax({
                    type: 'PUT',
                    url: COMMON_LOCAL_SERVER_IP+'accelerate_settings/ACCELERATE_CONFIGURED_MACHINES/',
                    data: JSON.stringify(updateData),
                    contentType: "application/json",
                    dataType: 'json',
                    timeout: 10000,
                    success: function(data) {

                        var shortlisted_devices = [];
                        var n = 0;
                        while(machinesList[n]){
                          if(machinesList[n].type && machinesList[n].type == 'TAPS_PORTABLE_DEVICE'){
                            shortlisted_devices.push(machinesList[n]);
                          }

                          if(n == machinesList.length - 1){ //Last iteration
                            window.localStorage.registeredDevicesData = JSON.stringify(shortlisted_devices);
                          }

                          n++;
                        }

                        openDevicesWindow();
                        
                    },
                    error: function(data) {
                      showToast('System Error: Update failed.', '#e74c3c');
                    }

                  });  



          }
        }
      },
      error: function(data) {
        showToast('Warning: Configured Machines data not found.', '#e67e22');     
      }
    });  

}


function assignDevicePrinter(machineUID, printerType, currentPrinterName){

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

            var printersMasterList = data.docs[0].value;

            var machineName = window.localStorage.accelerate_licence_machineUID ? window.localStorage.accelerate_licence_machineUID : '';
            if(!machineName || machineName == ''){
                machineName = 'Any';
            }

            var printersList = [];
            var view_printers = [];
            var bill_printers = [];

            for(var i = 0; i < printersMasterList.length; i++){
              if(printersMasterList[i].systemName == machineName){
                printers_list = printersMasterList[i].data;
                break;
              }
            }

            if(printers_list.length == 0){
              showToast('Warning: No printers configured.', '#e67e22');  
              return '';
            }

            var n = 0;
            while(printers_list[n]){
              for(var a = 0; a < printers_list[n].actions.length; a++){
                
                if(printers_list[n].actions[a] == "VIEW"){
                  view_printers.push(printers_list[n]);
                }
                
                if(printers_list[n].actions[a] == "BILL"){
                  bill_printers.push(printers_list[n]);
                }

              }

              n++;
            }


            switch(printerType){
              case "VIEW":{
                if(view_printers.length == 0){
                  showToast('Warning: No printers configured for printing Views.', '#e67e22'); 
                  return '';
                }
                else{
                  selectDevicePrinter(machineUID, 'VIEW', view_printers, currentPrinterName);
                }

                break;
              }
              case "BILL":{
                if(bill_printers.length == 0){
                  showToast('Warning: No printers configured for printing Bills.', '#e67e22'); 
                  return '';
                }
                else{
                  selectDevicePrinter(machineUID, 'BILL', bill_printers, currentPrinterName);
                }

                break;
              }
            }
            
          }
          else{
            showToast('Not Found Error: Configured Printers data not found.', '#e74c3c');
          }
        }
        else{
          showToast('Not Found Error: Configured Printers data not found.', '#e74c3c');
        }
        
      },
      error: function(data) {
        showToast('System Error: Unable to read Configured Printers data.', '#e74c3c');
      }

    });    
}

function selectDevicePrinter(machineUID, printingType, printers_list, currentPrinterName){

  var buttonsRender = '';
  var n = 0;
  while(printers_list[n]){
    buttonsRender += ''+
               '<button class="billModeListedButton easySelectTool_chooseBillingMode selectedMode" onclick="savePrinterAction(\''+machineUID+'\', \''+printers_list[n].name+'\', \''+printingType+'\')">'+
                  printers_list[n].name+'<span class="modeSelectionBrief">'+printers_list[n].type+'</span>'+
                  '<tag class="modeSelectionIcon">'+(printers_list[n].name == currentPrinterName && currentPrinterName != '' ? '<i class="fa fa-check"></i>' : '')+'</tag>'+
               '</button>';    
    n++;
  }



  var selection_template = ''+
   '<div id="billingModesModalHome" class="modal billModalSelect" style="display: block;">'+
      '<div class="modal-dialog" style="width: 100%; margin: 0">'+
         '<div class="modal-content" id="billingModesModalHomeContent">'+ buttonsRender +
         '</div>'+
      '</div>'+
   '</div>';  



  document.getElementById("printerSelection_"+printingType+"_"+machineUID).innerHTML = selection_template;

  document.getElementById("printerSelectionUnset_"+printingType+"_"+machineUID).style.display = 'block';
  document.getElementById("printerSelectionClose_"+printingType+"_"+machineUID).style.display = 'block';
}


function savePrinterAction(machineUID, printer_name, action){
  
    closePrinterSelectionWindow(machineUID, action);

    //Read from Server, apply changes, and save to LocalStorage
    var requestData = {
      "selector"  :{ 
                    "identifierTag": "ACCELERATE_CONFIGURED_MACHINES" 
                  },
      "fields"    : ["identifierTag", "value", "_rev"]
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
                if(machinesList[n].machineUID == machineUID){

                  if(action == 'VIEW'){
                    machinesList[n].defaultPrinters.VIEW = printer_name;
                  }
                  else if(action == 'BILL'){
                    machinesList[n].defaultPrinters.BILL = printer_name;
                  }

                  break;
                }
                n++;
              }



                  //Update
                  var updateData = {
                    "_rev": data.docs[0]._rev,
                    "identifierTag": "ACCELERATE_CONFIGURED_MACHINES",
                    "value": machinesList
                  }

                  $.ajax({
                    type: 'PUT',
                    url: COMMON_LOCAL_SERVER_IP+'accelerate_settings/ACCELERATE_CONFIGURED_MACHINES/',
                    data: JSON.stringify(updateData),
                    contentType: "application/json",
                    dataType: 'json',
                    timeout: 10000,
                    success: function(data) {

                        var shortlisted_devices = [];
                        var n = 0;
                        while(machinesList[n]){
                          if(machinesList[n].type && machinesList[n].type == 'TAPS_PORTABLE_DEVICE'){
                            shortlisted_devices.push(machinesList[n]);
                          }

                          if(n == machinesList.length - 1){ //Last iteration
                            window.localStorage.registeredDevicesData = JSON.stringify(shortlisted_devices);
                          }

                          n++;
                        }

                        openDevicesWindow();
                        
                    },
                    error: function(data) {
                      showToast('System Error: Update failed.', '#e74c3c');
                    }

                  });  



          }
        }
      },
      error: function(data) {
        showToast('Warning: Configured Machines data not found.', '#e67e22');     
      }
    });  

}



function checkClientConnection(){

    var dataAggregatorClient = window.localStorage.dataAggregatorClient ? window.localStorage.dataAggregatorClient : '';

    if(dataAggregatorClient == ''){
      document.getElementById("applicationErrorLock").style.display = 'block';
        showToast('Error: Please check the Slave Client ID', '#8e44ad');
      return '';
    }

    showLoading(10000, 'Configuring the System'); 

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

        hideLoading();

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
                  applyBillLayout();
                  applyKOTRelays();
                  applyConfiguredPrinters();
                  loadRegisteredDevices();

                  //STARTING POINT: this would later call initalise function
                  preloadBillingData(); 

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
        hideLoading();
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
    //console.log('Am Secretly running...')
  }, 1000); 

}



function hideLoading(){
  clearInterval(loadingLapsedInterval);
  document.getElementById("generalLoadingModal").style.display = 'none';
  document.getElementById("generalLoaderCount").innerHTML = '';
  document.getElementById("generalLoaderText").innerHTML = 'Loading...';
}


/* Load Registered Devices */
function loadRegisteredDevices(){

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
              var shortlisted_devices = [];

              window.localStorage.registeredDevicesData = '';

              var n = 0;
              while(machinesList[n]){
                if(machinesList[n].type && machinesList[n].type == 'TAPS_PORTABLE_DEVICE'){
                  shortlisted_devices.push(machinesList[n]);
                }

                if(n == machinesList.length - 1){ //Last iteration
                  window.localStorage.registeredDevicesData = JSON.stringify(shortlisted_devices);
                }

                n++;
              }

          }
        }
      },
      error: function(data) {
        showToast('Warning: Configured Machines data not found.', '#e67e22');     
      }
    });    
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



/* Apply Bill Layout */
function applyBillLayout(){

    var requestData = {
      "selector"  :{ 
                    "identifierTag": "ACCELERATE_BILL_LAYOUT" 
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
          if(data.docs[0].identifierTag == 'ACCELERATE_BILL_LAYOUT'){

              var layoutData = data.docs[0].value;

              var n = 0;
              while(layoutData[n]){
                
                switch(layoutData[n].name){
                  case "data_custom_header_image":{
                    window.localStorage.bill_custom_header_image = layoutData[n].value;
                    break;
                  }
                  case "data_custom_top_right_name":{
                    window.localStorage.bill_custom_top_right_name = layoutData[n].value;
                    break;
                  }
                  case "data_custom_top_right_value":{
                    window.localStorage.bill_custom_top_right_value = layoutData[n].value;
                    break;
                  }
                  case "data_custom_bottom_pay_heading":{
                    window.localStorage.bill_custom_bottom_pay_heading = layoutData[n].value;
                    break;
                  }
                  case "data_custom_bottom_pay_brief":{
                    window.localStorage.bill_custom_bottom_pay_brief = layoutData[n].value;
                    break;
                  }
                  case "data_custom_footer_comments":{
                    window.localStorage.bill_custom_footer_comments = layoutData[n].value;
                    break;
                  }
                  case "data_custom_footer_address":{
                    window.localStorage.bill_custom_footer_address = layoutData[n].value;
                    break;
                  }
                  case "data_custom_footer_contact":{
                    window.localStorage.bill_custom_footer_contact = layoutData[n].value;
                    break;
                  }
                }

                n++;
              }

          }
          else{
            showToast('Not Found Error: Billing Layout data not found. Please contact Accelerate Support.', '#e74c3c');
          }
        }
        else{
          showToast('Not Found Error: Billing Layout data not found. Please contact Accelerate Support.', '#e74c3c');
        }
        
      },
      error: function(data) {
        showToast('System Error: Billing Layout data not found. Please contact Accelerate Support.', '#e74c3c');
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





