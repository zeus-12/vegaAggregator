"use strict";
let BaseService = ACCELERONCORE._services.BaseService;
let SummaryModel = require('../models/SummaryModel');
let SettingsService = require('./SettingsService');

var _ = require('underscore');

class SummaryService extends BaseService {
    constructor(request) {
        super(request);
        this.request = request;
        this.SummaryModel = new SummaryModel(request);
        this.SettingsService = new SettingsService(request);
    }

    async getAllBillingModes(){
          let self = this;
          const data = await self.SettingsService.getSettingsById('ACCELERATE_BILLING_MODES').catch(error => {
            throw error;
          });
                if(_.isEmpty(data)){
                  throw new ErrorResponse(ResponseType.NO_RECORD_FOUND, ErrorType.no_matching_results)
                }
                else{
                  return data
                }     
        }

    async getAllPaymentModes(){
      let self = this;
      const data = await self.SettingsService.getSettingsById('ACCELERATE_PAYMENT_MODES').catch(error => {
        throw error;
      });
            if(_.isEmpty(data)){
              throw new ErrorResponse(ResponseType.NO_RECORD_FOUND, ErrorType.no_matching_results)
            }
            else{
              return data
            }     
    }      

    async fetchSummaryByBillingMode(SELECTED_INVOICE_SOURCE_DB, billingModes, from_date, to_date, curr_date){
      let self = this;
      let responseList = [{
                            type : "Billing_Mode",
                            summary : []
                          }];
      let i = 0;
      let data = {}
      //For a given BILLING MODE, the total Sales in the given DATE RANGE

      while(i < billingModes.length){

        data = await self.SummaryModel.getSalesByBillingMode(SELECTED_INVOICE_SOURCE_DB, billingModes[i].name, from_date, to_date).catch(error => {
          throw error;
        });
            if(_.isEmpty(data)){
              throw new ErrorResponse(ResponseType.NO_RECORD_FOUND, ErrorType.no_matching_results);
            }
            else if(_.isEmpty(data.rows[0])){
                responseList[0].summary.push({ 
                  mode : billingModes[i].type,
                  name : billingModes[i].name,
                  sum : 0,
                  count : 0
                  }); 
            }
            else{
                responseList[0].summary.push({ 
                  mode : billingModes[i].type,
                  name : billingModes[i].name,
                  sum : data.rows[0].value.sum,
                  count : data.rows[0].value.count
                  }); 
            }          

      //Check for any refunds in this mode.

        data = await self.SummaryModel.getRefundsByBillingMode(SELECTED_INVOICE_SOURCE_DB, billingModes[i].name, from_date, to_date).catch(error => {
            throw error;
          });
              if(_.isEmpty(data)){
                throw new ErrorResponse(ResponseType.NO_RECORD_FOUND, ErrorType.no_matching_results);
              }
              else if(_.isEmpty(data.rows[0])){
                responseList[0].summary[i] = {...responseList[0].summary[i], refunds : 0}
              }
              else{
                responseList[0].summary[i] = {...responseList[0].summary[i], refunds : data.rows[0].value.sum}
              }
          i++; 
      }            

      // To fetch live orders

      if(from_date == to_date && from_date == curr_date){
        data = await self.SummaryModel.getUnbilledKOT().catch(error => {
        throw error;
        });
            if(_.isEmpty(data)){
              throw new ErrorResponse(ResponseType.NO_RECORD_FOUND, ErrorType.no_matching_results);
            }
            else if(_.isEmpty(data.rows[0])){
                responseList.push({ 
                  type : "Live_Orders",
                  sum : 0,
                  count :0
                  });
            }
            else{ 
                responseList.push({ 
                  type : "Live_Orders",
                  sum : data.rows[0].value.sum ,
                  count : data.rows[0].value.count
                  });         
            }

      //Check for any extras 
          
        data = await self.SummaryModel.getUnbilledKOTExtras().catch(error => {
        throw error;
        });
            if(_.isEmpty(data)){
              throw new ErrorResponse(ResponseType.NO_RECORD_FOUND, ErrorType.no_matching_results);
            }
            else if(_.isEmpty(data.rows[0])){
              responseList[1] = {...responseList[1], extras : 0}
            }
            else{
              responseList[1] = {...responseList[1], extras : data.rows[0].value.sum}
            }  

      //check for unsettled bills

        data = await self.SummaryModel.getUnbilledBills(from_date, to_date).catch(error => {
        throw error;
        });
            if(_.isEmpty(data)){
              throw new ErrorResponse(ResponseType.NO_RECORD_FOUND, ErrorType.no_matching_results);
            }
            else if(_.isEmpty(data.rows[0])){
                responseList.push({ 
                  type : "Pending_Settlement",
                  sum : 0,
                  count :0
                  });
            } 
            else{
                responseList.push({ 
                  type : "Pending_Settlement",
                  sum : data.rows[0].value.sum ,
                  count : data.rows[0].value.count
                  });    
            }                            
        return responseList; 
      }  

      else{ 
        return responseList; 
      }
  
    }  

    async fetchSummaryByBillingAndPaymentMode(SELECTED_INVOICE_SOURCE_DB, paymentModes, from_date, to_date, billing_mode){
      let self = this;
      let responseList = [{
                          type : "Payment_Mode",
                          summary : []
                          }];
      let i = 0;
      let data = {};

      while(i < paymentModes.length){
     
      //For a given PAYMENT MODE and BILLING MODE, the total Sales in the given DATE RANGE
   
        data = await self.SummaryModel.getSalesByBillingAndPaymentMode(SELECTED_INVOICE_SOURCE_DB, billing_mode, paymentModes[i].code, from_date, to_date).catch(error => {
        throw error;
        });
            if(_.isEmpty(data)){
              throw new ErrorResponse(ResponseType.NO_RECORD_FOUND, ErrorType.no_matching_results);
            }
            else if(_.isEmpty(data.rows[0])){
                responseList[0].summary.push({ 
                  mode : paymentModes[i].code,
                  name : paymentModes[i].name,
                  sum : 0,
                  count : 0
                  }); 
            }
            else{
                responseList[0].summary.push({ 
                  mode : paymentModes[i].code,
                  name : paymentModes[i].name,
                  sum : data.rows[0].value.sum,
                  count : data.rows[0].value.count
                  }); 
            }          

      //Now check in split payments
   
        data = await self.SummaryModel.getSplitPaymentsByBillingAndPaymentMode(SELECTED_INVOICE_SOURCE_DB, billing_mode, paymentModes[i].code, from_date, to_date).catch(error => {
          throw error;
          });
              if(_.isEmpty(data)){
                throw new ErrorResponse(ResponseType.NO_RECORD_FOUND, ErrorType.no_matching_results);
              }
              else if(_.isEmpty(data.rows[0])){
                responseList[0].summary[i] = {...responseList[0].summary[i], splitSum : 0, splitCount : 0}
              }
              else{
                responseList[0].summary[i] = {...responseList[0].summary[i], splitSum : data.rows[0].value.sum, splitCount : data.rows[0].value.count}
              }                    
          i++;
      } 
      return responseList;
    }

    async fetchSummaryByPaymentMode(SELECTED_INVOICE_SOURCE_DB, paymentModes, from_date, to_date){
      let self = this;
      let responseList = [{
                          type : "Payment_Mode",
                          summary : []
                          }];
      let i = 0;
      let data = {};

      while(i < paymentModes.length){
     
      //For a given PAYMENT MODE, the total Sales in the given DATE RANGE
   
        data = await self.SummaryModel.getSalesByPaymentMode(SELECTED_INVOICE_SOURCE_DB, paymentModes[i].code, from_date, to_date).catch(error => {
        throw error;
        });
            if(_.isEmpty(data)){
              throw new ErrorResponse(ResponseType.NO_RECORD_FOUND, ErrorType.no_matching_results);
            }
            else if(_.isEmpty(data.rows[0])){
                responseList[0].summary.push({ 
                  mode : paymentModes[i].code,
                  name : paymentModes[i].name,
                  sum : 0,
                  count : 0
                  }); 
            }
            else{
                responseList[0].summary.push({ 
                  mode : paymentModes[i].code,
                  name : paymentModes[i].name,
                  sum : data.rows[0].value.sum,
                  count : data.rows[0].value.count
                  }); 
            }          

      //Now check in split payments
   
        data = await self.SummaryModel.getSplitPaymentsByPaymentMode(SELECTED_INVOICE_SOURCE_DB, paymentModes[i].code, from_date, to_date).catch(error => {
          throw error;
          });
              if(_.isEmpty(data)){
                throw new ErrorResponse(ResponseType.NO_RECORD_FOUND, ErrorType.no_matching_results);
              }
              else if(_.isEmpty(data.rows[0])){
                responseList[0].summary[i] = {...responseList[0].summary[i], splitSum : 0, splitCount : 0}
              }
              else{
                responseList[0].summary[i] = {...responseList[0].summary[i], splitSum : data.rows[0].value.sum, splitCount : data.rows[0].value.count}
              }
              
      //Check if any refunds issued

        data = await self.SummaryModel.getRefundsByPaymentMode(SELECTED_INVOICE_SOURCE_DB, paymentModes[i].code, from_date, to_date).catch(error => {
          throw error;
          });
              if(_.isEmpty(data)){
                throw new ErrorResponse(ResponseType.NO_RECORD_FOUND, ErrorType.no_matching_results);
              }
              else if(_.isEmpty(data.rows[0])){
                responseList[0].summary[i] = {...responseList[0].summary[i], refunds : 0}
              }
              else{
                responseList[0].summary[i] = {...responseList[0].summary[i], refunds : data.rows[0].value.sum}
              } 
          i++;
      } 
      return responseList;
    }
   
}

module.exports = SummaryService;