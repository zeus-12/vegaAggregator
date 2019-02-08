

function  initialisePunching(){

    console.log('test')

          $.ajax({
            type: 'GET',
            url: COMMON_LOCAL_SERVER_IP+'/accelerate_taps_orders/_design/orders/_view/view?include_docs=true',
            contentType: "application/json",
            dataType: 'json',
            timeout: 10000,
            success: function(data) {

              if(data.total_rows == 0){
                    document.getElementById("pendingOrderMessage").innerHTML = 'No Pending Orders';
                    
                    //Process Next KOT
                    setTimeout(function(){
                        initialisePunching();
                    }, 5000);

              }
              else{
                    //Update Message
                    document.getElementById("pendingOrderMessage").innerHTML = data.total_rows+' Pending Order'+(data.total_rows > 1 ? 's': '');
              
                    var orderData = data.rows[0].doc;

                    if(orderData.KOTNumber != ''){ //Editing Order case..

                        var kotID = orderData.KOTNumber;

                        //Check if it's already existing KOT (editing or not)
                        var accelerate_licencee_branch = window.localStorage.accelerate_licence_branch ? window.localStorage.accelerate_licence_branch : 'NAVALUR'; 
                        if(!accelerate_licencee_branch || accelerate_licencee_branch == ''){
                          showToast('Invalid Licence Error: KOT can not be generated. Please contact Accelerate Support if problem persists.', '#e74c3c');
                          return '';
                        }

                        var kot_request_data = accelerate_licencee_branch +"_KOT_"+ kotID;

                        $.ajax({
                          type: 'GET',
                          url: COMMON_LOCAL_SERVER_IP+'/accelerate_kot/'+kot_request_data,
                          timeout: 10000,
                          success: function(newKOTData) {
                            if(data._id != ""){
                                printEditedKOT(orderData, newKOTData);
                            }
                          },
                          error: function(data) {
                            //KOT not found 
                          }
                        });
                    }
                    else{
                        printFreshKOT(orderData); //Fresh Order case..
                    }
                    
              }
            },
            error: function(data){
                showToast('Local Server not responding. Please try again.', '#e74c3c');
            }

          });           
}

initialisePunching();
refreshRecentOrdersStream();



function printEditedKOT(existing_kot, new_kot){
//    console.log(existing_kot, new_kot)

  //Process Next KOT
  setTimeout(function(){
    initialisePunching();
  }, 5000);

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


function removeAlreadyPrintedKOT(id, revID){

        $.ajax({
          type: 'DELETE',
          url: COMMON_LOCAL_SERVER_IP+'/accelerate_taps_orders/'+id+'?rev='+revID,
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






function printFreshKOT(new_kot){

           var obj = new_kot;

           var super_memory_id = obj._id;
           var super_memory_rev = obj._rev;

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
                          

                            //Render order stream
                            var order_stream = window.localStorage.orderStream && window.localStorage.orderStream != '' ? JSON.parse(window.localStorage.orderStream) : [];

                            if(order_stream.length < 3){
                                order_stream.push({
                                    "KOTNumber" : new_kot.KOTNumber,
                                    "table": new_kot.table,
                                    "steward": new_kot.stewardName,
                                    "time": new_kot.timeKOT != '' ? moment(new_kot.timeKOT, 'hhmm').format('hh:mm A') : moment(new_kot.timePunch, 'hhmm').format('hh:mm A')
                                });
                                window.localStorage.orderStream = JSON.stringify(order_stream);
                            }
                            else{
                                order_stream.push({
                                    "KOTNumber" : new_kot.KOTNumber,
                                    "table": new_kot.table,
                                    "steward": new_kot.stewardName,
                                    "time": new_kot.timeKOT != '' ?  moment(new_kot.timeKOT, 'hhmm').format('hh:mm A') : moment(new_kot.timePunch, 'hhmm').format('hh:mm A')
                                });

                                var new_stream = order_stream.slice(1, 4);
                                window.localStorage.orderStream = JSON.stringify(new_stream);
                            }


                            refreshRecentOrdersStream();
                            initialiseKOTPrinting();
                            removeAlreadyPrintedKOT(super_memory_id, super_memory_rev);

                          }
                        },
                        error: function(data) {
                            showToast('System Error: Unable to update KOT Index. Next KOT Number might be faulty. Please contact Accelerate Support.', '#e74c3c');
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
                              showToast('System Error: Unable to update KOT Index. Next KOT Number might be faulty. Please contact Accelerate Support.', '#e74c3c');
                            }
                          });
            
            },
            error: function(data){
                showToast('Unable to assign KOT Number. Please try again.', '#e74c3c');
            }
        });



                    //Send KOT for Printing
                    function initialiseKOTPrinting(){

                            //Do not run if locked
                            if($('#applicationErrorLock').is(':visible')) {
                                return '';
                            }
                            else if($('#serverErrorLock').is(':visible')) {
                                return '';
                            }
                            
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

                                                    var defaultKOTPrinter = window.localStorage.systemOptionsSettings_defaultKOTPrinter ? window.localStorage.systemOptionsSettings_defaultKOTPrinter : '';
                                                    
                                                    if(defaultKOTPrinter == ''){
                                                        if(isKOTRelayingEnabledOnDefault){ //relay KOT on default printer as well. otherwise, complete order will be printed on default printer.
                                                            sendToPrinter(relay_skipped_obj, 'KOT', default_set_KOT_printer_data);
                                                        }
                                                        else{
                                                            var preserved_order = obj;
                                                            preserved_order.cart = original_order_object_cart;
                                                            
                                                            sendToPrinter(preserved_order, 'KOT', default_set_KOT_printer_data);
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
                                                                        sendToPrinter(relay_skipped_obj, 'KOT', selected_printer);
                                                                    }
                                                                    else{

                                                                        var preserved_order = obj;
                                                                        preserved_order.cart = original_order_object_cart;

                                                                        sendToPrinter(preserved_order, 'KOT', selected_printer);
                                                                    }

                                                                    break;
                                                                }
                                                            }
                                                          }
                                                          

                                                          if(g == allConfiguredPrintersList.length - 1){
                                                            if(selected_printer == ''){ //No printer found, print on default!
                                                                if(isKOTRelayingEnabledOnDefault){
                                                                    sendToPrinter(relay_skipped_obj, 'KOT', default_set_KOT_printer_data);
                                                                }
                                                                else{
                                                                    var preserved_order = obj;
                                                                    preserved_order.cart = original_order_object_cart;

                                                                    sendToPrinter(preserved_order, 'KOT', default_set_KOT_printer_data);
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
                                                    
                                                    sendToPrinter(preserved_order, 'KOT', default_set_KOT_printer_data);
                                                }                                               
                                            }

                                            printRelayedKOT(relayRuleList); 
                                            
                                        }

                                        m++;
                                    }
                                }

                                function printRelayedKOT(relayedList){

                                    var allConfiguredPrintersList = window.localStorage.configuredPrintersData ? JSON.parse(window.localStorage.configuredPrintersData) : [];
                                    var g = 0;
                                    var allPrintersList = [];

                                    while(allConfiguredPrintersList[g]){
                                      
                                      for(var a = 0; a < allConfiguredPrintersList[g].list.length; a++){
                                        if(!isItARepeat(allConfiguredPrintersList[g].list[a].name)){
                                          allPrintersList.push({
                                            "name": allConfiguredPrintersList[g].list[a].name,
                                            "target": allConfiguredPrintersList[g].list[a].target,
                                            "template": allConfiguredPrintersList[g].list[a]
                                          });
                                          }
                                      }

                                      if(g == allConfiguredPrintersList.length - 1){
                                        startRelayPrinting(0);
                                      }
                                      
                                      g++;
                                    }

                                    function isItARepeat(name){
                                      var h = 0;
                                      while(allPrintersList[h]){
                                        if(allPrintersList[h].name == name){
                                          return true;
                                        }

                                        if(h == allPrintersList.length - 1){ // last iteration
                                          return false;
                                        }
                                        h++;
                                      }
                                    }

                                    function startRelayPrinting(index){
                                        console.log(allPrintersList)

                                        console.log('Relay Print - Round '+index+' on '+allPrintersList[index].name)

                                        if(index == 0){
                                            showPrintingAnimation();
                                        }

                                        //add some delay
                                        setTimeout(function(){ 
                                        
                                            var relayedItems = [];
                                            for(var i = 0; i < relayedList.length; i++){
                                                if(relayedList[i].subcart.length > 0 && relayedList[i].printer == allPrintersList[index].name){
                                                    relayedItems = relayedItems.concat(relayedList[i].subcart)  
                                                }

                                                if(i == relayedList.length - 1){ //last iteration
                                                    var relayedNewObj = obj;
                                                    relayedNewObj.cart = relayedItems;

                                                    if(relayedItems.length > 0){
                                                        
                                                        sendToPrinter(relayedNewObj, 'KOT', allPrintersList[index].template);
                                                        
                                                        if(allPrintersList[index+1]){
                                                            startRelayPrinting(index+1);
                                                        }
                                                        else{
                                                            finishPrintingAnimation();
                                                        }
                                                    }
                                                    else{
                                                        if(allPrintersList[index+1]){
                                                            startRelayPrinting(index+1);
                                                        }
                                                        else{
                                                            finishPrintingAnimation();
                                                        }
                                                    }
                                                }
                                            }

                                        }, 999);
                                    }

                                }
                            }
                            else{ //no relay (normal case)
                                
                                var defaultKOTPrinter = window.localStorage.systemOptionsSettings_defaultKOTPrinter ? window.localStorage.systemOptionsSettings_defaultKOTPrinter : '';
                                
                                if(defaultKOTPrinter == ''){
                                    sendToPrinter(obj, 'KOT');
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
                                                sendToPrinter(obj, 'KOT', selected_printer);
                                                break;
                                            }
                                        }
                                      }
                                      

                                      if(g == allConfiguredPrintersList.length - 1){
                                        if(selected_printer == ''){ //No printer found, print on default!
                                            sendToPrinter(obj, 'KOT');
                                        }
                                      }
                                      
                                      g++;
                                    }
                                }
                                    
                            }

                    } //end - initialise KOT Prints


  //Process Next KOT
  setTimeout(function(){
    initialisePunching();
  }, 5000);
}


function showPrintingAnimation(){

}
