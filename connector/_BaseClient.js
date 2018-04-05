'use strict';
const http = require('http');
const https = require('https');
const qs = require('querystring');
const fs = require('fs');
const Enumerator = require('../class/Enumerator');

class BaseClient {

    /**
     * Base Client
     * @param _host         {String}    Client Host
     * @param _port         {Number}    Client Port
     * @param _path         {String}    Client Path
     * @param _auth         {Object}    Client Basic Authentication
     * @param _auth.user    {String}    Basic Authentication Username
     * @param _auth.pass    {String}    Basic Authentication Password
     * @constructor
     */
    constructor(_host, _port, _path, _auth) {
        this.HOST = _host;
        this.PORT = _port;
        this.PATH = _path;

        if (_auth) {
            this.USERNAME = _auth.user || undefined;
            this.PASSWORD = _auth.pass || undefined;
        }
    }

    /**
     * Set Request Headers
     * @param _headers      {Object}    Request Headers
     */
    SetHeaders(_headers) {
        this.HEADERS = _headers;
    }

    /**
     * Add new item to Request Headers
     * @param key           {String}    Header Key
     * @param value         {String}    Header Value
     */
    SetHeader(key, value) {
        if (!this.HEADERS) this.HEADERS = {};
        this.HEADERS[key] = value;
    }

    /**
     * Prepare Request
     * @param pathSuffix    {String=}   PathSuffix
     * @param queryString   {Object=}   Query String object
     * @return {Object}     Request Options
     */
    Prepare(pathSuffix, queryString) {
        var options, path;
        path = this.PATH;

        if (pathSuffix) path += pathSuffix;
        if (queryString) path += `?${qs.stringify(queryString)}`;

        options = {
            hostname: this.HOST,
            path: path,
            method: this.METHOD,
            headers: this.HEADERS || {},
            port: this.PORT
        };

        if (this.USERNAME && this.PASSWORD) {
            options["auth"] = this.USERNAME + ":" + this.PASSWORD
        }

        return options;
    }

    /**
     * Get Method
     * @param pathSuffix    {String=}   PathSuffix
     * @param queryString   {Object=}   Query String object
     * @return {Promise}    Request Promise
     */
    Get(pathSuffix, queryString) {
        this.METHOD = "GET";
        return new Promise(function (resolve, reject) {
            var options, req;

            options = this.Prepare(pathSuffix, queryString);
            req = http.get(
                options,
                (res) => {
                    var body = '';
                    res.on('data', (chunk) => {
                        body += chunk;
                    });

                    res.on('end', () => {
                        var response;
                        if (res.statusCode < 400) {
                            try {
                                response = JSON.parse(body);
                            } catch (err) {
                                response = body;
                            }

                            resolve(response);
                        }
                        else reject(new Error(body || `${res.statusCode} - ${res.statusMessage}`));
                    })
                }
            );

            req.on('error', function (err) {
                reject(err);
            });
            req.end();
        }.bind(this));
    }

    /**
     * POST Method
     * @param _data         {Object}    Request Data
     * @param pathSuffix    {String=}   PathSuffix
     * @param queryString   {Object=}   Query String object
     * @return {Promise}    Request Promise
     */
    Post(_data, pathSuffix, queryString) {
        this.METHOD = "POST";
        return this.Sender(_data, pathSuffix, queryString);
    }

    /**
     * PUT Method
     * @param _data         {Object}    Request Data
     * @param pathSuffix    {String=}   PathSuffix
     * @param queryString   {Object=}   Query String object
     * @return {Promise}    Request Promise
     */
    Put(_data, pathSuffix, queryString) {
        this.METHOD = "PUT";
        return this.Sender(_data, pathSuffix, queryString);
    }

    /**
     * DELETE Method
     * @param _data         {Object}    Request Data
     * @param pathSuffix    {String=}   PathSuffix
     * @param queryString   {Object=}   Query String object
     * @return {Promise}    Request Promise
     */
    Delete(_data, pathSuffix, queryString) {
        this.METHOD = "DELETE";
        return this.Sender(_data, pathSuffix, queryString);
    }

    /**
     * Base Sender Function
     * @param _data         {Object}    Request Data
     * @param pathSuffix    {String=}   PathSuffix
     * @param queryString   {Object=}   Query String object
     * @return {Promise}    Request Promise
     */
    Sender(_data, pathSuffix, queryString) {
        return new Promise(function (resolve, reject) {
            var options, req;

            options = this.Prepare(pathSuffix, queryString);
            req = http.request(
                options,
                (res) => {
                    var body = '';
                    res.on('data', (chunk) => {
                        body += chunk;
                    });

                    res.on('end', () => {
                        var response;
                        if (res.statusCode < 400) {
                            try {
                                response = JSON.parse(body);
                            } catch (err) {
                                response = body;
                            }

                            resolve(response);
                        }
                        else reject(new Error(body || `${res.statusCode} - ${res.statusMessage}`));
                    })
                }
            );

            req.on('error', function (err) {
                reject(err);
            });

            req.write(JSON.stringify(_data));
            req.end();
        }.bind(this));
    }

    /**
     *
     * @param url
     * @param saveLocation
     * @return {Promise}
     * @static
     */
    static DirectDownload(url, saveLocation) {
        return new Promise((resolve, reject) => {
            var requester;

            if (url.match(/https/i)) requester = https;
            else requester = http;

            requester.get(url, (res) => {
                if (res.statusCode < 400 && res.headers.hasOwnProperty('content-type') && res.headers['content-type'].match(Enumerator.FileExtensions)) {
                    try {
                        let file = fs.createWriteStream(saveLocation);
                        res.pipe(file);
                        file.on('finish', () => {
                            file.close(resolve);
                        })
                    } catch (err) {
                        reject(err);
                    }
                }
                else reject(new Error(`${res.statusCode} - ${res.statusMessage}`));
            })
            .on('error', reject);
        })
    }
}

module.exports = BaseClient;