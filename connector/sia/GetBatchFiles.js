'use strict';
var BaseClient = require('./_BaseSIAClient');

class GetBatchFiles extends BaseClient {

    /**
     * GetBatchFiles
     * @param Config        {Object=}   Config Class
     * @constructor
     */
    constructor(Config) {
        super(`${Config.Connector.SIA.SUBFOLDER}/api/answersheet/getbatchfiles`, Config);
    }

    /**
     * Get Files by Batch ID
     * @param id            {Number}   Aggregation External ID
     * @param status        {Boolean=} If true, get all files. If false, gat only new files. Default is false
     * @param pageSize
     * @param token
     * @return {Promise}
     */
    GetById(id, status, pageSize, token) {
        return new Promise((resolve, reject) => {
            if (!status) status = false;

            this.SetHeader('Authorization', token);

            if (pageSize) {
                this.GetWithPages(`/${id}/${status}/${pageSize}`)
                    .then(resolve, reject);
            } else {
                this.Get(`/${id}/${status}/`)
                    .then(resolve, reject);
            }
        });
    }

    /**
     * Get Files
     * @param situation
     * @param pageSize
     * @param token
     * @return {Promise}
     */
    GetList(situation, pageSize, token) {
        return new Promise((resolve, reject) => {
            this.SetHeader('Authorization', token);

            this.Get(`/${situation}/${pageSize}`)
                .then(resolve, reject);
        });
    }

    /**
     * Get File using Pagination
     * @param pathSuffix    {String=}   PathSuffix
     * @param list          {Array=}    File list
     * @return {Promise}
     */
    GetWithPages(pathSuffix, list) {
        list = list || [];
        return new Promise((resolve, reject) => {
            this.Get(pathSuffix)
                .then((data) => {
                    if (data.length) {
                        this.GetWithPages(pathSuffix, list.concat(data))
                            .then(resolve, reject);
                    }
                    else {
                        resolve(list);
                    }
                })
                .catch(reject);
        });
    }
}

module.exports = GetBatchFiles;