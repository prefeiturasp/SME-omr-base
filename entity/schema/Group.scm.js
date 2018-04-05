"use strict";
var BaseSchema        = require('./_BaseSchema');

class GroupSchema extends BaseSchema {

    /**
     * Group Schema
     * @class GroupSchema
     * @param fields            {Object}        Schema Fields
     * @param options           {Object=}       Schema Options
     * @extends BaseSchema
     */
    constructor (fields, options) {
        super("Group", fields, options || {});
    }
}

module.exports = GroupSchema;