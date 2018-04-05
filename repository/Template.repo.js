"use strict";
var BaseRepository  = require('./_BaseRepository'),
    TemplateEntity  = require('../entity/Template.ent');

class TemplateRepository extends BaseRepository {

    /**
     * Template Repository
     * @class TemplateRepository
     * @extends BaseRepository
     */
    constructor () {
        super(TemplateEntity);
    }
}

module.exports = TemplateRepository;