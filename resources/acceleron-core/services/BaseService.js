"use strict";
let BaseTraceEnabler = require("../base/BaseTraceEnabler");
let TraceAttributes = require("../utils/TraceAttributes");

class BaseService extends BaseTraceEnabler {
    constructor(request) {
        let traceAttributes = request._oms_trace_attributes ? request._oms_trace_attributes : new TraceAttributes();
        super(traceAttributes);
        this.request = request;
    }
}

module.exports = BaseService;