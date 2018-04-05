"use strict";
var BaseRepository  = require('./_BaseRepository'),
    ExamEntity  = require('../entity/Exam.ent');

class ExamRepository extends BaseRepository {

    /**
     * Exam Repository
     * @class ExamRepository
     * @extends BaseRepository
     */
    constructor () {
        super(ExamEntity);
    }
}

module.exports = ExamRepository;