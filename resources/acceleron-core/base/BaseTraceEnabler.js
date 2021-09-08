"use strict";
let TraceAttributes = require("../utils/TraceAttributes");

class BaseTraceEnabler {
    constructor(traceAttributes) {
        this.traceAttributes = traceAttributes;
    }

    startSpan() {
        this.traceAttributes.startSpan();
    }

    getTraceAttributes() {
        return this.traceAttributes;
    }
}

module.exports = BaseTraceEnabler;