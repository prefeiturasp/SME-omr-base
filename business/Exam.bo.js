"use strict";
var fs = require('fs'),
    path = require('path'),
    BaseBusiness    = require('./_BaseBusiness'),
    ExamRepository  = require('../repository/Exam.repo');

class ExamBusiness extends BaseBusiness {

    /**
     * Exam Business
     * @class ExamBusiness
     * @extends BaseBusiness
     */
    constructor () {
        super(new ExamRepository());
    }

    /**
     * Get
     * @param id {String} Exam Id or ExternalID
     * @param dir {String} Path to Image Context
     * @param extension {String} File Extension (Enumerator.FileExtensions)
     * @param external {Boolean=} Default false, if tree Id mean externalId
     * @param suffix {String=} Image Suffix if needed
     */
    getFile (id, dir, external, extension, suffix) {
        return new Promise((resolve, reject) => {
            var where = {};
            if (external) where['externalId'] = id;
            else where['_id'] = id;

            this.GetByQuery(where, '_id', 1, null, (err, data) => {
                if (err) reject(err);
                else if (data.length) {
                    suffix = suffix || '';
                    try {
                        let imgPath = path.normalize(`${dir}/${data[0]._id}${suffix}.${extension}`);
                        fs.statSync(imgPath);
                        resolve(imgPath);
                    } catch (err) {
                        reject(err);
                    }
                } else {
                    let error = new Error('Exam not found!');
                    error.code = 'ENOENT';
                    reject(error);
                }
            });
        });
    }
}

module.exports = ExamBusiness;
