"use strict";
var GroupSchema   = require('./schema/Group.scm');

var GroupEntity = new GroupSchema (
    {
        externalId: { type: String, required: true, index: true },
        type: Number,
        name: String
    }
);

var Group = GroupEntity.GetInstance();

module.exports = Group;