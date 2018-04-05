'use strict';
class BaseJob {

    /**
     * Configure Job
     * @param _callback         {Function}      Callback Function
     * @param _sharedData       {Object}        Job Shared Data
     */
    static Config(_callback, _sharedData) {
        BaseJob.callback = _callback;
        BaseJob.Data = _sharedData;
    }
}

module.exports = BaseJob;