"use strict";
var bcrypt          = require('bcrypt-nodejs'),
    crypto          = require('crypto'),
    jwt             = require('jsonwebtoken'),
    BaseBusiness    = require('./_BaseBusiness'),
    UserRepository  = require('../repository/User.repo');

class UserBusiness extends BaseBusiness {

    /**
     * User Business
     * @class UserBusiness
     * @extends BaseBusiness
     * @param Config            {Config}            Config Class
     * @param Enumerator        {Enumerator}        Enumerator Class
     */
    constructor (Config, Enumerator) {
        super(new UserRepository());
        this.Config = Config;
        this.Enumerator = Enumerator;
    }

    /**
     * User Login Method
     * @param _data             {Object}            Input Data
     * @param _callback         {Function}          Callback Function
     * @param raw               {Boolean=}          If true, return the entire User Document, else return only security tokens
     * @callback
     */
    Login (_data, _callback, raw) {
        var query = {
            'authentication.local.login': _data.login
        };
        this.Repository.GetList(query, null, null, null, function(err, data) {
            var _accessToken,
                _refreshToken,
                error = new Error("User or password is invalid."),
                currDate = new Date();

            if (err) _callback(err);
            else if (!data.length) _callback(error);
            else {
                bcrypt.compare(_data.password, data[0].authentication.local.password, function (err, res) {
                    var login;
                    if (err) _callback(err);
                    else if (!res) _callback(error);
                    else {
                        if (this.Config.Auth.TYPE == this.Enumerator.AuthenticationType.LOCAL) login = data[0].authentication.local.login;

                        _accessToken= jwt.sign({
                            _id: data[0]._id,
                            login: login,
                            isAdmin: data[0].authentication.security.isAdmin
                        }, this.Config.Auth.GLOBAL.SECRET, {
                            expiresIn: this.Config.Auth.GLOBAL.EXPIRATION.TOKEN
                        });

                        _refreshToken = bcrypt.hashSync(data[0]._id + Date.now().toString(), bcrypt.genSaltSync(8), null);
                        currDate = currDate.setMilliseconds(currDate.getMilliseconds() + this.Config.Auth.GLOBAL.EXPIRATION.REFRESH);

                        if (data[0].authentication.hasOwnProperty("security")) {
                            data[0].authentication.security.refresh = {
                                token: _refreshToken,
                                expiration: currDate
                            }
                        }
                        else {
                            data[0].authentication.security = {
                                refresh: {
                                    token: _refreshToken,
                                    expiration: currDate
                                }
                            };
                        }

                        this.Repository.Save(data[0]._id, data[0], function (err, doc) {
                            if (err) _callback(err);
                            else {
                                if (raw) _callback(null, doc);
                                else {
                                    _callback(null, {
                                        accessToken: _accessToken,
                                        refreshToken: _refreshToken
                                    })
                                }
                            }
                        });
                    }
                }.bind(this));
            }
        }.bind(this));
    }

    /**
     * Refresh User Authentication Token
     * @param id                {Mixed}             User Id
     * @param token             {String}            Refresh Token
     * @param _callback         {Function}          Callback Function
     * @callback
     */
    RefreshToken (id, token, _callback) {
        this.GetById(id, function (err, doc) {
            var _accessToken,
                _refreshToken,
                currDate = new Date(),
                login;
            if (err) _callback(err);
            else if (!doc) _callback(new Error("403"));
            else if (token != doc.authentication.security.refresh.token) _callback(new Error("403"));
            else if (new Date(doc.authentication.security.refresh.expiration) < currDate) _callback(new Error("403"));
            else {
                if (this.Config.Auth.TYPE == this.Enumerator.AuthenticationType.LOCAL) login = doc.authentication.local.login;

                _accessToken= jwt.sign({
                    _id: doc._id,
                    login: login,
                    isAdmin: doc.isAdmin
                }, this.Config.Auth.GLOBAL.SECRET, {
                    expiresIn: this.Config.Auth.GLOBAL.EXPIRATION.TOKEN
                });

                _refreshToken = bcrypt.hashSync(doc._id + Date.now().toString(), bcrypt.genSaltSync(8), null);
                currDate = currDate.setMilliseconds(currDate.getMilliseconds() + this.Config.Auth.GLOBAL.EXPIRATION.REFRESH);

                doc.authentication.security.refresh = {
                    token: _refreshToken,
                    expiration: currDate
                };

                this.Repository.Save(doc._id, doc, function (err) {
                    if (err) _callback(err);
                    else {
                        _callback(null, {
                            accessToken: _accessToken,
                            refreshToken: _refreshToken
                        })
                    }
                });
            }
        }.bind(this));
    }
}

module.exports = UserBusiness;
