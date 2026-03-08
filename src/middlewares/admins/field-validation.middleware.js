const { validateBody, validateParams, validateQuery } = require("../factory/field-validation.middleware-factory");
const { validationSets } = require("@configs/validation-sets.config.js");

const createAdminValidationMiddleware = validateBody("createAdmin", validationSets.createAdmin);
const createUserValidationMiddleware = validateBody("createUser", validationSets.createUser);
const convertUserToClientValidationMiddleware = validateBody("convertUserToClient", validationSets.convertUserToClient);

const validationMiddlewares = {
    createAdminValidationMiddleware,
    createUserValidationMiddleware,
    convertUserToClientValidationMiddleware
}

module.exports = {
    validationMiddlewares
}