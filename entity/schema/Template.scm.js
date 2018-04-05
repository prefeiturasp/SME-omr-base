"use strict";
var BaseSchema        = require('./_BaseSchema');

class TemplateSchema extends BaseSchema {

    /**
     * Template Schema
     * @class TemplateSchema
     * @param fields            {Object}        Schema Fields
     * @param options           {Object=}       Schema Options
     * @extends BaseSchema
     */
    constructor (fields, options) {
        super("Template", fields, options || {});
    }
}

module.exports = TemplateSchema;