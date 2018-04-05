'use strict';
var async, Config, Enum;
async = require('async');

class WorkerManager {

    /**
     * Worker Manager
     * @param _config       {Object=}       Config Object
     * @param _enum         {Object=}       Enumerator Object
     * @constructor
     */
    constructor (_config, _enum) {
        this.Prepare(_config, _enum);
    }

    /**
     * Config Job Execution Flow
     * @example
     * <pre><code>
     * // Flow as an Object
     * this.Push({
     *      name: "job-name",
     *      job: WorkerManager.JobList.DrawImage,
     *      params: [1, 2, 3],
     *      depends: "another-job-name"
     * });
     *
     * // Flow as an Array
     * this.Push([
     *  {
     *      name: "job-name",
     *      job: WorkerManager.JobList.DrawImage,
     *      params: [1, 2, 3],
     *      depends: "another-job-name"
     *  },
     *  {
     *      name: "job-name-2",
     *      job: WorkerManager.JobList.DrawImage,
     *      params: [1, 2, 3],
     *      depends: "another-job-name"
     *  }
     * );
     *
     * // Pushing a Custom Job
     * this.Push({
     *      name: "job-name",
     *      params: [1, 2, 3],
     *      depends: "another-job-name",
     *      job: (function () {
     *          var _c, Data;
     *          return {
     *              Config: function(_callback, _sharedData) {
     *                  _c = _callback;
     *                  Data = _sharedData;
     *              },
     *              Run: function (a, b) {
     *                  //Job Code
     *                  _c();
     *              }
     *          }
     *      })();
     * });
     * </code></pre>
     * @param _flow             {Object|Array}      Flow Configuration
     * @param _flow.name        {String}            If String, Job Name MUST BE UNIQUE. If Object, see _flow properties
     * @param _flow.params      {Array=}            Array of Job Execution Params
     * @param _flow.depends     {String|Array=}     If String, an other Job Name. If Array, a list of Job Names
     * @param _flow.job         {String|Object}     If String, valid Job, see 'WorkManager.JobList'. If Object see _flow.job properties
     * @param _flow.job.Config  {Function}          Job Config Function
     * @param _flow.job.Run     {Function}          Job Runner Function
     */
    Push (_flow) {
        var baseFn, tmpFlow;

        if (Array.isArray(_flow)) tmpFlow = _flow;
        else tmpFlow = [_flow];

        tmpFlow.forEach(function (f, i) {
            this.Validation(f, i);
            this.flow[f.name] = [];

            baseFn = function (_c) {
                var Job;
                if (typeof f.job == 'object') Job = f.job;
                else Job = WorkerManager.JobLoader(f.job);

                Job.Config(
                    function (err, data) {
                        if (err) _c({
                            Process: f.name,
                            Description: err
                        });
                        else _c(null, data);
                    }.bind(this),
                    this.sharedData
                );
                Job.Run.apply(null, f.params);
            }.bind(this);

            this.flow[f.name] = !f.depends? baseFn.bind(this): this.flow[f.name].concat(f.depends, baseFn.bind(this));
        }.bind(this));
    }

    /**
     * Run Jobs based of Config Flow
     * @param _callback     {Function}      Callback Function
     */
    RunJob (_callback) {
        async.auto(
            this.flow,
            function (err, data) {
                if (err) _callback(err);
                else _callback(null, data);
            }.bind(this)
        );
    }

    /**
     * Prepare WorkerManager Execution
     * @param _config       {Object=}       Config Object
     * @param _enum         {Object=}       Enumerator Object
     */
    Prepare(_config, _enum) {
        this.flow = {};
        this.sharedData = {};

        if (_config) Config = _config;
        else Config = require('../config/Config');
        if (_enum) Enum = _enum;
        else Enum = require('../class/Enumerator');
    }

    /**
     * Flow Properties Validation
     * @param flow          {Object}        Current Flow Object
     * @param index         {Number}        Current Flow Index
     */
    Validation (flow, index) {
        if (!flow.hasOwnProperty('name'))
            throw new Error('Flow item MUST HAVE "name" property at Flow index: ' + index);
        else if (this.flow.hasOwnProperty(flow.name))
            throw new Error('Flow item property "name" MUST BE UNIQUE at Flow index: ' + index);

        if (!flow.hasOwnProperty('job'))
            throw new Error('Flow item MUST HAVE "job" property at Flow index: ' + index);
        else if (typeof flow.job != 'object' && !WorkerManager.JobList.hasOwnProperty(flow.job))
            throw new Error('Flow item property "job" IS INVALID at Flow index: ' + index + '. See "WorkerManager.JobList" enumerator');

        if (flow.params && !Array.isArray(flow.params))
            throw new Error('Flow item property "params" MUST BE an Array at Flow index: ' + index);
    }

    /**
     * Load Job Class
     * @param job           {String}        Job Name
     * @static
     * @return {*}
     */
    static JobLoader(job) {
        return require(Config.JobScript(job));
    }

    /**
     * Get Job List
     * @static
     * @return {Object}
     */
    static get JobList () {
        return {
            AlignImage: 'AlignImage',
            CropImage: 'CropImage',
            DetectCorner: 'DetectCorner',
            DetectQRCode: 'DetectQRCode',
            DrawGrid: 'DrawGrid',
            DrawImage: 'DrawImage',
            EqualizeImage: 'EqualizeImage',
            FilterCorner: 'FilterCorner',
            GetFillPercent: 'GetFillPercent',
            ImageBin: 'ImageBin',
            PrepareCornerDetection: 'PrepareCornerDetection',
            VerifyTemplateFill: 'VerifyTemplateFill',
            ValidateTemplate: 'ValidateTemplate'
        }
    }
}

module.exports = WorkerManager;