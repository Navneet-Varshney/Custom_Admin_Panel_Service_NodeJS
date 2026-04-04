const { checkBodyPresence } = require("@/middlewares/factory/validate-request-body.middleware-factory");
const { requiredFields } = require("@/configs/required-fields.config");

const presenceMiddlewares = {
    createClientConversionRequestFieldPresenceMiddleware: checkBodyPresence(
        "createClientConversionRequestFieldPresence",
        requiredFields.createClientConversionRequestField
    )
};

module.exports = {
    presenceMiddlewares
};
