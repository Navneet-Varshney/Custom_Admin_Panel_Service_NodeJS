const { validateBody, validateParams, validateQuery } = require("../factory/field-validation.middleware-factory");
const { validationSets } = require("@configs/validation-sets.config.js");

const userBlockUnblockValidationMiddlewares = {
    blockUserValidationMiddleware: validateBody("blockUser", validationSets.blockUser),
    unblockUserValidationMiddleware: validateBody("unblockUser", validationSets.unblockUser)
};

module.exports = {
    userBlockUnblockValidationMiddlewares
};