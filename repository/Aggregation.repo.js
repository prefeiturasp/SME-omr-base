"use strict";
var BaseRepository  = require('./_BaseRepository'),
    AggregationEntity  = require('../entity/Aggregation.ent');

require('../entity/Template.ent');
require('../entity/Group.ent');

class AggregationRepository extends BaseRepository {

    /**
     * Aggregation Repository
     * @class AggregationRepository
     * @extends BaseRepository
     */
    constructor () {
        super(AggregationEntity);
    }
}

module.exports = AggregationRepository;