'use strict';
var Crypto = require('crypto');
var Config = require('../config/Config');

class Cryptography {

    /**
     * Encrypt
     * @param value {String}
     * @param type {String=}
     * @param secret {String=}
     * @param encoding {String=}
     * @return {String}
     * @static
     */
    static encrypt (value, type, secret, encoding) {
        type = type || Config.Cryptography.TYPE;
        secret = secret || Config.Cryptography.SECRET;
        encoding = encoding || Config.Cryptography.ENCODING;

        var cipher = Crypto.createCipher(type, secret);
        var encrypted = cipher.update(value, 'utf8', encoding);
        encrypted += cipher.final(encoding);

        return encrypted;
    }

    /**
     * Decrypt
     * @param value {String}
     * @param type {String=}
     * @param secret {String=}
     * @param encoding {String=}
     * @return {String}
     * @static
     */
    static decrypt (value, type, secret, encoding) {
        type = type || Config.Cryptography.TYPE;
        secret = secret || Config.Cryptography.SECRET;
        encoding = encoding || Config.Cryptography.ENCODING;

        var decipher = Crypto.createDecipher(type, secret);
        var decrypted = decipher.update(value, encoding, 'utf8');
        decrypted += decipher.final('utf8');

        return decrypted;
    }
}

module.exports = Cryptography;