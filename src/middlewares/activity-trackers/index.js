const { activityTrackerValidationMiddlewares } = require("./field-validation.middleware");
const { activityTrackerRoleAuthorizeMiddlewares } = require("./role-authorize.middleware");
const { activityTrackerPresenceMiddlewares } = require("./validate-request-body.middleware");

const activityTrackerMiddlewares = {
    ...activityTrackerValidationMiddlewares,
    ...activityTrackerRoleAuthorizeMiddlewares,
    ...activityTrackerPresenceMiddlewares
}

module.exports = {
    activityTrackerMiddlewares
}
