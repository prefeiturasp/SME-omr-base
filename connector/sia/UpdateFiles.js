'use strict';
var BaseClient = require('./_BaseSIAClient');

class UpdateFiles extends BaseClient {

    /**
     * UpdateFiles
     * @param Config        {Object=}   Config Class
     * @constructor
     */
    constructor(Config) {
        super(`${Config.Connector.SIA.SUBFOLDER}/api/answersheet/updatefiles`, Config);
    }

    /**
     * Update batch files
     * @param data {Array} List of file data
     * @param token {String}
     * @return {Promise}
     */
    Update(data, token) {
        return new Promise((resolve, reject) => {
            this.SetHeader('Authorization', token);
            this.SetHeader('Content-Type', 'application/json');

            this.Post(data)
                .then(resolve, reject);
        })
    }
}

module.exports = UpdateFiles;