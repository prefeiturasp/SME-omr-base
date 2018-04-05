"use strict";
var BaseRepository  = require('./_BaseRepository'),
    GroupEntity  = require('../entity/Group.ent');

class GroupRepository extends BaseRepository {

    /**
     * Group Repository
     * @class GroupRepository
     * @extends BaseRepository
     */
    constructor () {
        super(GroupEntity);
    }
}

module.exports = GroupRepository;