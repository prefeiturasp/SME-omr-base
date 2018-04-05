"use strict";
var BaseRepository  = require('./_BaseRepository'),
    UserEntity  = require('../entity/User.ent');

class UserRepository extends BaseRepository {

    /**
     * User Repository
     * @class UserRepository
     * @extends BaseRepository
     */
    constructor () {
        super(UserEntity);
    }
}

module.exports = UserRepository;