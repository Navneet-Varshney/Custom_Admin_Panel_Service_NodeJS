const { roleAuthorize } = require("../factory/role-authorize.middleware-factory");
const { ACTIVITY_TRACKER_ROUTE_AUTHORIZATION } = require("@configs/api-role-permission.config.js");

const activityTrackerRoleAuthorizeMiddlewares = {
    listActivitiesRoleAuthorizeMiddleware: roleAuthorize(ACTIVITY_TRACKER_ROUTE_AUTHORIZATION.LIST_ACTIVITIES)
}

module.exports = {
    activityTrackerRoleAuthorizeMiddlewares
}
