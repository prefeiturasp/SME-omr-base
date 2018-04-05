'use strict';
var BaseClient = require('../_BaseClient');

class BaseSIAClient extends BaseClient {
    /**
     * Base SIA Client
     * @param _path         {String}    Client Path
     * @param Config        {Object=}   Config Class
     * @constructor
     */
    constructor (_path, Config) {
        super(Config.Connector.SIA.HOST, Config.Connector.SIA.PORT, _path);
    }

    /**
     * File Log Status
     * @return {Object}
     * @static
     */
    static get FileLogStatus() {
        return {
            PENDING: 1,
            WAITING: 2,
            PROCESSING: 3,
            SUCCESS: 4,
            ERROR: 5,
            WARNING: 6,
            PENDING_IDENTIFICATION: 7,
            IDENTIFICATION_ERROR: 8,
            ABSENCE: 9,
            _regex: /1|2|3|4|5|6|7|8|9/
        }
    }

    /**
     * Batch Log Status
     * @return {Object}
     * @static
     */
    static get BatchLogStatus() {
        return {
            PENDING: '1',
            PROCESSING: '2',
            SUCCESS: '3',
            FAILURE: '4',
            _regex: /1|2|3|4/
        }
    }
}

module.exports = BaseSIAClient;