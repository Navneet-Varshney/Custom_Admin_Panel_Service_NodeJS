const { validateBody, validateParams, validateQuery } = require("../factory/field-validation.middleware-factory");
const { validationSets } = require("@configs/validation-sets.config.js");

const createAdminValidationMiddleware = validateBody("createAdmin", validationSets.createAdmin);
const createUserValidationMiddleware = validateBody("createUser", validationSets.createUser);

const validationMiddlewares = {
    createAdminValidationMiddleware,
    createUserValidationMiddleware
}

module.exports = {
    validationMiddlewares
}