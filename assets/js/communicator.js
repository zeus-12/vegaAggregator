const ipc = require('electron').ipcRenderer;

/*
   PRINT BILLS
*/

function sendToPrinter(orderObject, type, optionalTargetPrinter){

 //return '';

 console.log('orderObject')

 var allActivePrinters = window.localStorage.configuredPrintersData ? JSON.parse(window.localStorage.configuredPrintersData) : [];

 if(allActivePrinters.length == 0){
   showToast('Print Error: No configured printers found. Print failed. Please contact Accelerate Support.', '#e74c3c');
   return '';
 }


/*
   PRINTING KOT
*/

if(type == 'KOT'){

//Render Items
var total_items = 0;
var total_quantity = 0;

/* min cooking time */
var minimum_cooking_time = 0;

var itemsList = '';
var n = 0;
while(orderObject.cart[n]){

   //Minimum cooking time
   if(orderObject.cart[n].cookingTime && orderObject.cart[n].cookingTime > 0){
      if(minimum_cooking_time <= orderObject.cart[n].cookingTime){
         minimum_cooking_time = orderObject.cart[n].cookingTime;
      }
   }

   itemsList +='<tr>'+
                  '<td><span style="font-size:18px">'+orderObject.cart[n].name + (orderObject.cart[n].isCustom ? ' ('+orderObject.cart[n].variant+')' : '')+'</span>'+
                  (orderObject.cart[n].comments && orderObject.cart[n].comments != '' ? '<newcomments class="itemComments">- '+orderObject.cart[n].comments+'</newcomments>' : '')+
                  '</td>'+
                  '<td style="text-align: right">'+
                     '<p>'+
                        '<tag class="itemQuantity" style="font-size:18px">'+orderObject.cart[n].qty+'</tag>'+
                     '</p>'+
                  '</td>'+
               '</tr>';

   total_quantity += orderObject.cart[n].qty;

   n++;
}

total_items = n;


var kot_header_content = '';
var kot_footer_content = '';

if(orderObject.orderDetails.modeType == 'DELIVERY' || orderObject.orderDetails.modeType == 'PARCEL'){
   
   kot_header_content = ''+
      '<div class="KOTHeader" style="min-height: unset">'+
         '<table style="width: 100%">'+
            '<col style="width: 30%">'+
            '<col style="width: 40%">'+
            '<col style="width: 30%">'+
            '<tr>'+
               '<td style="vertical-align: top">'+
                  '<p>'+
                     '<tag class="subLabel">KOT NO</tag>'+
                     '<tag class="KOTNumber">'+orderObject.KOTNumber+'</tag>'+
                  '</p>'+
               '</td>'+
               '<td style="vertical-align: top">'+
                  '<p style="margin: 0">'+
                     '<tag class="serviceType" style="font-size: 16px; font-weight: bold;">'+(orderObject.orderDetails.modeType == 'DELIVERY' ? 'PARCEL' : 'PARCEL <b style="font-size: 18px; padding: 1px 5px; background: #000; font-weight: bold; color: #FFF; border-radius: 2px;">#'+orderObject.table+'</b>')+'</tag>'+
                  '</p>'+
               '</td>'+
               '<td style="vertical-align: top;">'+
                  '<p style=" text-align: right; float: right">'+
                     '<tag class="subLabel">TIME</tag>'+
                     '<tag class="timeStamp" style="font-size: 14px; font-weight: bold;">'+(orderObject.timeKOT == "" ? getFancyTime(orderObject.timePunch) : getFancyTime(orderObject.timeKOT))+'</tag>'+
                  '</p>'+
               '</td>'+
            '</tr>'+
         '</table>'+
      '</div>';

   kot_footer_content = '<div class="billBottomContainer">'+
                           '<div style="text-align: center; font-size:14px; font-weight: bold; background: #000; color: #FFF; padding: 3px 0">'+ orderObject.orderDetails.mode + ' - <b style="font-size: 16px;">'+orderObject.KOTNumber+'</b>'+
                           '</div>'+   
                        '</div>'; 

   //Show minimum cooking time...
   var flag_one_enabled = window.localStorage.appOtherPreferences_minimumCookingTime ? window.localStorage.appOtherPreferences_minimumCookingTime : 0;
   var flag_two_print = window.localStorage.appOtherPreferences_expectedReadyTime ? window.localStorage.appOtherPreferences_expectedReadyTime : 0;
           
   if((flag_one_enabled == 1 && flag_two_print == 1) && orderObject.orderDetails.modeType == 'PARCEL' && minimum_cooking_time > 0){
      kot_footer_content += '<div class="billBottomContainer">'+
                              '<div style="text-align: center; font-size:12px; text-transform:uppercase; background: #FFF; color: #000; padding: 3px 0">Order to be ready by <b style="font-size: 14px; padding: 0 4px; background:#000; color: #FFF">'+addMinutesToTime(minimum_cooking_time, orderObject.timePunch)+'</b>'+
                              '</div>'+   
                           '</div>'; 
   }
}
else if(orderObject.orderDetails.modeType == 'TOKEN'){

   kot_header_content = ''+
      '<div class="KOTHeader" style="min-height: unset">'+
         '<table style="width: 100%">'+
            '<col style="width: 30%">'+
            '<col style="width: 40%">'+
            '<col style="width: 30%">'+
            '<tr>'+
               '<td style="vertical-align: top">'+
                  '<p>'+
                     '<tag class="subLabel">KOT NO</tag>'+
                     '<tag class="KOTNumber">'+orderObject.KOTNumber+'</tag>'+
                  '</p>'+
               '</td>'+
               '<td style="vertical-align: top">'+
                  '<p style="margin: 0">'+
                     '<tag class="serviceType" style="font-size: 16px; font-weight: bold;">SELF SERVICE <b style="font-size: 18px; padding: 1px 5px; background: #000; font-weight: bold; color: #FFF; border-radius: 2px;">'+orderObject.table+'</b></tag>'+
                  '</p>'+
               '</td>'+
               '<td style="vertical-align: top;">'+
                  '<p style=" text-align: right; float: right">'+
                     '<tag class="subLabel">TIME</tag>'+
                     '<tag class="timeStamp" style="font-size: 14px; font-weight: bold;">'+(orderObject.timeKOT == "" ? getFancyTime(orderObject.timePunch) : getFancyTime(orderObject.timeKOT))+'</tag>'+
                  '</p>'+
               '</td>'+
            '</tr>'+
         '</table>'+
      '</div>';  

   //Show minimum cooking time...
   var flag_one_enabled = window.localStorage.appOtherPreferences_minimumCookingTime ? window.localStorage.appOtherPreferences_minimumCookingTime : 0;
   var flag_two_print = window.localStorage.appOtherPreferences_expectedReadyTime ? window.localStorage.appOtherPreferences_expectedReadyTime : 0;
           
   if((flag_one_enabled == 1 && flag_two_print == 1) && minimum_cooking_time > 0){
      kot_footer_content += '<div class="billBottomContainer">'+
                              '<div style="text-align: center; font-size:12px; text-transform:uppercase; background: #FFF; color: #000; padding: 3px 0">Order to be ready by <b style="font-size: 14px; padding: 0 4px; background:#000; color: #FFF">'+addMinutesToTime(minimum_cooking_time, orderObject.timePunch)+'</b>'+
                              '</div>'+   
                           '</div>'; 
   }

}
else if(orderObject.orderDetails.modeType == 'DINE'){

   kot_header_content = ''+
      '<div class="KOTHeader" style="min-height: unset">'+
         '<table style="width: 100%">'+
            '<col style="width: 30%">'+
            '<col style="width: 40%">'+
            '<col style="width: 30%">'+
            '<tr>'+
               '<td style="vertical-align: top">'+
                  '<p>'+
                     '<tag class="subLabel">KOT NO</tag>'+
                     '<tag class="KOTNumber">'+orderObject.KOTNumber+'</tag>'+
                  '</p>'+
               '</td>'+
               '<td style="vertical-align: top">'+
                  '<p style="margin: 0">'+
                     '<tag class="serviceType" style="font-size: 16px; font-weight: bold;">ON TABLE <b style="font-size: 18px; padding: 1px 5px; background: #000; font-weight: bold; color: #FFF; border-radius: 2px;">'+orderObject.table+'</b></tag>'+
                  '</p>'+
               '</td>'+
               '<td style="vertical-align: top;">'+
                  '<p style=" text-align: right; float: right">'+
                     '<tag class="subLabel">TIME</tag>'+
                     '<tag class="timeStamp" style="font-size: 14px; font-weight: bold;">'+(orderObject.timeKOT == "" ? getFancyTime(orderObject.timePunch) : getFancyTime(orderObject.timeKOT))+'</tag>'+
                  '</p>'+
               '</td>'+
            '</tr>'+
         '</table>'+
      '</div>';  

   if(orderObject.stewardName != ""){

      kot_footer_content = '<div class="billBottomContainer" style="background: #FFF">'+
                              '<div style="padding: 2px 0; color: #000; text-align: center;">'+
                                 '<tag style="font-size: 8px; font-weight: 300; text-transform: uppercase; letter-spacing: 2px; font-family: sans-serif;">PUNCHED BY </tag>'+
                                 '<b style="text-transform: uppercase; font-size:11px;">'+orderObject.stewardName+'</b>'+
                              '</div>'+   
                           '</div>';
   } 
}

var html_template = kot_header_content +
      '<div class="KOTContent">'+
         '<table style="width: 100%">'+
            '<col style="width: 85%">'+
            '<col style="width: 15%">'+ itemsList +
         '</table>'+
      '</div>'+
      '<div class="KOTSummary">'+
         '<table style="width: 100%">'+
            '<col style="width: 80%">'+
            '<col style="width: 20%">'+
            '<tr>'+
               '<td>Number of Items</td>'+
               '<td style="text-align: right;">'+total_items+'</td>'+
            '</tr>'+
            '<tr>'+
               '<td>Total Quantity</td>'+
               '<td style="text-align: right;">'+total_quantity+'</td>'+
            '</tr>'+
         '</table>'+
      '</div>'+
      '<div class="KOTSpecialComments" style="'+(orderObject.specialRemarks != '' ? '' : 'display: none')+'">'+
       '<table style="width: 100%">'+
            '<col style="width: 100%">'+
            '<tr>'+
               '<td style="vertical-align: top">'+
                     '<p>'+
                        '<tag class="subLabel">SPECIAL COMMENTS</tag>'+
                        '<tag class="commentsSubText">'+orderObject.specialRemarks+'</tag>'+
                     '</p>'+  
               '</td>'+
            '</tr>'+
         '</table>'+
      '</div>'+
      '<div class="KOTSpecialComments" style="'+(orderObject.allergyInfo.length > 0 ? '' : 'display: none')+'">'+
       '<table style="width: 100%">'+
            '<col style="width: 100%">'+
            '<tr>'+
               '<td style="vertical-align: top">'+
                     '<p>'+
                        '<tag class="subLabel">ALLERGY WARNING</tag>'+
                        '<tag class="commentsSubText">'+((orderObject.allergyInfo).toString())+'</tag>'+
                     '</p>'+  
               '</td>'+
            '</tr>'+
         '</table>'+
      '</div>' + kot_footer_content;

      postContentToTemplate(html_template);
}




   function postContentToTemplate(html_template){

        if(type == 'DUPLICATE_KOT' || type == 'CANCELLED_KOT') //TWEAK -- Redirect Cancelled Order KOTs and Duplicate KOTs to Kitchen.
            type = 'KOT';

        //ipc.send('print-to-pdf', html_template);
        var selected_printer = null;

         if(!optionalTargetPrinter || optionalTargetPrinter == '' || optionalTargetPrinter == undefined){
            var b = 0;
            while(allActivePrinters[b]){
               if(allActivePrinters[b].type == type){
                  selected_printer = allActivePrinters[b].list[0];
                  break;
               }
               b++;
            }
         }
         else if(optionalTargetPrinter != ''){
            selected_printer = optionalTargetPrinter;
         }

        if(selected_printer && selected_printer != '' && selected_printer != null){
            ipc.send("printBillDocument", html_template, selected_printer);
        }
        else{
            showToast('Print Error: Print failed. No printer configured for '+type, '#e74c3c');   
            return '';
        }
   }

}




function sendKOTChangesToPrinter(orderObject, compareObject, optionalTargetPrinter){
 
 var allActivePrinters = window.localStorage.configuredPrintersData ? JSON.parse(window.localStorage.configuredPrintersData) : [];

 if(allActivePrinters.length == 0){
   showToast('Print Error: No configured printers found. Print failed. Please contact Accelerate Support.', '#e74c3c');
   return '';
 }

//Fixed data

var data_custom_header_image = window.localStorage.bill_custom_header_image ? window.localStorage.bill_custom_header_image : '';

var data_custom_top_right_name = window.localStorage.bill_custom_top_right_name ? window.localStorage.bill_custom_top_right_name : '';
var data_custom_top_right_value = window.localStorage.bill_custom_top_right_value ? window.localStorage.bill_custom_top_right_value : '';

var data_custom_bottom_pay_heading = window.localStorage.bill_custom_bottom_pay_heading ? window.localStorage.bill_custom_bottom_pay_heading : '';
var data_custom_bottom_pay_brief = window.localStorage.bill_custom_bottom_pay_brief ? window.localStorage.bill_custom_bottom_pay_brief : '';
var data_custom_bottom_pay_url = ""; //Auto generate Payment Link

var data_custom_footer_comments = window.localStorage.bill_custom_footer_comments ? window.localStorage.bill_custom_footer_comments : '';

var data_custom_footer_address = window.localStorage.bill_custom_footer_address ? window.localStorage.bill_custom_footer_address : '';
var data_custom_footer_contact = window.localStorage.bill_custom_footer_contact ? window.localStorage.bill_custom_footer_contact : '';


/*
   PRINTING EDITED KOT
*/


//Render Items
var total_items = 0;
var total_quantity = 0;

var itemsList = '';
var n = 0;
while(compareObject[n]){ 

   if(compareObject[n].change == 'QUANTITY_INCREASE'){
      itemsList +='<tr>'+
                     '<td style="font-size: 18px">'+compareObject[n].name + (compareObject[n].isCustom ? ' ('+compareObject[n].variant+')' : '')+
                     (compareObject[n].newComments && compareObject[n].newComments != '' ? '<newcomments class="itemComments">- '+compareObject[n].newComments+'</newcomments>' : '')+
                     '</td>'+
                     '<td style="text-align: right;">'+
                        '<span class="itemQuantity" style="font-size: 18px">'+ (compareObject[n].qty - compareObject[n].oldValue) +'</span>'+
                     '</td>'+
                  '</tr>'
   }
   else if(compareObject[n].change == 'QUANTITY_DECREASE'){

      itemsList +='<tr>'+
                     '<td style="font-size: 18px; text-decoration: line-through;">'+compareObject[n].name + (compareObject[n].isCustom ? ' ('+compareObject[n].variant+')' : '')+
                     (compareObject[n].comments && compareObject[n].comments != '' ? '<newcomments style="text-decoration: line-through;" class="itemComments">- '+compareObject[n].comments+'</newcomments>' : '')+
                     '<span style="margin-top: 3px; display: block; font-size: 12px; font-weight: bold;"><span style="display: inline-block; background: #000; color: #FFF; padding: 2px 4px;">ITEM CANCELLED</span></span>'+
                     '</td>'+
                     '<td style="text-align: right;">'+
                        '<span class="itemQuantity" style="font-size: 18px; text-decoration: line-through;">'+ (compareObject[n].oldValue - compareObject[n].qty) + '</span>'+
                     '</td>'+
                  '</tr>'

   }
   else if(compareObject[n].change == 'ITEM_DELETED'){
      itemsList +='<tr>'+
                     '<td style="font-size: 18px; text-decoration: line-through;">'+compareObject[n].name + (compareObject[n].isCustom ? ' ('+compareObject[n].variant+')' : '')+
                     (compareObject[n].comments && compareObject[n].comments != '' ? '<newcomments style="text-decoration: line-through;" class="itemComments">- '+compareObject[n].comments+'</newcomments>' : '')+
                     '<span style="margin-top: 3px; display: block; font-size: 12px; font-weight: bold;"><span style="display: inline-block; background: #000; color: #FFF; padding: 2px 4px;">ITEM CANCELLED</span></span>'+
                     '</td>'+
                     '<td style="text-align: right;">'+
                        '<span class="itemQuantity" style="font-size: 18px; text-decoration: line-through;">'+ compareObject[n].qty + '</span>'+
                     '</td>'+
                  '</tr>'
   }
   else if(compareObject[n].change == 'NEW_ITEM'){
      itemsList +='<tr>'+
                     '<td style="font-size: 18px">'+compareObject[n].name + (compareObject[n].isCustom ? ' ('+compareObject[n].variant+')' : '')+
                     (compareObject[n].newComments && compareObject[n].newComments != '' ? '<newcomments class="itemComments">- '+compareObject[n].newComments+'</newcomments>' : '')+
                     '</td>'+
                     '<td style="text-align: right;">'+
                        '<span class="itemQuantity" style="font-size: 18px">'+ compareObject[n].qty +'</span>'+
                     '</td>'+
                  '</tr>'
   }

   total_quantity += compareObject[n].qty;

   n++;
}

total_items = n;


var kot_header_content = '';
var kot_footer_content = '';

if(orderObject.orderDetails.modeType == 'DELIVERY' || orderObject.orderDetails.modeType == 'PARCEL'){
   
   kot_header_content = ''+
      '<div class="KOTHeader" style="min-height: unset">'+
         '<table style="width: 100%">'+
            '<col style="width: 30%">'+
            '<col style="width: 40%">'+
            '<col style="width: 30%">'+
            '<tr>'+
               '<td style="vertical-align: top">'+
                  '<p>'+
                     '<tag class="subLabel">KOT NO</tag>'+
                     '<tag class="KOTNumber">'+orderObject.KOTNumber+'</tag>'+
                  '</p>'+
               '</td>'+
               '<td style="vertical-align: top">'+
                  '<p style="margin: 0">'+
                     '<tag class="serviceType" style="font-size: 16px; font-weight: bold;">'+(orderObject.orderDetails.modeType == 'DELIVERY' ? 'PARCEL' : 'PARCEL <b style="font-size: 18px; padding: 1px 5px; background: #000; font-weight: bold; color: #FFF; border-radius: 2px;">#'+orderObject.table+'</b>')+'</tag>'+
                  '</p>'+
               '</td>'+
               '<td style="vertical-align: top;">'+
                  '<p style=" text-align: right; float: right">'+
                     '<tag class="subLabel">TIME</tag>'+
                     '<tag class="timeStamp" style="font-size: 14px; font-weight: bold;">'+(orderObject.timeKOT == "" ? getFancyTime(orderObject.timePunch) : getFancyTime(orderObject.timeKOT))+'</tag>'+
                  '</p>'+
               '</td>'+
            '</tr>'+
         '</table>'+
      '</div>';

   kot_footer_content = '<div class="billBottomContainer">'+
                           '<div style="text-align: center; font-size:14px; font-weight: bold; background: #000; color: #FFF; padding: 3px 0">'+ orderObject.orderDetails.mode + ' - <b style="font-size: 16px;">'+orderObject.KOTNumber+'</b>'+
                           '</div>'+   
                        '</div>'; 
}
else if(orderObject.orderDetails.modeType == 'TOKEN'){

   kot_header_content = ''+
      '<div class="KOTHeader" style="min-height: unset">'+
         '<table style="width: 100%">'+
            '<col style="width: 30%">'+
            '<col style="width: 40%">'+
            '<col style="width: 30%">'+
            '<tr>'+
               '<td style="vertical-align: top">'+
                  '<p>'+
                     '<tag class="subLabel">KOT NO</tag>'+
                     '<tag class="KOTNumber">'+orderObject.KOTNumber+'</tag>'+
                  '</p>'+
               '</td>'+
               '<td style="vertical-align: top">'+
                  '<p style="margin: 0">'+
                     '<tag class="serviceType" style="font-size: 16px; font-weight: bold;">SELF SERVICE <b style="font-size: 18px; padding: 1px 5px; background: #000; font-weight: bold; color: #FFF; border-radius: 2px;">'+orderObject.table+'</b></tag>'+
                  '</p>'+
               '</td>'+
               '<td style="vertical-align: top;">'+
                  '<p style=" text-align: right; float: right">'+
                     '<tag class="subLabel">TIME</tag>'+
                     '<tag class="timeStamp" style="font-size: 14px; font-weight: bold;">'+(orderObject.timeKOT == "" ? getFancyTime(orderObject.timePunch) : getFancyTime(orderObject.timeKOT))+'</tag>'+
                  '</p>'+
               '</td>'+
            '</tr>'+
         '</table>'+
      '</div>';  
}
else if(orderObject.orderDetails.modeType == 'DINE'){

   kot_header_content = ''+
      '<div class="KOTHeader" style="min-height: unset">'+
         '<table style="width: 100%">'+
            '<col style="width: 30%">'+
            '<col style="width: 40%">'+
            '<col style="width: 30%">'+
            '<tr>'+
               '<td style="vertical-align: top">'+
                  '<p>'+
                     '<tag class="subLabel">KOT NO</tag>'+
                     '<tag class="KOTNumber">'+orderObject.KOTNumber+'</tag>'+
                  '</p>'+
               '</td>'+
               '<td style="vertical-align: top">'+
                  '<p style="margin: 0">'+
                     '<tag class="serviceType" style="font-size: 16px; font-weight: bold;">ON TABLE <b style="font-size: 18px; padding: 1px 5px; background: #000; font-weight: bold; color: #FFF; border-radius: 2px;">'+orderObject.table+'</b></tag>'+
                  '</p>'+
               '</td>'+
               '<td style="vertical-align: top;">'+
                  '<p style=" text-align: right; float: right">'+
                     '<tag class="subLabel">TIME</tag>'+
                     '<tag class="timeStamp" style="font-size: 14px; font-weight: bold;">'+(orderObject.timeKOT == "" ? getFancyTime(orderObject.timePunch) : getFancyTime(orderObject.timeKOT))+'</tag>'+
                  '</p>'+
               '</td>'+
            '</tr>'+
         '</table>'+
      '</div>';  

   if(orderObject.stewardName != ""){

      kot_footer_content = '<div class="billBottomContainer" style="background: #FFF">'+
                              '<div style="padding: 2px 0; color: #000; text-align: center;">'+
                                 '<tag style="font-size: 8px; font-weight: 300; text-transform: uppercase; letter-spacing: 2px; font-family: sans-serif;">PUNCHED BY </tag>'+
                                 '<b style="text-transform: uppercase; font-size:11px;">'+orderObject.stewardName+'</b>'+
                              '</div>'+   
                           '</div>';
   } 
}

var html_template = kot_header_content +
      '<div class="KOTContent">'+
         '<table style="width: 100%">'+
            '<col style="width: 85%">'+
            '<col style="width: 15%">'+ itemsList +
         '</table>'+
      '</div>'+
      '<div class="KOTSpecialComments" style="'+(orderObject.specialRemarks != '' ? '' : 'display: none')+'">'+
       '<table style="width: 100%">'+
            '<col style="width: 100%">'+
            '<tr>'+
               '<td style="vertical-align: top">'+
                     '<p>'+
                        '<tag class="subLabel">SPECIAL COMMENTS</tag>'+
                        '<tag class="commentsSubText">'+orderObject.specialRemarks+'</tag>'+
                     '</p>'+  
               '</td>'+
            '</tr>'+
         '</table>'+
      '</div>'+
      '<div class="KOTSpecialComments" style="'+(orderObject.allergyInfo.length > 0 ? '' : 'display: none')+'">'+
       '<table style="width: 100%">'+
            '<col style="width: 100%">'+
            '<tr>'+
               '<td style="vertical-align: top">'+
                     '<p>'+
                        '<tag class="subLabel">ALLERGY WARNING</tag>'+
                        '<tag class="commentsSubText">'+((orderObject.allergyInfo).toString())+'</tag>'+
                     '</p>'+  
               '</td>'+
            '</tr>'+
         '</table>'+
      '</div>' + kot_footer_content;


         var selected_printer = null;

         if(!optionalTargetPrinter || optionalTargetPrinter == '' || optionalTargetPrinter == undefined){
            var b = 0;
            while(allActivePrinters[b]){
               if(allActivePrinters[b].type == 'KOT'){
                  selected_printer = allActivePrinters[b].list[0];
                  break;
               }
               b++;
            }
         }
         else if(optionalTargetPrinter != ''){
            selected_printer = optionalTargetPrinter;
         }


        if(selected_printer && selected_printer != '' && selected_printer != null){
         ipc.send("printBillDocument", html_template, selected_printer);
        }
        else{
         showToast('Print Error: Print failed. No printer configured for '+type, '#e74c3c');   
         return '';
        }
}

