const { validateBody, validateParams, validateQuery } = require("../factory/field-validation.middleware-factory");
const { validationSets } = require("@configs/validation-sets.config.js");

const validationMiddlewares = {
    createAdminValidationMiddleware: validateBody("createAdmin", validationSets.createAdmin),
    createClientValidationMiddleware: validateBody("createClient", validationSets.createClient),
    convertUserToClientValidationMiddleware: validateBody("convertUserToClient", validationSets.convertUserToClient),
    blockAdminValidationMiddleware: validateBody("blockAdmin", validationSets.blockAdmin),
    unblockAdminValidationMiddleware: validateBody("unblockAdmin", validationSets.unblockAdmin)
}

module.exports = {
    validationMiddlewares
}