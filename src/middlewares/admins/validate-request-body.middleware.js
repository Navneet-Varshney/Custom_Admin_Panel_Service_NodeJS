const { checkBodyPresence, checkParamsPresence, checkQueryPresence } = require("../factory/validate-request-body.middleware-factory");
const {
    requiredFields
} = require("@configs/required-fields.config.js");

const presenceMiddlewares = {
    createAdminFieldPresenceMiddleware: checkBodyPresence("createAdminFieldPresence", requiredFields.createAdminField),
    createClientFieldPresenceMiddleware: checkBodyPresence("createClientFieldPresence", requiredFields.createClientField),
    convertUserToClientFieldPresenceMiddleware: checkBodyPresence("convertUserToClientFieldPresence", requiredFields.convertUserToClientField),
    blockAdminFieldPresenceMiddleware: checkBodyPresence("blockAdminFieldPresence", requiredFields.blockAdminField),
    unblockAdminFieldPresenceMiddleware: checkBodyPresence("unblockAdminFieldPresence", requiredFields.unblockAdminField)
}

module.exports = {
    presenceMiddlewares
}