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
    
    document.getElementById("statusTitle").innerHTML = "Aggregating Orders";
    $("#mainBGImage").attr("src","assets/images/gathering_orders.gif");
    $("#statusTitle").addClass("blink_me");

    initialisePunching();
}

function initialisePunching(){

        if(PAUSE_FLAG){
            return '';
        }

          console.log('Checking for orders...')

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
                          success: function(oldKOTData) {
                            if(data._id != ""){
                                printEditedKOT(oldKOTData, orderData);
                            }
                            else{
                              showToast('System Error: KOT is not found. Please contact Accelerate Support if problem persists.', '#e74c3c');
                            }
                          },
                          error: function(data) {
                            //KOT not found 
                            showToast('System Error: KOT is not found. Please contact Accelerate Support if problem persists.', '#e74c3c');
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
          generateEditedKOTAfterProcess(originalData.KOTNumber, changed_cart_products, comparisonResult, hasRestrictedEdits)
        } 

        j++;
      }
    }

  }




  function generateEditedKOTAfterProcess(kotID, newCart, compareObject, hasRestrictedEdits){

      var isUserAnAdmin = false;

      if(compareObject.length == 0){
        //Process Next KOT
        setTimeout(function(){ initialisePunching(); }, 5000);
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
            kot.timeKOT = moment().format('hhmm');
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


            var minimum_cooking_time = 0;

            for(var t = 0; t < compareObject.length; t++){
              if(compareObject[t].change == "NEW_ITEM" || compareObject[t].change == "QUANTITY_INCREASE"){
            
            /* min cooking time */
            if(compareObject[t].cookingTime && compareObject[t].cookingTime > 0){
              if(minimum_cooking_time <= compareObject[t].cookingTime){
                minimum_cooking_time = compareObject[t].cookingTime;
              }
            }

              }
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
                       
                          //Show minimum cooking time...
                          var display_minimum_cooking_time_flag = window.localStorage.appOtherPreferences_minimumCookingTime && window.localStorage.appOtherPreferences_minimumCookingTime == 1 ? true : false;

                          if(display_minimum_cooking_time_flag && minimum_cooking_time > 0){
                            flashMinimumCookingTime(minimum_cooking_time);
                          }


                          sendKOTChangesToPrinterPreProcess(kot, compareObject);

                          showToast('Changed KOT #'+kot.KOTNumber+' generated Successfully', '#27ae60');

                          removeAlreadyPrintedKOT(super_memory_id, super_memory_rev);
                      
                    },
                    error: function(data) {
                        showToast('System Error: Unable to update the Order. Please contact Accelerate Support.', '#e74c3c');
                    }
                  });         

          }
          else{
            showToast('Not Found Error: #'+kotID+' not found on Server. Please contact Accelerate Support.', '#e74c3c');
          }
        },
        error: function(data) {
          showToast('System Error: Unable to read KOTs data. Please contact Accelerate Support.', '#e74c3c');
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

                            for(var i = 0; i < compareObject.length; i++){
                              if(compareObject[i].category == relayRuleList[n].name && relayRuleList[n].printer != ''){
                                relayRuleList[n].subcart.push(compareObject[i]);
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
                          while(compareObject[m]){

                            if(relayRuleList.length != 0){
                              for(var i = 0; i < relayRuleList.length; i++){
                                if(compareObject[m].category == relayRuleList[i].name && relayRuleList[i].printer != ''){
                                  //item found
                                  break;
                                }

                                if(i == relayRuleList.length - 1){ //last iteration and item not found
                                  relaySkippedItems.push(compareObject[m])
                                }
                              } 
                            }
                            else{ //no relays set, skip all items
                              relaySkippedItems.push(compareObject[m]);
                            }

                            if(m == compareObject.length - 1){

                              if(relaySkippedItems.length > 0){
                                //Print skipped items (non-relayed items)
                                var defaultKOTPrinter = window.localStorage.systemOptionsSettings_defaultKOTPrinter ? window.localStorage.systemOptionsSettings_defaultKOTPrinter : '';
                                
                                if(defaultKOTPrinter == ''){
                                  sendKOTChangesToPrinter(kot, relaySkippedItems);
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
                                      sendKOTChangesToPrinter(kot, relaySkippedItems, selected_printer);
                                    }
                                    else{
                                      sendKOTChangesToPrinter(kot, compareObject, selected_printer);
                                    }

                                    break;
                                  }
                              }
                              }
                              

                              if(g == allConfiguredPrintersList.length - 1){
                                if(selected_printer == ''){ //No printer found, print on default!
                                  if(isKOTRelayingEnabledOnDefault){
                                      sendKOTChangesToPrinter(kot, relaySkippedItems, default_set_KOT_printer_data);
                                    }
                                    else{
                                        sendKOTChangesToPrinter(kot, compareObject, default_set_KOT_printer_data);
                                      }
                                }
                              }
                              
                              g++;
                            }
                                }

                              }
                              else{
                        if(!isKOTRelayingEnabledOnDefault){
                              sendKOTChangesToPrinter(kot, compareObject, default_set_KOT_printer_data);
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

                      console.log('*Relay Print - Round '+index+' on '+allPrintersList[index].name)

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

                            if(relayedItems.length > 0){
                              
                              sendKOTChangesToPrinter(kot, relayedItems, allPrintersList[index].template);
                              
                              if(allPrintersList[index+1]){
                                startRelayPrinting(index+1);
                              }
                              else{
                                finishPrintingAnimation();
                                  //Process Next KOT
                                  setTimeout(function(){ initialisePunching(); }, 5000);
                              }
                            }
                            else{
                              if(allPrintersList[index+1]){
                                startRelayPrinting(index+1);
                              }
                              else{
                                  finishPrintingAnimation();
                                  //Process Next KOT
                                  setTimeout(function(){ initialisePunching(); }, 5000);
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
                          sendKOTChangesToPrinter(kot, compareObject);
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
                                      sendKOTChangesToPrinter(kot, compareObject, selected_printer);
                                      break;
                                    }
                                }
                                }
                                

                                if(g == allConfiguredPrintersList.length - 1){
                                  if(selected_printer == ''){ //No printer found, print on default!
                                    sendKOTChangesToPrinter(kot, compareObject);
                                  }
                                }
                                
                                g++;
                              }
                        }


                          //Process Next KOT
                          setTimeout(function(){ initialisePunching(); }, 5000);
                          
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
                                    "time": new_kot.timeKOT != '' ? moment(new_kot.timeKOT, 'hhmm').format('hh:mm a') : moment(new_kot.timePunch, 'hhmm').format('hh:mm A')
                                });
                                window.localStorage.orderStream = JSON.stringify(order_stream);
                            }
                            else{
                                order_stream.push({
                                    "KOTNumber" : new_kot.KOTNumber,
                                    "table": new_kot.table,
                                    "steward": new_kot.stewardName,
                                    "time": new_kot.timeKOT != '' ?  moment(new_kot.timeKOT, 'hhmm').format('hh:mm a') : moment(new_kot.timePunch, 'hhmm').format('hh:mm A')
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
                                                            //Process Next KOT
                                                            setTimeout(function(){ initialisePunching(); }, 5000);
                                                            finishPrintingAnimation();
                                                        }
                                                    }
                                                    else{
                                                        if(allPrintersList[index+1]){
                                                            startRelayPrinting(index+1);
                                                        }
                                                        else{
                                                            //Process Next KOT
                                                            setTimeout(function(){ initialisePunching(); }, 5000);
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


                                //Process Next KOT
                                setTimeout(function(){
                                    initialisePunching();
                                  }, 5000);
                                    
                            }
                    } //end - initialise KOT Prints
}


function showPrintingAnimation(){

}

function finishPrintingAnimation(){

}


