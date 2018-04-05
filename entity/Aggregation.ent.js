"use strict";
var AggregationSchema   = require('./schema/Aggregation.scm'),
    Enum            = require('../class/Enumerator');

var AggregationEntity = new AggregationSchema (
    {
        externalId: { type: String, required: true, index: true, unique: true },
        processStatus: { type: Number, required: false, index: true, default: Enum.ProcessStatus.RAW },
        paginate: { type: Boolean },
        hasQueue: { type: Boolean, default: false },
        _template: {
            ref: { type: AggregationSchema.Types.ObjectId, required: true, index: true, ref: 'Template' },
            externalId: { type: String, required: true, index: true }
        },
        _group: {
            _0: { type: AggregationSchema.Types.ObjectId, required: false, ref: 'Group' },
            _1: { type: AggregationSchema.Types.ObjectId, required: false, ref: 'Group' },
            _2: { type: AggregationSchema.Types.ObjectId, required: false, ref: 'Group' },
            _3: { type: AggregationSchema.Types.ObjectId, required: false, ref: 'Group' }
        },
        exam: {
            total: { type: Number, default: 0 },
            success: { type: Number, default: 0 },
            warning: { type: Number, default: 0 },
            error: { type: Number, default: 0 },
            absence: { type: Number, default: 0 }
        },
        sync: {
            total: { type: Number, default: 0 },
            sent: { type: Number, default: 0 }
        }
    }
);

AggregationEntity.SetPathValidation('processStatus', function (value) {
    return Enum.ProcessStatus._regex.test(value);
}, "Invalid Process Status");

var Aggregation = AggregationEntity.GetInstance();

module.exports = Aggregation;