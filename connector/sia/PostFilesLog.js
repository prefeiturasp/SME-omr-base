'use strict';
var BaseClient = require('./_BaseSIAClient'),
    Enumerator;

class PostFilesLog extends BaseClient {

    /**
     * PostFilesLog
     * @param config        {Object=}   Config Class
     * @param enumerator    {Object=}   Enumerator Class
     * @constructor
     */
    constructor(config, enumerator) {
        Enumerator = enumerator;
        super(`${config.Connector.SIA.SUBFOLDER}/api/answersheet/postfileslog`, config);
    }

    /**
     * Send File Log
     * @param id {Number} File ID
     * @param description {String} Error description
     * @param status {Number} Process Status
     * @param token {String} Authorization Token
     * @param student_id {String=}
     * @param section_id {String=}
     * @param _templateExternalId
     * @return {Promise}
     */
    SendLog(id, description, status, token, student_id, section_id, _templateExternalId) {
        return new Promise((resolve, reject) => {
            var data;

            status = PostFilesLog.GetStatus(status);

            if (BaseClient.FileLogStatus._regex.test(status.toString())) {
                this.SetHeaders({
                    'Content-Type': 'application/json',
                    'Authorization': token
                });

                data = {
                    Id: id,
                    Status: status,
                    Description: description,
                    StudentID: student_id,
                    SectionId: section_id,
                    TestId: _templateExternalId
                };

                this.Post(data)
                    .then(resolve, reject);
            } else reject(new Error('Invalid Status'));
        });
    }

    /**
     * Convert OMR Process Status to SIA File Log Status
     * @param processStatus {Number} OMR Process Status (Enumerator.ProcessStatus)
     * @return {Number} SIA File Log Status
     * @static
     */
    static GetStatus(processStatus) {
        let status;
        switch (processStatus) {
            case Enumerator.ProcessStatus.ERROR:
                status = BaseClient.FileLogStatus.ERROR;
                break;
            case Enumerator.ProcessStatus.WARNING:
                status = BaseClient.FileLogStatus.WARNING;
                break;
            case Enumerator.ProcessStatus.FO_ERROR:
                status = BaseClient.FileLogStatus.IDENTIFICATION_ERROR;
                break;
            case Enumerator.ProcessStatus.ABSENCE:
                status = BaseClient.FileLogStatus.ABSENCE;
                break;
            default:
                status = BaseClient.FileLogStatus.SUCCESS;
                break;
        }

        return status;
    }
}

module.exports = PostFilesLog;