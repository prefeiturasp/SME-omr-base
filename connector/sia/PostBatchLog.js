'use strict';
var BaseClient = require('./_BaseSIAClient'),
    Enumerator;

class PostBatchLog extends BaseClient {

    /**
     * PostBatchLog
     * @param config        {Object=}   Config Class
     * @param enumerator    {Object=}   Enumerator Class
     * @constructor
     */
    constructor(config, enumerator) {
        Enumerator = enumerator;
        super(`${config.Connector.SIA.SUBFOLDER}/api/answersheet/postbatchlog`, config);
    }

    /**
     * Send Batch Log
     * @param id            {Number}    Aggregation External ID
     * @param description   {String}    Error description
     * @param status        {Number}    Process Status
     * @param token
     * @return {Promise}
     */
    SendLog(id, description, status, token) {
        return new Promise((resolve, reject) => {
            var data;
            status = PostBatchLog.GetStatus(status);

            if (BaseClient.FileLogStatus._regex.test(status.toString())) {
                this.SetHeaders({
                    'Content-Type': 'application/json',
                    'Authorization': token
                });

                data = {
                    description: description
                };

                this.Post(data, `/${id}/${status}`)
                    .then(resolve, reject);
            } else reject(new Error('Invalid Status'));
        });
    }

    /**
     * Convert OMR Process Status to SIA Batch Log Status
     * @param processStatus {Number} OMR Process Status (Enumerator.ProcessStatus)
     * @return {Number} SIA Batch Log Status
     * @static
     */
    static GetStatus(processStatus) {
        var status;
        switch (processStatus) {
            case Enumerator.ProcessStatus.ERROR:
                status = BaseClient.BatchLogStatus.FAILURE;
                break;
            case Enumerator.ProcessStatus.PRE_PROCESSING:
                status = BaseClient.BatchLogStatus.PROCESSING;
                break;
            case Enumerator.ProcessStatus.PROCESSING:
                status = BaseClient.BatchLogStatus.PROCESSING;
                break;
            default:
                status = BaseClient.BatchLogStatus.SUCCESS;
                break;
        }

        return status;
    }
}

module.exports = PostBatchLog;