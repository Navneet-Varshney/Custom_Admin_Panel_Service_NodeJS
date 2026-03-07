const { checkBodyPresence, checkParamsPresence, checkQueryPresence } = require("../factory/validate-request-body.middleware-factory");
const {
    createAdminField,
    createUserField
} = require("@configs/required-fields.config.js");

const createAdminFieldPresenceMiddleware = checkBodyPresence("createAdminFieldPresence", createAdminField);
const createUserFieldPresenceMiddleware = checkBodyPresence("createUserFieldPresence", createUserField);

const presenceMiddlewares = {
    createAdminFieldPresenceMiddleware,
    createUserFieldPresenceMiddleware
}

module.exports = {
    presenceMiddlewares
}