"use strict";
var ExamSchema      = require('./schema/Exam.scm'),
    Enum            = require('../class/Enumerator');

var ExamEntity = new ExamSchema (
    {
        _aggregation: { type: ExamSchema.Types.ObjectId, required: true, index: true, ref: 'Aggregation' },
        externalId: { type: String, required: true, index: true },
        owner: { type: ExamSchema.Types.Mixed },
        answers: [
            ExamSchema.SubDocument(
                {
                    answer: { type: String },
                    state: { type: Number, required: true }
                },
                {
                    _id: false
                }
            )
        ],
        fileExtension: { type: String },
        correctCount: { type: Number, default: 0 },
        incorrectCount: { type: Number, default: 0 },
        nullCount: { type: Number, default: 0 },
        erasedCount: { type: Number, default: 0 },
        processStatus: { type: Number, required: true, index: true },
        sent: { type: Boolean, default: false },
        absence: { type: Boolean, default: false }
    }
);

ExamEntity.SetPathValidation('answers')('state', function (value) {
    return Enum.ExamQuestionState._regex.test(value);
}, "Invalid Answer State", true);

ExamEntity.SetPathValidation('processStatus', function (value) {
    return Enum.ProcessStatus._regex.test(value);
}, "Invalid Process Status");

var Exam = ExamEntity.GetInstance();

module.exports = Exam;