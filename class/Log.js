"use strict";
const Winston = require('winston');
const mongoTransport = require('winston-mongodb').MongoDB;
const Cryptography = require('./Cryptography');
const Config = require('../config/Config');
const Enumerator = require('./Enumerator');
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

module.exports = (options) => {
    try {
        var instance;
        var transports;

        if (!Config.Cryptography.DISABLED) options.connectionString = Cryptography.decrypt(options.connectionString);

        transports = [
            new (mongoTransport)({
                db: options.connectionString,
                collection: options.collection || 'Log',
                level: options.level || Enumerator.LogLevel.ERROR,
                label: options.label,
                storeHost: true
            })
        ];

        if (Config.Env !== 'production') {
            transports.push(new (Winston.transports.Console)({
                level: Enumerator.LogLevel.DEBUG,
                label: options.label
            }))
        }

        instance = new (Winston.Logger)({
            transports: transports
        });

        instance.getByQuery = getByQuery.bind(options.db);
        instance.getById = getById.bind(options.db);

        Object.defineProperty(global, "logger", {
            value: instance,
            enumerable: true,
            writable: false,
            configurable: false
        });

    } catch (ex) {
        throw ex;
    }
};

/**
 * Get log by id
 * @param id {ObjectId} MongoDB Object id
 * @param callback {Function}
 */
function getById(id, callback) {
    this.collection('Log', (err, log) => {
        if (err) return callback(err);

        log.findOne({_id: ObjectId(id)}, (err, doc) => {
            if (err) return callback(err);
            else return callback(null, doc);
        })
    })
}

/**
 * Get log by query
 * @param where {Object=}
 * @param limit {Number=}
 * @param sort {Object|Array=}
 * @param callback {Function}
 * @param skipRecords {Number=}
 */
function getByQuery(where, limit, sort, callback, skipRecords) {
    this.collection('Log', (err, log) => {
        let query;
        if (err) return callback(err);

        query = log.find(where || {});
        if (sort) query.sort(sort);
        if (limit) query.limit(limit);
        if (skipRecords) query.skip(skipRecords);

        query.toArray((err, data) => {
            if (err) return callback(err);
            else {
                log.count(where, (err, count) => {
                    if (err) return callback(err);

                    return callback(null, {data: data, count: count});
                });
            }
        })
    })
}