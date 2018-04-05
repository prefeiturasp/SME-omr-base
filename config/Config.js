"use strict";
const path = require('path');
const RESOURCE_TYPE = 'RESOURCE_TYPE';
const RESOURCE = 'RESOURCE';
const LOADED = 'LOADED';
const Enumerator = require('../class/Enumerator');

/**
 * Config Static Class
 */
class Config {

    /**
     * Initialization
     * @param customArgs {Array}
     * @static
     */
    static init (customArgs) {
        if (!Config[LOADED]) {
            let args = customArgs || process.argv;
            if (args.length <= 2) Config.setResource(process.env);
            else {
                let arg = args[2];
                let property = arg.split('=');
                if (property[0] == '--config') {
                    try {
                        let filePath = property[1];
                        let ext = path.extname(property[1]);
                        if (ext.match(Enumerator.ConfigResourceType._regex)) {
                            let resource = require(filePath);
                            Config.setResource(resource, Enumerator.ConfigResourceType.JSON);
                        } else {
                            console.warn(new Error('Config file MUST BE a json. Using ENVIRONMENT VARIABLES by default.'));
                            Config.setResource(process.env);
                        }
                    } catch (error) {
                        console.warn(new Error('Config file load error. Using ENVIRONMENT VARIABLES by default.'));
                        console.error(error);
                        Config.setResource(process.env);
                    }
                } else {
                    console.warn(new Error('Invalid application config argument. Using ENVIRONMENT VARIABLES by default.'));
                    Config.setResource(process.env);
                }
            }
        } else {
            console.warn(new Error('Config already initiated. "Config.init()" MUST BE called only on first time.'))
        }
    }

    /**
     * Set Config resource
     * @param resource {Object} Resource object
     * @param type {String=} Resource type from Enumerator.ConfigResourceType. Default is 'ENV'
     * @static
     */
    static setResource(resource, type) {
        Config[RESOURCE_TYPE] = type || Enumerator.ConfigResourceType.ENV;
        Config[RESOURCE] = resource;
        Config[LOADED] = true;
    }

    /**
     * Get Config resource
     * @returns {Object|Error}
     * @static
     */
    static get resource() {
        if (Config[LOADED]) return Config[RESOURCE];
        else throw new Error('Config MUST BE initiated. Run "Config.init()" before use config properties');
    }

    /**
     * Get application environment, 'dev' or 'production'
     * @return {String}         'dev' is the default environment
     * @constructor
     */
    static get Env() {
        return Config.resource.NODE_ENV || 'dev'
    }

    /**
     * Get MongoDB Connection String
     * @return {String}         MongoDB Connection String
     */
    static get MongoDB() {
        return Config.resource.DB_MONGODB || 'mongodb://localhost:27017/MStech_OMR';
    }

    /**
     * Minimal Log Level to Keep
     * See Enumerator.LogLevel
     * @return {Number}         Log Level
     */
    static get KeepLogLevel() {
        return Config.resource.KEEP_LOG_LEVEL === undefined? Enumerator.LogLevel.INFORMATION: Config.resource.KEEP_LOG_LEVEL;
    }

    /**
     * Keeps images results based on status
     * @param examProcessStatus {Number}
     * @param ProcessStatus {Object} Enumerator object
     * @param KeepResultLevel {Object} Enumerator object
     * @returns {*|boolean}
     */
    static KeepResults(examProcessStatus, ProcessStatus, KeepResultLevel) {

        var keepResultLevel = Config.resource.KEEP_RESULT_LEVEL || KeepResultLevel.ERROR;

        return (examProcessStatus === ProcessStatus.ERROR || keepResultLevel == KeepResultLevel.ALL) ||
            (examProcessStatus === ProcessStatus.WARNING && keepResultLevel == KeepResultLevel.WARNING);
    }

    /**
     * Get JobScript Path
     * @param job   {String}    Job Script Name
     * @param base  {String=}   Base Path
     * @return {String}         Job Script Path
     */
    static JobScript(job, base) {
        base = base || './job/';
        return base + job;
    }

    /**
     * Get File Resource Configuration
     * @return {Object|Boolean}         File Resource Object
     */
    static get FileResource() {
        //TODO: Config for Database Resource
        return {
            TYPE: Config.resource.FILE_RESOURCE || 0,
            PATH: {
                BASE: Config.resource.FILE_BASEPATH || "/var/omr"
            },
            DIRECTORY: {
                SCANNED: Config.resource.FILE_SCAN || "/scanned",
                ORIGINAL: Config.resource.FILE_ORIGINALDIR || "/original",
                EQUALIZED: Config.resource.FILE_EQUALIZEDDIR || "/equalized",
                RESULT: Config.resource.FILE_RESULTDIR || "/result",
                ERROR: Config.resource.FILE_ERROR || "/error"
            }
        }
    }

    /**
     * Get Debug Configuration
     * @return {Object|Boolean}         False if disabled and Config Object if enabled
     */
    static get DeveloperDebug() {
        if (!Boolean(Config.resource.DEVELOPER_DEBUG)) return false;
        else return {
            CLEAR_DATA: Config.resource.DEVELOPER_DEBUG_CLEAR || true
        };
    }

    /**
     * Get Cluster Configuration for Pre Processor and Processor
     * @return {Object}                 Cluster Configuration Object
     */
    static get Cluster() {
        return {
            MAX_WORKERS: Config.resource.CLUSTER_MAX_WORKERS || 10,
            SAFE_LIMIT: Config.resource.CLUSTER_SAFE_LIMIT || true
        }
    }

    /**
     * Get Connector Configuration
     * @return {Object}                 Connector Configuration Object
     */
    static get Connector() {
        return {
            ACTIVE: Config.resource.ACTIVE_CONNECTOR || '',
            SIA: {
                HOST: Config.resource.CONNECTOR_SIA_HOST || '',
                PORT: Config.resource.CONNECTOR_SIA_PORT || 80,
                SUBFOLDER: Config.resource.CONNECTOR_SIA_SUBFOLDER || '',
                AUTH: {
                    USERNAME: Config.resource.CONNECTOR_SIA_USERNAME || '',
                    PASSWORD: Config.resource.CONNECTOR_SIA_PASSWORD || ''
                },
                FILES_PAGE_SIZE: Config.resource.CONNECTOR_FILES_PAGE_SIZE || 500
            }
        }
    }

    /**
     * Get Cryptography Configuration
     * @return {Object}
     * @static
     */
    static get Cryptography() {
        return {
            DISABLED: Config.resource.ENCRYPTION_DISABLED || false,
            TYPE: Config.resource.ENCRYPTION_TYPE || 'des-ede3-cbc',
            ENCODING: Config.resource.ENCRYPTION_ENCODING || 'hex',
            SECRET: Config.resource.ENCRYPTION_KEY || "VHC4WGJNBPZTQ4WRHPDE5I8GDZ0TXFTAJP3MMMG1"
        }
    }
}

module.exports = Config;
