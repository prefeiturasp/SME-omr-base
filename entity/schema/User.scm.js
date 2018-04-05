"use strict";
var BaseSchema        = require('./_BaseSchema');

class UserSchema extends BaseSchema {

    /**
     * User Schema
     * @class UserSchema
     * @param fields            {Object}        Schema Fields
     * @param options           {Object=}       Schema Options
     * @extends BaseSchema
     */
    constructor (fields, options) {
        super("User", fields, options || {});
    }
}

module.exports = UserSchema;