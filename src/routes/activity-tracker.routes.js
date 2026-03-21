const express = require("express");
const activityTrackerRouter = express.Router();

const { activityTrackerMiddlewares } = require("@/middlewares/activity-trackers");
const { baseAuthAdminMiddlewares } = require("./middleware.gateway.routes");
const { ACTIVITY_TRACKER_ROUTES } = require("@/configs/uri.config");
const { activityTrackerControllers } = require("@/controllers/activity-trackers");
const { generalApiRateLimiter } = require("@/rate-limiters/general-api.rate-limiter");
const { ensureAdminExists } = require("@/middlewares/admins/fetch-admin.middleware");
const { hierarchyGuard } = require("@/middlewares/admins/role-hierarchy.middleware");
const { 
  getAdminActivitiesRateLimiter,
  listActivitiesRateLimiter,
  getMyActivitiesRateLimiter
} = require("@/rate-limiters/general-api.rate-limiter");

const { 
  GET_ADMIN_ACTIVITIES, 
  LIST_ACTIVITIES,
  GET_MY_ACTIVITIES 
} = ACTIVITY_TRACKER_ROUTES;
const {
  listActivitiesRoleAuthorizeMiddleware,
  getAdminActivitiesFieldPresenceMiddleware,
  getAdminActivitiesValidationMiddleware
} = activityTrackerMiddlewares;

/**
 * @route   POST /activity-trackers/admin-activities
 * @desc    Get activity tracker for a specific admin (requires reason)
 * @access  Admin (SUPER_ADMIN, OPERATIONS_ADMIN, SUPPORT_ADMIN, AUDIT_ADMIN, INTERNAL_ADMIN)
 * @body    { adminId, reason, reasonDescription }
 * @logs    Logs the viewing action to activity tracker
 */
activityTrackerRouter.post(`${GET_ADMIN_ACTIVITIES}`,
  [
    ...baseAuthAdminMiddlewares,
    getAdminActivitiesRateLimiter,
    getAdminActivitiesFieldPresenceMiddleware,
    getAdminActivitiesValidationMiddleware,
    ensureAdminExists,
    hierarchyGuard
  ],
  activityTrackerControllers.getAdminActivities);

/**
 * @route   POST /activity-trackers/list
 * @desc    List all activities with pagination (no reason required)
 * @access  Admin (SUPER_ADMIN, OPERATIONS_ADMIN, SUPPORT_ADMIN, AUDIT_ADMIN, INTERNAL_ADMIN)
 * @body    { limit?, page? }
 * @logs    Logs the listing action to activity tracker
 */
activityTrackerRouter.get(`${LIST_ACTIVITIES}`,
  [
    ...baseAuthAdminMiddlewares,
    listActivitiesRateLimiter,
    listActivitiesRoleAuthorizeMiddleware
  ],
  activityTrackerControllers.listActivities);

/**
 * @route   POST /activity-trackers/my-activities
 * @desc    Get current admin's own activities (no reason required, no logging)
 * @access  All Admins
 * @body    { limit?, page? }
 * @logs    Does NOT log to activity tracker (viewing own activities is not tracked)
 */
activityTrackerRouter.get(`${GET_MY_ACTIVITIES}`,
  [
    ...baseAuthAdminMiddlewares,
    getMyActivitiesRateLimiter
  ],
  activityTrackerControllers.getMyActivities);

module.exports = {
    activityTrackerRouter
}
