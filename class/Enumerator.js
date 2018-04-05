"use strict";

/**
 * Enumerator Static Class
 */
class Enumerator {

    /**
     * Get Group Type
     * @return {Object}         Group Types
     * @constructor
     */
    static get GroupType() {
        return {
            LEVEL_1: 0,
            LEVEL_2: 1,
            LEVEL_3: 2,
            LEVEL_4: 3,
            _regex: /0|1|2/
        }
    }

    /**
     * Get Log Type
     * @return {Object}         Log Types
     */
    static get LogType() {
        return {
            API: 'api',
            ADMIN_UI: 'admin',
            FILE_ORGANIZER: 'file-organizer',
            PREPROCESSOR: 'preprocessor',
            PROCESSOR: 'processor',
            RESULT_SYNC: 'result-sync',
            TASK_SCHEDULER: 'task-scheduler',
            _regex: /api|admin|file-organizer|preprocessor|processor|result-sync|task-scheuler/
        }
    }

    /**
     * Get Log Level
     * @return {Object}         Log Levels
     */
    static get LogLevel() {
        return {
            ERROR: 'error',
            WARNING: 'warn',
            INFORMATION: 'info',
            DEBUG: 'debug',
            _regex: /error|warn|info|debug/
        }
    }

    /**
     * Get Template Type
     * @return {Object}         Template Types
     */
    static get TemplateType() {
        return {
            KINDERGARTEN: 0,
            ELEMENTARY_SCHOOL: 1,
            HIGH_SCHOOL: 2,
            _regex: /0|1|2/
        };
    }

    /**
     * Get Exam Question State
     * @return {Object}         Exam Question State
     */
    static get ExamQuestionState() {
        return {
            CORRECT: 0,
            INCORRECT: 1,
            NULL: 2,
            ERASED: 3,
            _regex: /0|1|2|3/
        };
    }

    /**
     * Get Process Status
     * @return {Object}         Process Status
     */
    static get ProcessStatus() {
        return {
            RAW: 0,
            PRE_PROCESSING: 1,
            PENDING: 2,
            PROCESSING: 3,
            SUCCESS: 4,
            ERROR: 5,
            WARNING: 6,
            FINISHED: 7,
            DOWNLOADING: 8,
            UPLOADING: 9,
            FO_ERROR: 10,
            ABSENCE: 11,
            _regex: /0|1|2|3|4|5|6|7|8|9|10|11/
        };
    }


    /**
     *
     * @return {Object} KeepResultLevel
     */
    static get KeepResultLevel() {
        return {
            ERROR: 0,
            WARNING: 1,
            ALL: 2,
            _regex: /0|1|2|3/
        };
    }

    /**
     * Get Data Status
     * @return {Object}         Data Status
     */
    static get DataStatus() {
        return {
            ACTIVE: 0,
            INACTIVE: 1,
            DELETED: 2,
            _regex: /0|1|2/
        };
    }

    /**
     * Get Valid File Extensions
     * @return {Object}         File Extensions
     */
    static get FileExtensions() {
        return {
            JPG: 'jpg',
            JPEG: 'jpeg',
            PNG: 'png',
            _regex: /jpg|jpeg|png/i
        }
    }

    /**
     * Get File Resource Type
     * @return {Object}         File Resource Type
     */
    static get FileResourceType() {
        return {
            DISK: 0,
            DATABASE: 1,
            _regex: /0|1/
        };
    }

    /**
     * Get Connector Type
     * @return {Object}         Connector Type
     */
    static get ConnectorType() {
        return {
            SIA: 'sia',
            _regex: /sia/
        }
    }

    /**
     * Get Config resource types
     * @return {Object} Config resource types
     * @static
     */
    static get ConfigResourceType() {
        return {
            ENV: 'env',
            JSON: 'json',
            _regex: /evn|json/i
        }
    }
}

module.exports = Enumerator;