const { checkBodyPresence, checkParamsPresence, checkQueryPresence } = require("../factory/validate-request-body.middleware-factory");
const {
    createAdminField,
    createUserField,
    convertUserToClientField
} = require("@configs/required-fields.config.js");

const createAdminFieldPresenceMiddleware = checkBodyPresence("createAdminFieldPresence", createAdminField);
const createUserFieldPresenceMiddleware = checkBodyPresence("createUserFieldPresence", createUserField);
const convertUserToClientFieldPresenceMiddleware = checkBodyPresence("convertUserToClientFieldPresence", convertUserToClientField);

const presenceMiddlewares = {
    createAdminFieldPresenceMiddleware,
    createUserFieldPresenceMiddleware,
    convertUserToClientFieldPresenceMiddleware
}

module.exports = {
    presenceMiddlewares
}