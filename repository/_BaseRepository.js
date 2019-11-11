"use strict";
var extend = require('extend'),
    async = require('async'),
    Enum = require('../class/Enumerator');

class BaseRepository {

    /**
     * BaseRepository
     * @class BaseRepository
     * @param entity            {Object}        Entity Reference
     * @constructor
     */
    constructor (entity) {
        this.Entity = entity;
    }

    /**
     * Get Document by Id
     * @param id                {Mixed}             Document Id
     * @param _callback         {Function}          Callback Function
     * @param parentField       {String=}           Field Identifier of Parent Resource
     * @param parentValue       {String|Number=}    Identifier of Parent Resource
     * @param populateRefs      {String=}           Reference field for MongoDB Populate
     * @param populateFields    {String=}           Field list to return in Populate
     * @param lean              {Boolean=}          Default is false, if true return data in JSON format not as Mongoose Schema
     * @callback _callback
     */
    Get (id, _callback, parentField, parentValue, populateRefs, populateFields, lean) {
        var where, query;
        if (id) {
            if (parentField && parentValue) {
                where = {
                    [parentField]: parentValue
                };
                query = this.Entity.findOne(where);
            } else {
                query = this.Entity.findById(id);
            }

            if (populateRefs) query.populate(populateRefs, populateFields? populateFields: '');
            if (lean) query.lean(true);
            query.exec(_callback);
        }
        else _callback(new Error("Id field Required"));
    }

    /**
     * Get Documents matching the arguments
     * @param where             {Object=}           Conditions
     * @param fields            {Object=}           Result field list
     * @param limit             {Number=}           Number of Documents returned
     * @param sort              {Object=}           Sort conditions
     * @param _callback         {Function}          Callback Function
     * @param parentField       {String=}           Field Identifier of Parent Resource
     * @param parentValue       {String|Number=}    Identifier of Parent Resource
     * @param populateRefs      {String=}           Reference field for MongoDB Populate
     * @param populateFields    {String=}           Field list to return in Populate
     * @param skipRecords       {Number=}           Number of documents to skip
     * @param lean              {Boolean=}          Default is false, if true return data in JSON format not as Mongoose Schema
     * @callback _callback
     */
    GetList (where, fields, limit, sort, _callback, parentField, parentValue, populateRefs, populateFields, skipRecords, lean) {
        var query;

        if (!where) where = {};
        if (parentField && parentValue) where[parentField] = parentValue;

        query = this.Entity.find(where);
        query.select(fields);
        query.limit(limit);
        query.sort(sort);
        if (skipRecords >= 0) query.skip(skipRecords);

        if (populateRefs) query.populate(populateRefs, populateFields? populateFields: '');
        if (lean) query.lean(true);

        query.exec(function (err, data) {
            if (err) _callback(err);
            else if (skipRecords >= 0) {
                query = this.Entity.count(where);
                query.exec(function (err, count) {
                    if (err) _callback(err);
                    else _callback(null, {
                        data: data,
                        count: count
                    });
                })
            }
            else _callback(null, data);
        }.bind(this));
    }

    /**
     * Get Documents Count matching the arguments
     * @param where             {Object=}           Conditions
     * @param _callback         {Function}          Callback Function
     * @param parentField       {String=}           Field Identifier of Parent Resource
     * @param parentValue       {String|Number=}    Identifier of Parent Resource
     * @callback _callback
     */
    GetCount (where, _callback, parentField, parentValue) {
        var query;

        if (!where) where = {};
        if (parentField && parentValue) where[parentField] = parentValue;

        query = this.Entity.count(where);
        query.exec(_callback);
    }

    /**
     * Get Documents Count matching the arguments
     * @param where             {Object=}           Conditions
     * @param _callback         {Function}          Callback Function     
     * @callback _callback
     */
    Count(where, _callback) {
        if (!where) where = {};
        this.Entity.count(where).exec().then((result) => {
            _callback(result, where);
        });
    }

    /**
     * Get Distinct value in
     * @param field             {String}            Field Name
     * @param where             {Object=}           Conditions
     * @param _callback         {Function}          Callback Function
     * @param parentField       {String=}           Field Identifier of Parent Resource
     * @param parentValue       {String|Number=}    Identifier of Parent Resource
     * @callback _callback
     */
    GetDistinct (field, where, _callback, parentField, parentValue) {
        var query;

        if (!where) where = {};
        if (parentField && parentValue) where[parentField] = parentValue;

        query = this.Entity.distinct(field, where);
        query.exec(_callback);
    }

    /**
     * Save Document
     * Create if "id" is null
     * Update if a valid "id" is given
     * @param id                {Mixed=}            Document Id
     * @param data              {Mixed}             Data to Save or Update
     * @param _callback         {Function}          Callback Function
     * @param parentField       {String=}           Field Identifier of Parent Resource
     * @param parentValue       {String|Number=}    Identifier of Parent Resource
     * @callback _callback
     */
    Save (id, data, _callback, parentField, parentValue) {
        var _Entity;

        if (id) {
            this.Get(id, function (err, _data) {
                var doc;
                if (err) _callback(err);
                else if (data && Array.isArray(data)) {
                    doc = _data[0];
                } else {
                    doc = _data;
                }

                extend(doc, data);
                doc.save(_callback);
            }, parentField, parentValue);
        } else {
            data[parentField] = parentValue;
            _Entity = new this.Entity(data);
            _Entity.save(_callback);
        }
    }

    /**
     * Save Document
     * Create if "ids" are null
     * Update if a valid "id" are given
     * @param ids               {Array=}            Documents Ids
     * @param data              {Mixed}             Data to Save or Update
     * @param _callback         {Function}          Callback Function
     * @param parentField       {String=}           Field Identifier of Parent Resource
     * @param parentValue       {String|Number=}    Identifier of Parent Resource
     * @callback _callback
     */
    SaveList (ids, data, _callback, parentField, parentValue) {
        var exec = [],
            errors = [],
            self = this;

        // Update List
        if (Array.isArray(ids) && Array.isArray(data)) {
            ids.forEach(function(id) {
                exec.push(function(_c) {
                    let doc = data.shift();
                    self.Save(id, doc, function(err, d) {
                        if (err) errors.push(err);
                        else _c(null, d);
                    }, parentField, parentValue)
                });
            });

            async.parallel(
                exec,
                function (err, data) {
                    if (errors.length > 0) _callback(errors);
                    else _callback(null, data);
                }
            );

            // Create List
        } else if (!ids && Array.isArray(data)) {
            data.forEach(function(doc){
                exec.push(function(_c) {
                    self.Save(null, doc, function(err, d) {
                        if (err) errors.push(err);
                        else _c(null, d);
                    })
                });
            });

            async.parallel(
                exec,
                function (err, data) {
                    if (errors.length > 0) _callback(errors);
                    else _callback(null, data);
                }
            );
        }
    }

    /**
     * Update Documents By Conditions
     * @see http://mongoosejs.com/docs/api.html#model_Model.update
     * @param where             {Object}            Conditions
     * @param data              {Object}            Data model
     * @param options           {Object}            MongoDB Update Options
     * @param _callback         {Function}          Callback Function
     * @callback _callback
     */
    Update(where, data, options, _callback) {
        this.Entity.update(
            where,
            data,
            options,
            _callback
        );
    }

    /**
     * Delete Document by Id
     * @param id                {Mixed}             Document Id
     * @param _callback         {Function}          Callback Function
     * @param physical          {Boolean=}          Physically remove record from DB, Default is FALSE
     * @param parentField       {String=}           Field Identifier of Parent Resource
     * @param parentValue       {String|Number=}    Identifier of Parent Resource
     * @callback _callback
     */
    Remove (id, _callback, physical, parentField, parentValue) {
        var data = {};
        if (physical) this.Entity.findByIdAndRemove(id, _callback);
        else {
            data.status = Enum.DataStatus.DELETED;

            this.Save(id, data, _callback, parentField, parentValue);
        }
    }

    /**
     * Delete Documents by Ids
     * @param ids               {Array}             Document Ids
     * @param _callback         {Function}          Callback Function
     * @param physical          {Boolean=}          Physically remove record from DB, Default is FALSE
     * @param parentField       {String=}           Field Identifier of Parent Resource
     * @param parentValue       {String|Number=}    Identifier of Parent Resource
     * @callback _callback
     */
    RemoveList (ids, _callback, physical, parentField, parentValue) {
        var exec = [],
            errors = [],
            self = this;

        if (Array.isArray(ids)) {
            ids.forEach(function(id) {
                exec.push(function(_c) {
                    self.Remove(id, function(err, d) {
                        if (err) errors.push(err);
                        else _c(null, d);
                    }, physical, parentField, parentValue)
                });
            });

            async.parallel(
                exec,
                function (err, data) {
                    if (errors.length > 0) _callback(errors);
                    else _callback(null, data);
                }
            )
        }
    }

    /**
     * Delete Documents by Conditions
     * @param where             {Object=}           Conditions
     * @param _callback         {Function}          Callback Function
     * @param physical          {Boolean=}          Physically remove record from DB, Default is FALSE
     * @callback _callback
     */
    RemoveByQuery(where, _callback, physical) {
        if (physical) this.Entity.remove(where, _callback);
        else this.Update(
            where,
            {
                $set: {
                    status: Enum.DataStatus.DELETED
                }
            },
            {
                multi: true
            },
            _callback
        );
    }
}

module.exports = BaseRepository;