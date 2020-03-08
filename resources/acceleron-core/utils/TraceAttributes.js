"use strict";
let uuid = require("uuid");

class TraceAttributes {

    constructor(requestId, parentSpan, span) {
        this.requestId = requestId ? requestId : uuid.v4();
        this.parentSpan = parentSpan ? parentSpan : this.requestId;
        this.span = span ? span : this.parentSpan;
    }

    startSpan() {
        this.parentSpan = this.span;
        this.span = uuid.v4();
    }
}

module.exports = TraceAttributes;