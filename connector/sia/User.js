'use strict';
var BaseClient = require('./_BaseSIAClient');

class User extends BaseClient {

    /**
     * User
     * @param Config        {Object=}   Config Class
     * @constructor
     */
    constructor(Config) {
        super(`${Config.Connector.SIA.SUBFOLDER}/api/User`, Config);
    }

    /**
     * User Signin
     * @param login
     * @param password
     * @return {Promise}
     */
    Signin(login, password) {
        return new Promise((resolve, reject) => {
            this.SetHeaders({
                'Content-Type': 'application/json'
            });
            
            this.Post({
                'Login': login,
                'Password': password
            }, `/signin`)
            .then(resolve, reject);
        });
    }
}

module.exports = User;