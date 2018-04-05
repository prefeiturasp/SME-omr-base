"use strict";
var BaseSchema        = require('./_BaseSchema');

class ExamSchema extends BaseSchema {

    /**
     * Exam Schema
     * @class ExamSchema
     * @param fields            {Object}        Schema Fields
     * @param options           {Object=}       Schema Options
     * @extends BaseSchema
     */
    constructor (fields, options) {
        super("Exam", fields, options || {});
    }
}

module.exports = ExamSchema;