const { checkBodyPresence, checkParamsPresence, checkQueryPresence } = require("../factory/validate-request-body.middleware-factory");
const {
    requiredFields
} = require("@configs/required-fields.config.js");

const deviceBlockUnblockPresenceMiddlewares = {
    blockDeviceFieldPresenceMiddleware: checkBodyPresence("blockDeviceFieldPresence", requiredFields.blockDeviceField),
    unblockDeviceFieldPresenceMiddleware: checkBodyPresence("unblockDeviceFieldPresence", requiredFields.unblockDeviceField)
};

module.exports = {
    deviceBlockUnblockPresenceMiddlewares
};