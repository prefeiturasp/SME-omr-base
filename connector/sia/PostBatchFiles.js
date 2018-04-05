'use strict';
var BaseClient = require('./_BaseSIAClient');

class PostBatchFiles extends BaseClient {

    /**
     * PostBatchFiles
     * @param Config        {Object=}   Config Class
     * @constructor
     */
    constructor(Config) {
        super(`${Config.Connector.SIA.SUBFOLDER}/api/answersheet/postbatchfiles`, Config);
    }

    /**
     * Get Files by Batch ID
     * @param data            {Object}   Test files
     * @param token
     * @return {Promise}
     */
    PostByTestIds(data, token) {
        return new Promise((resolve, reject) => {
            this.SetHeader('Authorization', token);
            this.SetHeader('Content-Type', 'application/json');

            this.Post(data)
                .then(resolve, reject);
        });
    }
}

module.exports = PostBatchFiles;