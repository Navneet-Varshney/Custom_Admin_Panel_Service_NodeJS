const { checkBodyPresence } = require("../factory/validate-request-body.middleware-factory");
const {
    requiredFields
} = require("@configs/required-fields.config.js");

const activityTrackerPresenceMiddlewares = {
    getAdminActivitiesFieldPresenceMiddleware: checkBodyPresence("getAdminActivitiesFieldPresence", requiredFields.getAdminActivitiesField)
}

module.exports = {
    activityTrackerPresenceMiddlewares
}
