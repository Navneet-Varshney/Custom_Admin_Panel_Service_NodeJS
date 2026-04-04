const { validateBody } = require("@/middlewares/factory/field-validation.middleware-factory");
const { validationSets } = require("@/configs/validation-sets.config");

const validationMiddlewares = {
    validateCreateClientConversionRequest: validateBody(
        "createClientConversionRequest",
        validationSets.createClientConversionRequest
    )
};

module.exports = {
    validationMiddlewares
};
