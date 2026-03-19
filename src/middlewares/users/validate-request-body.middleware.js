const { checkBodyPresence, checkParamsPresence, checkQueryPresence } = require("../factory/validate-request-body.middleware-factory");
const {
    requiredFields
} = require("@configs/required-fields.config.js");

const userBlockUnblockPresenceMiddlewares = {
    blockUserFieldPresenceMiddleware: checkBodyPresence("blockUserFieldPresence", requiredFields.blockUserField),
    unblockUserFieldPresenceMiddleware: checkBodyPresence("unblockUserFieldPresence", requiredFields.unblockUserField)
};

module.exports = {
    userBlockUnblockPresenceMiddlewares
};