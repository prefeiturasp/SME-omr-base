"use strict";
var BaseBusiness    = require('./_BaseBusiness'),
    AggregationRepository  = require('../repository/Aggregation.repo');

class AggregationBusiness extends BaseBusiness {

    /**
     * Aggregation Business
     * @class AggregationBusiness
     * @extends BaseBusiness
     */
    constructor () {
        super(new AggregationRepository());
    }
}

module.exports = AggregationBusiness;
