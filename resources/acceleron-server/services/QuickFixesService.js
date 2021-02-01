"use strict";
let BaseService = ACCELERONCORE._services.BaseService;
let TableService = require('./TableService');
let KOTService = require('./KOTService');
let CommonService = require('./CommonService');

var _ = require('underscore');
var async = require('async');

class QuickFixesService extends BaseService {
    constructor(request) {
        super(request);
        this.request = request;
        this.TableService = new TableService(request);
        this.KOTService = new KOTService(request);
        this.CommonService = new CommonService(request);
    }

    applyQuickFix(fix_key, callback) {
        let self = this;
        if(fix_key == "KOT" || fix_key == "BILL"){
            self.quickFixIndices(fix_key, function(error, result){
                if(error) {
                    return callback(error, null)
                }
                else{
                    return callback(null, "Fixed successfully");
                }
            })                     
        }
        else{ //table mapping fix
            self.quickFixTables(function(error, result){
                if(error) {
                    return callback(error, null)
                }
                else{
                    return callback(null, "Fixed successfully");
                }
            })        
        }
    }

    quickFixIndices(fix_key, majorCallback){
        let self = this;

        async.waterfall([
          fetchIndexData,
          incrementIndex
        ], function(err, new_update_data) {
            if(err){
                return majorCallback(err, null)
            }
            else {
                let settings_id = 'ACCELERATE_'+fix_key+'_INDEX';
                self.CommonService.updateSettingsFileById(settings_id, new_update_data, function(error, result){
                    if(error) {
                        return majorCallback(error, null)
                    }
                    else{
                        return majorCallback(null, "Updated successfully");
                    }
                })                
            }
        });

        function fetchIndexData(callback){
            let settings_id = 'ACCELERATE_'+fix_key+'_INDEX';
            self.CommonService.updateSettingsFileById(settings_id, function(error, result){
                if(error) {
                    return callback(error, null)
                }
                else{
                    if(_.isEmpty(result)){
                        return callback(new ErrorResponse(ResponseType.NO_RECORD_FOUND, ErrorType.no_matching_results), null);
                    }
                    else{
                        return callback(null, result);
                    }
                }
            })
        }

        function incrementIndex(settingsData, callback){
            try {
                var indexValue = settingsData.value;
                indexValue++;                
                settingsData.value = indexValue;
                return callback(null, settingsData);
             }
             catch(er) {
                return callback(new ErrorResponse(ResponseType.ERROR, ErrorType.server_data_corrupted), null);
             }              
        }        
    }

    quickFixTables(majorCallback){
        let self = this;

        async.waterfall([
          fetchAllLiveTables,
          resetAllLiveTables,
          fetchActiveDineOrders,
          remapOrdersToTables
        ], function(err, data) {
            if(err){
                return majorCallback(err, null)
            }
            else {
                return majorCallback(null, "Fixed successfully");              
            }
        });

        function fetchAllLiveTables(callback){
            self.TableService.fetchTablesByFilter('live', '', function(error, result){
                if(error) {
                    return callback(error, null)
                }
                else{
                    return callback(null, result);
                }
            })
        }

        function resetAllLiveTables(liveTablesData, finalCallback){

            if(_.isEmpty(liveTablesData)){ //Incase no live tables
              return finalCallback(null, "Reset successfully");
            }

            async.eachSeries(liveTablesData, function (liveTable, loopCallback) {
                self.TableService.resetTable(liveTable._id, function(err, resetResponse){
                    if(err){
                        return loopCallback(null, "failed")
                    }
                    else{
                        return loopCallback(null, "succeeded")
                    }
                })
            }, function (err) {
                if(err)
                    finalCallback(err);

                return finalCallback(null, "Reset successfully");
            });
        }   

        function fetchActiveDineOrders(statusChange, callback){
            self.KOTService.fetchKOTsByFilter('dine', function(error, result){
                if(error) {
                    return callback(error, null)
                }
                else{
                    return callback(null, result);
                }
            })
        } 

        function remapOrdersToTables(liveOrdersData, finalCallback){
            if(_.isEmpty(liveOrdersData)){ //No active dine orders
              return finalCallback(null, "Reset successfully");
            }

            async.eachSeries(liveOrdersData, function (liveKOT, loopCallback) {
                self.TableService.fetchTablesByFilter('name', liveKOT.table, function(err, tableData){
                    if(err){
                        return loopCallback(null, "failed")
                    }
                    else{
                        tableData.assigned = liveKOT.stewardName;
                        tableData.remarks = "";
                        tableData.KOT = liveKOT.KOTNumber;
                        tableData.status = 1;
                        tableData.lastUpdate = liveKOT.timeKOT != "" ? liveKOT.timeKOT : liveKOT.timePunch;   
                        tableData.guestName = liveKOT.customerName; 
                        tableData.guestContact = liveKOT.customerMobile; 
                        tableData.reservationMapping = ""; 
                        tableData.guestCount = liveKOT.guestCount;

                        self.TableService.updateTable(tableData._id, tableData, function(err, resetResponse){
                            if(err){
                                return loopCallback(null, "failed")
                            }
                            else{
                                return loopCallback(null, "succeeded")
                            }
                        })
                    }
                })
            }, function (err) {
                if(err)
                    finalCallback(err);

                return finalCallback(null, "Reset successfully");
            });
        }    
    }
}

module.exports = QuickFixesService;