"use strict";
var BaseSchema        = require('./_BaseSchema');

class AggregationSchema extends BaseSchema {

    /**
     * Aggregation Schema
     * @class AggregationSchema
     * @param fields            {Object}        Schema Fields
     * @param options           {Object=}       Schema Options
     * @extends BaseSchema
     */
    constructor (fields, options) {
        super("Aggregation", fields, options || {});
    }
}

module.exports = AggregationSchema;