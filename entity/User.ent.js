"use strict";
var UserSchema   = require('./schema/User.scm');

var UserEntity = new UserSchema (
    {
        name: { type: String, required: true },
        authentication: {
            security: {
                refresh: {
                    token: String,
                    expiration: Date
                },
                recover: {
                    token: String,
                    expiration: Date
                },
                isAdmin: Boolean,
                isRoot: { type: Boolean, default: false }
            },
            local: {
                login: String,
                password: {type: String}
            },
            saml: {
                login: String,
                externalId: { type: String, index: true },
                context: String,
                systems: [UserSchema.Types.Mixed]
            }
        }
    }
);

var User = UserEntity.GetInstance();

module.exports = User;
