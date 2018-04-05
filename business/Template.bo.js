"use strict";
var BaseBusiness    = require('./_BaseBusiness'),
    TemplateRepository  = require('../repository/Template.repo');

class TemplateBusiness extends BaseBusiness {

    /**
     * Template Business
     * @class TemplateBusiness
     * @extends BaseBusiness
     */
    constructor () {
        super(new TemplateRepository());
    }
}

module.exports = TemplateBusiness;
