"use strict";
var mongoose    = require('mongoose');
var Cryptography = require('./Cryptography');
var Config = require('../config/Config');

module.exports = function(connString) {
    try {
        if (!Config.Cryptography.DISABLED) connString = Cryptography.decrypt(connString);

        mongoose.Promise = Promise;
        mongoose.connect(connString);
        return mongoose.connection;
    } catch (ex) {
        throw ex;
    }
};