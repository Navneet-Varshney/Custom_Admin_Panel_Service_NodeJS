const { validateBody } = require("../factory/field-validation.middleware-factory");
const { validationSets } = require("@configs/validation-sets.config.js");

const activityTrackerValidationMiddlewares = {
    getAdminActivitiesValidationMiddleware: validateBody("getAdminActivities", validationSets.getAdminActivities)
}

module.exports = {
    activityTrackerValidationMiddlewares
}
