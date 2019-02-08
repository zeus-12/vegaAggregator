

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



function printEditedKOT(existing_kot, new_kot){
//    console.log(existing_kot, new_kot)

  //Process Next KOT
  setTimeout(function(){
    initialisePunching();
  }, 5000);

}


function printFreshKOT(new_kot){

    var obj = new_kot;

    initialiseKOTPrinting();

    

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
