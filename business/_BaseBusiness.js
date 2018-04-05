"use strict";
class BaseBusiness {

    /**
     * BaseBusiness
     * @class BaseBusiness
     * @param repository        {Object}        Repository Instance
     * @constructor
     */
    constructor (repository) {
        this.Repository = repository;
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
    GetById (id, _callback, parentField, parentValue, populateRefs, populateFields, lean) {
        this.Repository.Get(id, _callback, parentField, parentValue, populateRefs, populateFields, lean);
    }

    /**
     * Get Documents matching the arguments
     * @param where             {Object}            Conditions
     * @param fields            {Object}            Result field list
     * @param limit             {Number}            Number of Documents returned
     * @param sort              {Object}            Sort conditions
     * @param _callback         {Function}          Callback Function
     * @param parentField       {String=}           Field Identifier of Parent Resource
     * @param parentValue       {String|Number=}    Identifier of Parent Resource
     * @param populateRefs      {String=}           Reference field for MongoDB Populate
     * @param populateFields    {String=}           Field list to return in Populate
     * @param skipRecords       {Number=}           Number of documents to skip
     * @param lean              {Boolean=}          Default is false, if true return data in JSON format not as Mongoose Schema
     * @callback _callback
     */
    GetByQuery (where, fields, limit, sort, _callback, parentField, parentValue, populateRefs, populateFields, skipRecords, lean) {
        this.Repository.GetList(where, fields, limit, sort, _callback, parentField, parentValue, populateRefs, populateFields, skipRecords, lean);
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
        this.Repository.GetCount(where, _callback, parentField, parentValue);
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
        this.Repository.GetDistinct(field, where, _callback, parentField, parentValue);
    }

    /**
     * Create Document
     * @param data              {Object}            Data to Save or Update
     * @param _callback         {Function}          Callback Function
     * @param parentField       {String=}           Field Identifier of Parent Resource
     * @param parentValue       {String|Number=}    Identifier of Parent Resource
     * @callback _callback
     */
    Create (data, _callback, parentField, parentValue) {
        this.Repository.Save(null, data, _callback, parentField, parentValue);
    }

    /**
     * Create Document list
     * @param data              {Object}            Data to Save or Update
     * @param _callback         {Function}          Callback Function
     * @param parentField       {String=}           Field Identifier of Parent Resource
     * @param parentValue       {String|Number=}    Identifier of Parent Resource
     * @callback _callback
     */
    CreateList (data, _callback, parentField, parentValue) {
        this.Repository.SaveList(null, data, _callback, parentField, parentValue);
    }

    /**
     * Update Document by Id
     * @param id                {Mixed}             Document Id
     * @param data              {Object}            Data to Save or Update
     * @param _callback         {Function}          Callback Function
     * @param parentField       {String=}           Field Identifier of Parent Resource
     * @param parentValue       {String|Number=}    Identifier of Parent Resource
     * @callback _callback
     */
    Update (id, data, _callback, parentField, parentValue) {
        this.Repository.Save(id, data, _callback, parentField, parentValue);
    }

    /**
     * Update Documents by Id list
     * @param ids               {Array}             Document Id list
     * @param data              {Object}            Data to Save or Update
     * @param _callback         {Function}          Callback Function
     * @param parentField       {String=}           Field Identifier of Parent Resource
     * @param parentValue       {String|Number=}    Identifier of Parent Resource
     * @callback _callback
     */
    UpdateList (ids, data, _callback, parentField, parentValue) {
        this.Repository.SaveList(ids, data, _callback, parentField, parentValue);
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
    UpdateByQuery(where, data, options, _callback) {
        this.Repository.Update(where, data, options, _callback);
    }

    /**
     * Remove Document by Id
     * @param id                {Mixed}             Document Id
     * @param _callback         {Function}          Callback Function
     * @param physical          {Boolean=}          Physically remove record from DB, Default is FALSE
     * @param parentField       {String=}           Field Identifier of Parent Resource
     * @param parentValue       {String|Number=}    Identifier of Parent Resource
     * @callback _callback
     */
    Remove (id, _callback, physical, parentField, parentValue) {
        this.Repository.Remove(id, _callback, physical, parentField, parentValue);
    }

    /**
     * Remove Documents by Id list
     * @param ids               {Array}             Document Id list
     * @param _callback         {Function}          Callback Function
     * @param physical          {Boolean=}          Physically remove record from DB, Default is FALSE
     * @param parentField       {String=}           Field Identifier of Parent Resource
     * @param parentValue       {String|Number=}    Identifier of Parent Resource
     * @callback _callback
     */
    RemoveList (ids, _callback, physical, parentField, parentValue) {
        this.Repository.RemoveList(ids, _callback, physical, parentField, parentValue);
    }

    /**
     * Delete Documents by Conditions
     * @param where             {Object=}           Conditions
     * @param _callback         {Function}          Callback Function
     * @param physical          {Boolean=}          Physically remove record from DB, Default is FALSE
     * @callback _callback
     */
    RemoveByQuery(where, _callback, physical) {
        this.Repository.RemoveByQuery(where, _callback, physical);
    }
}

module.exports = BaseBusiness;