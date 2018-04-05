'use strict';
var fs = require('fs'),
    path = require('path'),
    async = require('async'),
    GetBatchFiles = require('./GetBatchFiles'),
    PostBatchFiles = require('./PostBatchFiles'),
    UpdateFiles = require('./UpdateFiles'),
    PostBatchLog = require('./PostBatchLog'),
    PostFilesLog = require('./PostFilesLog'),
    PostBatchResult = require('./PostBatchResult'),
    User = require('./User'),
    AggregationBusiness = require('../../business/Aggregation.bo'),
    Enumerator = require('../../class/Enumerator'),

    getBatchFiles = Symbol('GetBatchFiles'),
    postBatchFiles = Symbol('PostBatchFiles'),
    updateFiles = Symbol('UpdateFiles'),
    postBatchLog = Symbol('PostBatchLog'),
    postFilesLog = Symbol('PostFilesLog'),
    postBatchResult = Symbol('PostBatchResult'),
    user = Symbol('User');

class Manager {
    constructor(config, enumerator) {
        this.Config = config;
        this.Enumerator = enumerator;

        this[getBatchFiles] = new GetBatchFiles(config);
        this[postBatchFiles] = new PostBatchFiles(config);
        this[updateFiles] = new UpdateFiles(config);
        this[postBatchLog] = new PostBatchLog(config, enumerator);
        this[postFilesLog] = new PostFilesLog(config, enumerator);
        this[postBatchResult] = new PostBatchResult(config, enumerator);
        this[user] = new User(config);
    }

    static CheckPath(path) {
        return new Promise((resolve, reject) => {
            fs.stat(path, (err) => {
                if (err && err.code != 'ENOENT') reject(err);
                else if (err && err.code == 'ENOENT') {
                    fs.mkdir(path, (err) => {
                        if (err) reject(err);
                        else resolve();
                    })
                } else resolve();
            })
        });
    }

    /**
     * Get Files by Batch ID
     * @param id {String} Aggregation Local ID
     * @param externalId            {Number}   Aggregation External ID
     * @param paginate      {Boolean=} Pagination Flag, if true get files with a pagination limit
     * @return {Promise}
     */
    GetExams(id, externalId, paginate) {
        return new Promise((resolve, reject) => {
            var savePath = `${this.Config.FileResource.PATH.BASE}${this.Config.FileResource.DIRECTORY.SCANNED}/${externalId}`;
            Manager.CheckPath(savePath)
                .then(() => {
                    var queue, extName, aggregationBO;
                    this.Authentication()
                        .then((token) => {
                            aggregationBO = new AggregationBusiness();

                            aggregationBO.Update(id, { processStatus: Enumerator.ProcessStatus.DOWNLOADING }, (error) => {
                                if (error) reject(error)

                                this[getBatchFiles].GetById(externalId, false, paginate? this.Config.Connector.SIA.FILES_PAGE_SIZE: null, token)
                                    .then((data) => {
                                        queue = [];
                                        data.forEach((d) => {
                                            extName = path.extname(d.FileName).replace('.', '');
                                            if (this.Enumerator.FileExtensions._regex.test(extName)) {
                                                queue.push((callback) => {
                                                    GetBatchFiles.DirectDownload(d.FilePath, `${savePath}/${d.FileName}`)
                                                        .then(() => {
                                                            extName = path.extname(d.FileName).replace('.', '');
                                                            callback(null, { externalId: d.Id, fileName: d.FileName, fileExtension: extName });
                                                        })
                                                        .catch((error) => {
                                                            callback(null, {
                                                                error: error,
                                                                id: d.Id
                                                            });
                                                        });
                                                })
                                            }
                                        });

                                        async.series(queue, (err, result) => {
                                            var res = {};
                                            var fileData = [];

                                            if (err) reject(err);
                                            else {
                                                result.forEach((r) => {
                                                    if (r.hasOwnProperty('error') && r instanceof Error) {
                                                        if (!res.hasOwnProperty('Error')) res.Error = [];
                                                        res.Error.push(r);
                                                        fileData.push({ Id: r.id, Sent: 0 });
                                                    } else {
                                                        if (!res.hasOwnProperty('File')) res.File = [];
                                                        res.File.push(r);
                                                    }
                                                });

                                                if (fileData.length > 0) {
                                                    this[updateFiles].Update(fileData, token)
                                                        .then(() => {
                                                            var aggregation = new AggregationBusiness();
                                                            aggregation.Update(id, {hasQueue: true}, (error) => {
                                                                if (error) {
                                                                    logger.error(error.message, {
                                                                        resource: {
                                                                            process: 'PostBatchFiles.ResetFiles'
                                                                        },
                                                                        detail: {
                                                                            description: error,
                                                                            body: JSON.stringify(fileData)
                                                                        }
                                                                    }, () => {
                                                                        resolve(res);
                                                                    });
                                                                } else resolve(res);
                                                            });
                                                        })
                                                        .catch((error) => {
                                                            logger.error(error.message, {
                                                                resource: {
                                                                    process: 'PostBatchFiles.ResetFiles'
                                                                },
                                                                detail: {
                                                                    description: error,
                                                                    body: JSON.stringify(fileData)
                                                                }
                                                            }, () => {
                                                                resolve(res);
                                                            });
                                                        })
                                                } else {
                                                    resolve(res);
                                                }
                                            }
                                        })
                                    })
                                    .catch(reject);
                            });
                        })
                        .catch(reject);
                })
                .catch(reject);
        })
    }

    /**
     * Get files
     * @param situation {Number=}
     * @return {Promise}
     */
    GetExamList(situation) {
        return new Promise((resolve, reject) => {
            var savePath = `${this.Config.FileResource.PATH.BASE}${this.Config.FileResource.DIRECTORY.SCANNED}/${new Date().getTime()}`;
            Manager.CheckPath(savePath)
                .then(() => {
                    var queue, extName;
                    this.Authentication()
                        .then((token) => {
                            situation = situation || GetBatchFiles.FileLogStatus.PENDING_IDENTIFICATION;

                            this[getBatchFiles].GetList(situation, this.Config.Connector.SIA.FILES_PAGE_SIZE, token)
                                .then((data) => {
                                    queue = [];
                                    data.forEach((d) => {
                                        extName = path.extname(d.FileName).replace('.', '');
                                        if (this.Enumerator.FileExtensions._regex.test(extName)) {
                                            queue.push((callback) => {
                                                GetBatchFiles.DirectDownload(d.FilePath, `${savePath}/${d.Id}.${extName}`)
                                                    .then(() => {
                                                        extName = path.extname(d.FileName).replace('.', '');
                                                        callback(null, { externalId: d.Id, name: `${d.Id}.${extName}`, fileOriginalName: `${d.FileOriginalName}` });
                                                    })
                                                    .catch((err) => {
                                                        callback(null, { externalId: d.Id, error: err, processStatus: Enumerator.ProcessStatus.FO_ERROR, description: err.message });
                                                    });
                                            })
                                        }
                                    });

                                    async.series(queue, (err, result) => {
                                        var res = {
                                            path: savePath
                                        };

                                        if (err) {
                                            fs.rmdir(savePath, () => {
                                                reject(err);
                                            });
                                        }
                                        else {
                                            if (result.length == 0) {
                                                fs.rmdir(savePath, () => {
                                                    resolve();
                                                })
                                            } else {
                                                result.forEach((r) => {
                                                    if (r.hasOwnProperty('error') && r.error instanceof Error) {
                                                        if (!res.hasOwnProperty('Error')) res.Error = [];
                                                        res.Error.push(r);
                                                    } else {
                                                        if (!res.hasOwnProperty('files')) res.files = [];
                                                        res.files.push(r);
                                                    }
                                                });
                                                resolve(res);
                                            }
                                        }
                                    })
                                })
                                .catch(reject);

                        })
                        .catch(reject);
                })
                .catch(reject);
        })
    }

    /**
     * Send file reference by test id
     * @param data {Object}
     * @return {Promise}
     * @constructor
     */
    SendFilesByTestIds(data) {
        return new Promise((resolve, reject) => {
            this.Authentication()
                .then((token) => {
                    var body = [];
                    for (let k in data) {
                        if (data.hasOwnProperty(k)) {
                            let obj = {
                                Test_Id: k
                            };

                            obj.AnswerSheetBatchFiles = data[k].map((id) => {
                                return { Id: id };
                            });

                            body.push(obj);
                        }
                    }

                    this[postBatchFiles].PostByTestIds(body, token)
                        .then(resolve)
                        .catch(reject);
                })
                .catch(reject);
        })
    }

    /**
     * Send Batch Log
     * @param id            {Number}    Aggregation External ID
     * @param description   {String}    Error description
     * @param status        {Number}    Process Status
     * @return {Promise}
     */
    SendAggregationLog(id, description, status) {
        return new Promise((resolve, reject) => {
            this.Authentication()
                .then((token) => {
                    this[postBatchLog].SendLog(id, description, status, token)
                        .then(resolve)
                        .catch(reject);
                })
                .catch(reject);
        });
    }

    /**
     * Send File Log
     * @param id {Number} File ID
     * @param description {String} Error description
     * @param status {Number} Process Status
     * @param student_id {String=}
     * @param section_id {String=}
     * @param _templateExternalId
     * @return {Promise}
     */
    SendExamLog(id, description, status, student_id, section_id, _templateExternalId) {
        return new Promise((resolve, reject) => {
            this.Authentication()
                .then((token) => {
                    this[postFilesLog].SendLog(id, description, status, token, student_id, section_id, _templateExternalId)
                        .then(resolve)
                        .catch(reject);
                })
                .catch(reject);
        });
    }

    /**
     * Send Results
     * @param aggregation   {Object}    Aggregation Model
     * @param examList      {Array}     Exam List
     * @param section       {String=}   Section, Only for QRCode Templates
     * @return {Promise}
     */
    SendResult(aggregation, examList, section) {
        let item, student = [];
        let itemsNoIgnore = aggregation._template.ref.items.filter( (item) => !item.ignore );

        examList.forEach((exam) => {
            item = [];
            exam.answers.forEach((answer, i) => {
                item.push(PostBatchResult.BuildItemObject(itemsNoIgnore[i].externalId, answer.answer, answer.state));
            });
            if (aggregation._template.ref.qrCode) student.push(PostBatchResult.BuildStudentObject(exam.externalId, item, exam.owner.Student_Id, null, exam.absence));
            else student.push(PostBatchResult.BuildStudentObject(exam.externalId, item, null, exam.owner, exam.absence));
        });

        return new Promise((resolve, reject) => {
            if (student.length && item.length) {
                this.Authentication()
                    .then((token) => {
                        this[postBatchResult].SendResult(aggregation.externalId, aggregation._template.ref.externalId, aggregation._template.ref.qrCode ? section : aggregation._group._1.externalId, student, token)
                            .then(resolve)
                            .catch(reject);
                    })
                    .catch(reject);
            } else {
                resolve();
            }
        });
    }

    /**
     * Get Group Field Name
     * TODO: Refactor QRCode References
     * @return {String}
     */
    get GroupField() {
        return 'owner.Section_Id';
    }

    /**
     * Get Template Field Name
     * TODO: Refactor QRCode References
     * @return {String}
     */
    get TemplateField() {
        return 'Test_Id'
    }

    /**
     * Connector Authentication
     * @return {Promise}
     */
    Authentication() {
        return new Promise((resolve, reject) => {
            //TODO: Put the JWT token verify in OMR to reduce the system load
            this[user].Signin(this.Config.Connector.SIA.AUTH.USERNAME, this.Config.Connector.SIA.AUTH.PASSWORD)
                .then((data) => {
                    if (data && data.hasOwnProperty('AccessToken')) {
                        resolve(data.AccessToken);
                    } else {
                        reject(new Error('Invalid token'));
                    }
                })
                .catch((err) => {
                    reject(err);
                });
        })
    }
}

module.exports = Manager;