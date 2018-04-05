'use strict';
var Manager,
    fs = require('fs'),
    async = require('async'),
    Config = require('../config/Config'),
    Enumerator = require('../class/Enumerator'),
    ExamBusiness = require('../business/Exam.bo'),
    AggregationBusiness = require('../business/Aggregation.bo');

/**
 *
 * @class ConnectorManager
 */
class ConnectorManager {

    /**
     * Set Up Connector
     * @param config
     * @param enumerator
     * @static
     */
    static SetUp(config, enumerator) {
        Config = config || Config;
        Enumerator = enumerator || Config;

        if (!Config.DeveloperDebug) {
            if (Enumerator.ConnectorType._regex.test(Config.Connector.ACTIVE)) {
                let manager = `./${Config.Connector.ACTIVE}/_Manager`;
                Manager = require(manager);

                ConnectorManager.Manager = new Manager(Config, Enumerator);
            } else throw new Error(`Invalid Connector ${Config.Connector.ACTIVE}. See 'Enumerator.ConnectorType' for more information`);
        }
    }

    /**
     * Get Exams
     * @param id
     * @param externalId
     * @param paginate
     * @return {Promise}
     * @static
     */
    static GetExams(id, externalId, paginate) {
        return new Promise((resolve, reject) => {
            if (Config.DeveloperDebug) resolve(0);
            else {
                ConnectorManager.Manager.GetExams(id, externalId, paginate)
                    .then((data) => {
                        var queue, examBO;
                        var aggregationBO = new AggregationBusiness();
                        var total = 0;
                        if ((data.hasOwnProperty('File') && data.File.length) || (data.hasOwnProperty('Error') && data.Error.length)) {
                            queue = [];

                            examBO = new ExamBusiness();

                            if (data.hasOwnProperty('File') && data.File.length) {
                                data.File.forEach((d) => {
                                    queue.push((callback) => {
                                        examBO.Create(
                                            {
                                                _aggregation: id,
                                                processStatus: Enumerator.ProcessStatus.RAW,
                                                fileExtension: d.fileExtension,
                                                externalId: d.externalId
                                            },
                                            (err, doc) => {
                                                var source, destination;
                                                if (err) callback(null, err);
                                                else {
                                                    source = `${Config.FileResource.PATH.BASE}${Config.FileResource.DIRECTORY.SCANNED}/${externalId}/${d.fileName}`;
                                                    destination = `${Config.FileResource.PATH.BASE}${Config.FileResource.DIRECTORY.ORIGINAL}/${doc._id}.${doc.fileExtension}`;
                                                    fs.rename(source, destination, (err) => {
                                                        if (err) {
                                                            examBO.Remove(doc._id, () => {
                                                                callback(null, err);
                                                            }, true);
                                                        } else {
                                                            total += 1;
                                                            callback();
                                                        }
                                                    })
                                                }
                                            }
                                        )
                                    })
                                });
                            }

                            if (data.hasOwnProperty('Error') && data.Error.length) {
                                data.Error.forEach((error) => {
                                    queue.push((callback) => {
                                        logger.error(error.message, {
                                            resource: {
                                                process: 'ConnectorManager.GetExams',
                                                params: [externalId]
                                            },
                                            detail: {
                                                description: error
                                            }
                                        }, () => {
                                            callback();
                                        });
                                    });
                                });
                            }

                            async.parallel(queue, (err, result) => {
                                if (err) reject(err);
                                else {
                                    aggregationBO.UpdateByQuery(
                                        {_id: id},
                                        { $set: {processStatus: Enumerator.ProcessStatus.RAW}, $inc: {'exam.total': total}},
                                        null,
                                        (error) => {
                                            if (error) {
                                                logger.error(error.message, {
                                                    resource: {
                                                        process: 'AggregationBO.UpdateByQuery',
                                                        params: [
                                                            {_id: id},
                                                            { $set: {processStatus: Enumerator.ProcessStatus.RAW}, $inc: {'exam.total': total}}
                                                        ]
                                                    },
                                                    detail: {
                                                        description: error
                                                    }
                                                });
                                            }
                                            resolve(total)
                                        }
                                    );
                                }
                            });
                        } else {
                            aggregationBO.UpdateByQuery(
                                {_id: id},
                                { $set: {processStatus: Enumerator.ProcessStatus.RAW}, $inc: {'exam.total': total}},
                                null,
                                (error) => {
                                    if (error) {
                                        logger.error(error.message, {
                                            resource: {
                                                process: 'AggregationBO.UpdateByQuery',
                                                params: [
                                                    {_id: id},
                                                    { $set: {processStatus: Enumerator.ProcessStatus.RAW}, $inc: {'exam.total': total}}
                                                ]
                                            },
                                            detail: {
                                                description: error
                                            }
                                        });
                                    }
                                    resolve(total);
                                }
                            );
                        }
                    })
                    .catch((error) => {
                        logger.error(error.message, {
                            resource: {
                                process: 'ConnectorManager.Manager.GetExams',
                                params: [externalId]
                            },
                            detail: {
                                description: error
                            }
                        }, () => {
                            reject(error);
                        });
                    });
            }
        });
    }

    /**
     * Get exams without aggregation
     * @param situation {Number=}
     * @return {Promise}
     * @static
     */
    static GetExamList(situation) {
        return new Promise((resolve, reject) => {
            if (Config.DeveloperDebug) resolve();
            else {
                ConnectorManager.Manager.GetExamList(situation)
                    .then((data) => {
                        if (!data) return resolve();

                        var queue = [];
                        if (data.hasOwnProperty('Error') && Array.isArray(data.Error)) {
                            queue = data.Error.map((file) => {
                                return (callback) => {
                                    var log = (process, situation, error, body, next) => {
                                        logger.error(error.message, {
                                            resource: {
                                                process: 'ConnectorManager.Manager.GetExamList',
                                                params: [situation]
                                            },
                                            detail: {
                                                description: error,
                                                body: body
                                            }
                                        }, () => {
                                            next();
                                        });
                                    };

                                    ConnectorManager.SendFoLog(file)
                                        .then(() => {
                                            log('ConnectorManager.Manager.GetExamList', situation, file.error, null, callback)
                                        })
                                        .catch((logError) => {
                                            log('ConnectorManager.Manager.SendFoLog', situation, logError, file, callback)
                                        });
                                }
                            })
                        }

                        async.parallelLimit(queue, 2, (error) => {
                            if (error) {
                                logger.error(error.message, {
                                    resource: {
                                        process: 'ConnectorManager.GetExamList',
                                        params: [situation]
                                    },
                                    detail: {
                                        description: error
                                    }
                                }, () => {
                                    reject(error);
                                });
                            } else {
                                delete data.Error;
                                return resolve(data);
                            }
                        })
                    })
                    .catch((error) => {
                        logger.error(error.message, {
                            resource: {
                                process: 'ConnectorManager.GetExamList',
                                params: [situation]
                            },
                            detail: {
                                description: error
                            }
                        }, () => {
                            reject(error);
                        });
                    })
            }
        });
    }

    /**
     * Send file reference by test id
     * @param data {Object}
     * @return {Promise}
     */
    static SendFilesByTestIds(data) {
        return new Promise((resolve, reject) => {
            if (Config.DeveloperDebug) resolve();
            else {
                ConnectorManager.Manager.SendFilesByTestIds(data)
                    .then(resolve)
                    .catch((error) => {
                        logger.error(error.message, {
                            resource: {
                                process: 'ConnectorManager.Manager.SendFilesByTestIds'
                            },
                            detail: {
                                body: data,
                                description: error
                            }
                        }, () => {
                            reject();
                        });
                    });
            }
        })
    }

    /**
     * Send Aggregation Log
     * @param log
     * @param processStatus
     * @return {Promise}
     * @static
     */
    static SendAggregationLog(log, processStatus) {
        return new Promise((resolve) => {
            if (Config.DeveloperDebug || typeof ConnectorManager.Manager.SendAggregationLog !== 'function') resolve();
            else {
                ConnectorManager.Manager.SendAggregationLog(log.aggregationExternalId, log.description.message, processStatus)
                    .then(resolve)
                    .catch((error) => {
                        logger.error(error.message, {
                            resource: {
                                process: 'ConnectorManager.Manager.SendAggregationLog',
                                params: [log.aggregationExternalId, log.description.message, processStatus]
                            },
                            detail: {
                                description: error
                            }
                        }, () => {
                            //TODO: Promise Rejection
                            resolve();
                        });
                    });
            }
        });
    }

    /**
     * Send Exam Log
     * @param logList
     * @return {Promise}
     * @static
     */
    static SendExamLog(logList) {
        return new Promise((resolve) => {
            let queue;
            if (Config.DeveloperDebug || typeof ConnectorManager.Manager.SendExamLog !== 'function') resolve();
            else {
                queue = [];
                logList.forEach((log) => {
                    queue.push((callback) => {
                        let sectionId, studentId;

                        //TODO: MANUAL_IDENTIFICATION - Need to review
                        //TODO: Remove the HARD CODED properties validation
                        if (log.hasOwnProperty('examOwner') && log.examOwner !== undefined) {
                            if (log.examOwner.hasOwnProperty('Student_Id')) studentId = log.examOwner.Student_Id;
                            if (log.examOwner.hasOwnProperty('Section_Id')) sectionId = log.examOwner.Section_Id;
                        }

                        ConnectorManager.Manager.SendExamLog(log.externalId, log.description, log.processStatus, studentId, sectionId, log._templateExternalId)
                            .then(() => {
                                callback();
                            })
                            .catch((error) => {
                                logger.error(error.message, {
                                    resource: {
                                        process: 'ConnectorManager.Manager.SendExamLog',
                                        params: [log.externalId, log.description, log.processStatus, studentId, sectionId]
                                    },
                                    detail: {
                                        description: error
                                    }
                                }, () => {
                                    callback(null, error);
                                });
                            })
                    });
                });

                async.series(queue, () => {
                    //TODO: Promise Rejection
                    resolve();
                })
            }
        });
    }

    /**
     * Send File Organizer Log
     * @param log {Object}
     * @return {Promise}
     * @static
     */
    static SendFoLog(log) {
        return new Promise((resolve, reject) => {
            if (Config.DeveloperDebug || typeof ConnectorManager.Manager.SendExamLog !== 'function') resolve();
            else {
                let sectionId, studentId;

                //TODO: MANUAL_IDENTIFICATION - Need to review
                //TODO: Remove the HARD CODED properties validation
                if (log.hasOwnProperty('examOwner') && log.examOwner !== undefined) {
                    if (log.examOwner.hasOwnProperty('Student_Id')) studentId = log.examOwner.Student_Id;
                    if (log.examOwner.hasOwnProperty('Section_Id')) sectionId = log.examOwner.Section_Id;
                }

                ConnectorManager.Manager.SendExamLog(log.externalId, log.description, log.processStatus, studentId, sectionId)
                    .then(resolve)
                    .catch((error) => {
                        logger.error(error.message, {
                            resource: {
                                process: 'ConnectorManager.Manager.SendExamLog',
                                params: [log.externalId, log.description, log.processStatus, studentId, sectionId]
                            },
                            detail: {
                                description: error
                            }
                        }, () => {
                            reject();
                        });
                    })
            }
        });
    }

    /**
     * Send Result
     * @param aggregationId
     * @return {Promise}
     * @static
     */
    static SendResult(aggregationId) {
        var aggregationBO = new AggregationBusiness();
        return new Promise((resolve, reject) => {
            if (Config.DeveloperDebug) resolve();
            else {
                aggregationBO.GetById(aggregationId, (error, aggregation) => {
                        if (error) {
                            logger.error(error.message, {
                                resource: {
                                    process: 'AggregationBO.GetById',
                                    params: [aggregationId]
                                },
                                detail: {
                                    description: error
                                }
                            }, () => {
                                reject(error);
                            });
                        }
                        else {
                            if (aggregation._template.ref.qrCode) {
                                GetQRCodeExams(aggregation, [Enumerator.ProcessStatus.SUCCESS, Enumerator.ProcessStatus.WARNING])
                                    .then(resolve, (error) => {
                                        logger.error(error.message, {
                                            resource: {
                                                process: 'ConnectorManager.GetQRCodeExams',
                                                params: [aggregation, [Enumerator.ProcessStatus.SUCCESS, Enumerator.ProcessStatus.WARNING]]
                                            },
                                            detail: {
                                                description: error
                                            }
                                        }, () => {
                                            reject(error);
                                        });
                                    });
                            } else {
                                GetManualExams(aggregation._id, [Enumerator.ProcessStatus.SUCCESS, Enumerator.ProcessStatus.WARNING])
                                    .then(resolve, (error) => {
                                        logger.error(error.message, {
                                            resource: {
                                                process: 'ConnectorManager.GetManualExams',
                                                params: [aggregation._id, [Enumerator.ProcessStatus.SUCCESS, Enumerator.ProcessStatus.WARNING]]
                                            },
                                            detail: {
                                                description: error
                                            }
                                        }, () => {
                                            reject(error);
                                        });
                                    });
                            }
                        }},
                    null, null,
                    '_template.ref _group._0 _group._1 _group._2 _group._3'
                );
            }
        });
    }
}

/**
 * Get QRCode Exams
 * @param aggregation
 * @param processStatus
 * @return {Promise}
 */
function GetQRCodeExams(aggregation, processStatus) {
    var examBO = new ExamBusiness();
    return new Promise((resolve, reject) => {
        examBO.GetDistinct(
            ConnectorManager.Manager.GroupField,
            {
                _aggregation: aggregation._id,
                sent: false,
                $or: [
                    {
                        processStatus: processStatus[0]
                    },
                    {
                        processStatus: processStatus[1]
                    }
                ]
            },
            (err, groups) => {
                if (err) reject(err);
                else if (groups.length) {
                    let queue = [];

                    groups.forEach((group) => {
                        queue.push((callback) => {
                            let where = {
                                _aggregation: aggregation._id,
                                sent: false,
                                [ConnectorManager.Manager.GroupField]: group,
                                $or: [
                                    {
                                        processStatus: processStatus[0]
                                    },
                                    {
                                        processStatus: processStatus[1]
                                    }
                                ]
                            };

                            examBO.GetByQuery(
                                where,
                                null, null, null,
                                (err, exams) => {
                                    if (err) callback(null, err);
                                    else {
                                        let ids = exams.map((exam) => {
                                            return exam._id;
                                        });

                                        ConnectorManager.Manager.SendResult(aggregation, exams, group)
                                            .then(() => {
                                                examBO.UpdateByQuery({_id: {$in: ids}}, {sent: true}, {multi: true}, (err) => {
                                                    if (err) callback(null ,err);
                                                    else callback();
                                                })
                                            })
                                            .catch((err) => {
                                                callback(null, err);
                                            });
                                    }
                                }, null, null, null, null, undefined, true
                            );
                        });
                    });

                    async.series(queue, (err, res) => {
                        if (err) reject(err);
                        else {
                            resolve();
                        }
                    })
                } else resolve();
            }
        )
    })
}

/**
 * Get Manual Exams
 * @param aggregation
 * @param processStatus
 * @return {Promise}
 */
function GetManualExams(aggregation, processStatus) {
    var examBO = new ExamBusiness();
    return new Promise((resolve, reject) => {
        let where = {
            _aggregation: aggregation._id,
            alterationDate: { $gt:  aggregation.alterationDate },
            $or: [
                {
                    processStatus: processStatus[0]
                },
                {
                    processStatus: processStatus[1]
                }
            ]
        };

        examBO.GetByQuery(
            where,
            null, null, null,
            (err, exams) => {
                if (err) {
                    ConnectorManager.Logger(
                        Enumerator.LogLevel.ERROR,
                        {
                            path: `Aggregation->${aggregation._id}`,
                            process: 'ConnectorManager.SendResult.GetManualExams',
                            params: [aggregation._id]
                        },
                        {
                            description: err
                        }
                    );
                    reject(err);
                }
                else {
                    ConnectorManager.Manager.SendResult(aggregation, exams)
                        .then(() => {
                            examBO.UpdateByQuery(
                                where,
                                { $set: { sent: true } },
                                { multi: true },
                                (err) => {
                                    if (err) resolve();
                                    else resolve();
                                }
                            );
                        })
                        .catch((err) => {
                            ConnectorManager.Logger(
                                Enumerator.LogLevel.ERROR,
                                {
                                    path: `Aggregation->${aggregation._id}`,
                                    process: 'ConnectorManager.SendResult.GetManualExams',
                                    params: [aggregation._id]
                                },
                                {
                                    description: err
                                }
                            );
                            resolve()
                        });
                }
            }
        );
    });
}

module.exports = (config, enumerator) => {
    ConnectorManager.SetUp(config, enumerator);
    return ConnectorManager;
};
