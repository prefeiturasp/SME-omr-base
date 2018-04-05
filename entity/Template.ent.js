"use strict";
var MongooseError   = require('mongoose').Error,
    TemplateSchema  = require('./schema/Template.scm'),
    Enum            = require('../class/Enumerator');

var TemplateEntity = new TemplateSchema (
    {
        externalId: { type: String, required: true, index: true, unique: true },
        questions: { type: Number, required: true, min: 1 },
        alternatives: { type: Number, required: true, min: 1 },
        columns: { type: Number, required: true, min: 1 },
        lines: { type: Number, min: 1, default: 1 },
        type: { type: Number, default: Enum.TemplateType.ELEMENTARY_SCHOOL },
        offset: {
            width: Number,
            height: Number,
            bottom: Number
        },
        qrCode: Boolean,
        items: [
            TemplateSchema.SubDocument(
                {
                    externalId: {type: String},
                    correctId: {type: String},
                    answers: {type: [String]},
                    ignore: {type: Boolean}
                },
                {
                    _id: false
                }
            )
        ]
    }
);

TemplateEntity.SetPathValidation('type', function (value) {
    return Enum.TemplateType._regex.test(value);
}, "Invalid Template Type");

var Template = TemplateEntity.GetInstance();

module.exports = Template;