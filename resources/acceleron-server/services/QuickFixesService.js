"use strict";
let BaseService = ACCELERONCORE._services.BaseService;
let TableService = require('./TableService');
let KOTService = require('./KOTService');
let CommonService = require('./CommonService');

var _ = require('underscore');
var async = require('async');
const ErrorType = require('../utils/errorConstants');

class QuickFixesService extends BaseService {
    constructor(request) {
        super(request);
        this.request = request;
        this.TableService = new TableService(request);
        this.KOTService = new KOTService(request);
        this.CommonService = new CommonService(request);
    }

    async applyQuickFix(fix_key) {

        if(fix_key == "KOT" || fix_key == "BILL"){
            await this.quickFixIndices(fix_key).catch(error => {
                throw error
            });
            return "Fixed successfully";                    
        }
        else{ //table mapping fix
            await this.quickFixTables().catch(error => {
                throw error
            });        
        }
    }

    async quickFixIndices(fix_key){
        let settings_id = 'ACCELERATE_'+fix_key+'_INDEX';
            const settingsData = await this.CommonService.getSettingsFileById(settings_id).catch(error => {
                throw error
            });
            if(_.isEmpty(settingsData)){
                throw new ErrorResponse(ResponseType.NO_RECORD_FOUND, ErrorType.no_matching_results);
            }
            var indexValue = settingsData.value;
            indexValue++;                
            settingsData.value = indexValue;  
            return await this.CommonService.updateSettingsFileById(settings_id, settingsData).catch(error => {
                throw error
            });                  
    }

    async quickFixTables(){
        
        const liveTablesData = await this.TableService.fetchTablesByFilter('live', '').catch(error => {
            throw error
        });

        if(_.isEmpty(liveTablesData)){ //Incase no live tables
            return "Fixed successfully";
        }

        for(var i = 0; i < liveTablesData.length; i++){ 
            var liveTable = liveTablesData[i]
            await this.TableService.resetTable(liveTable._id).catch(error => {
              throw new ErrorResponse(ResponseType.ERROR, ErrorType.live_table_reset_failed);
            });
        } 

        const liveOrdersData = await this.KOTService.fetchKOTsByFilter('dine').catch(error => {
            throw error;
          });

        if(_.isEmpty(liveOrdersData)){ //No active dine orders
            return "Fixed successfully";
        }
        for(var i = 0; i < liveOrdersData.length; i++){ 
            var liveKOT = liveOrdersData[i]
            var updateData = {
                "assigned" : liveKOT.stewardName,
                "remarks" : "",
                "KOT" : liveKOT.KOTNumber,
                "status" : 1,
                "lastUpdate" : liveKOT.timeKOT != "" ? liveKOT.timeKOT : liveKOT.timePunch,   
                "guestName" : liveKOT.customerName, 
                "guestContact" : liveKOT.customerMobile, 
                "reservationMapping" : "", 
                "guestCount" : liveKOT.guestCount
            }
            
            await this.TableService.updateTableByFilter('name', liveKOT.table, updateData).catch(error => {
                throw new ErrorResponse(ResponseType.ERROR, ErrorType.remapping_orders_failed);
            });
        }
        return "Fixed successfully";   
    }
}

module.exports = QuickFixesService;