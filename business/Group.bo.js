"use strict";
var BaseBusiness    = require('./_BaseBusiness'),
    GroupRepository  = require('../repository/Group.repo');

class GroupBusiness extends BaseBusiness {

    /**
     * Group Business
     * @class GroupBusiness
     * @extends BaseBusiness
     */
    constructor () {
        super(new GroupRepository());
    }
}

module.exports = GroupBusiness;
