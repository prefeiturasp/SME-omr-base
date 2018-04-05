"use strict";
var mongoose        = require('mongoose'),
    Enum            = require('../../class/Enumerator'),
    Schema          = mongoose.Schema;

/**
 * Base MongooseJS Schema
 */
class BaseSchema extends Schema {
    /**
     * Base MongooseJS Schema
     * @param model             {String}        Collection Name
     * @param fields            {Object}        MongooseJS Fields Object
     * @param options           {Object}        MongooseJS Options Object
     * @param logical           {Boolean=}      Default false, set to true to keep collection just in memory for
     *                                          inner document validation
     * @constructor
     */
    constructor (model, fields, options, logical) {
        if (!logical) {
            if (!fields.hasOwnProperty("creationDate")) fields.creationDate = {type: Date, required: false, index: true};
            if (!fields.hasOwnProperty("alterationDate")) fields.alterationDate = {type: Date, required: false, index: true};
            if (!fields.hasOwnProperty('status')) fields.status = {type: Number, required: false, index: true, default: Enum.DataStatus.ACTIVE};
            if (!options.hasOwnProperty("collection")) options.collection = model;
        }

        super(fields, options);

        this.Instance = mongoose.model(model, this);
        if (!logical) this.SetDefaults();
    }

    static get MiddlewareHook() {
        return {
            PRE: 'pre',
            POST: 'post',
            _regex: /pre|post/
        }
    };

    static get MiddlewareHookType() {
        return {
            Document: {
                INIT: 'init',
                VALIDATE: 'validate',
                SAVE: 'save',
                REMOVE: 'remove',
                _regex: /init|validate|save|remove/
            },
            Query: {
                COUNT: 'count',
                FIND: 'find',
                FIND_ONE: 'findOne',
                FIND_ONE_AND_REMOVE: 'findOneAndRemove',
                FIND_ONE_AND_UPDATE: 'findOneAndUpdate',
                UPDATE: 'update',
                _regex: /count|find|findOne|findOneAndRemove|findOneAndUpdate|update/
            }
        }
    };

    /**
     * Set Schema Default Settings
     */
    SetDefaults () {
        this.SetDocumentMiddleware(
            BaseSchema.MiddlewareHook.PRE,
            BaseSchema.MiddlewareHookType.Document.SAVE,
            function (next) {
                if (this.isNew) {
                    this.creationDate = new Date();
                    this.alterationDate = new Date();
                }
                else this.alterationDate = new Date();

                next();
            }
        );

        this.SetPathValidation('status', function (value) {
            return Enum.DataStatus._regex.test(value);
        }, "Invalid Status");
    }

    /**
     * Set MongooseJS Middleware
     * For information about how MongooseJS Middleware works, see http://mongoosejs.com/docs/middleware.html
     * @param hook              {String}        Hook from Enumerator.MiddlewareHook
     * @param type              {String}        Type from Enumerator.MiddlewareHookType.Document
     * @param fn                {Function}      MongooseJS Middleware Function
     */
    SetDocumentMiddleware(hook, type, fn) {
        var hookFn;

        if (hook == BaseSchema.MiddlewareHook.PRE) hookFn = this.Instance.schema.pre;
        else if (hook == BaseSchema.MiddlewareHook.POST) hookFn = this.Instance.schema.post;
        else console.error(new Error("Hook is Invalid"));

        if (!BaseSchema.MiddlewareHookType.Document._regex.test(type)) console.error(new Error("Type is Invalid"));
        else {
            hookFn.call(this.Instance.schema, type, fn);
        }
    };

    /**
     * Set MongooseJS Middleware
     * For information about how MongooseJS Middleware works, see http://mongoosejs.com/docs/middleware.html
     * @param hook              {String}        Hook from Enumerator.MiddlewareHook
     * @param type              {String}        Type from Enumerator.MiddlewareHookType.Query
     * @param fn                {Function}      MongooseJS Middleware Function
     */
    SetQueryMiddleware(hook, type, fn) {
        var hookFn;

        if (hook == BaseSchema.MiddlewareHook.PRE) hookFn = this.Instance.schema.pre;
        else if (hook == BaseSchema.MiddlewareHook.POST) hookFn = this.Instance.schema.post;
        else console.error(new Error("Hook is Invalid"));

        if (!BaseSchema.MiddlewareHookType.Query._regex.test(type)) console.error(new Error("Type is Invalid"));
        else {
            hookFn.call(this.Instance.schema, type, fn);
        }
    };

    /**
     * Set MongooseJS Path Validation
     * For information about how MongooseJS Path Validation works, see http://mongoosejs.com/docs/validation.html
     * @param field         {String}            Schema Path
     * @param fn            {Function=}         Validation Function
     * @param error         {String=}           Error Message
     * @param subSchema     {Boolean=}          Sub Schema Validation
     */
    SetPathValidation(field, fn, error, subSchema) {
        if (!fn && !error) return this.SetPathValidation.bind(
            this.Instance? this.Instance.schema.path(field).schema: this.path(field).schema
        );
        else if (subSchema) this.path(field).validate(fn, error);
        else this.Instance.schema.path(field).validate(fn, error);
    }

    /**
     * Get MongooseJS Model Instance
     * @return {Object}
     */
    GetInstance() {
        return this.Instance;
    }

    /**
     * Create Schema Sub Document
     * @param fields            {Object}        MongooseJS Fields Object
     * @return {Object}
     * @static
     */
    static SubDocument(fields) {
        return new Schema(
            fields,
            {
                _id: false
            }
        );
    }
}

module.exports = BaseSchema;