// ACTIVITY TRACKER SUCCESS RESPONSES

const { OK } = require("@/configs/http-status.config");

/**
 * Formats a single activity tracker record for response
 * @param {Object} activity - Activity tracker document
 * @returns {Object} Formatted activity object
 */
const formatActivityTrackerRecord = (activity) => {
  return {
    id: activity._id,
    adminId: activity.adminId,
    eventType: activity.eventType,
    deviceUUID: activity.deviceUUID,
    deviceName: activity.deviceName,
    deviceType: activity.deviceType,
    performedBy: activity.performedBy,
    description: activity.description,
    oldData: activity.oldData,
    newData: activity.newData,
    adminActions: activity.adminActions ? {
      targetId: activity.adminActions.targetId,
      performedOn: activity.adminActions.performedOn,
      reason: activity.adminActions.reason,
      reasonDescription: activity.adminActions.reasonDescription,
      filter: activity.adminActions.filter
    } : null,
    createdAt: activity.createdAt,
    updatedAt: activity.updatedAt
  };
};

const formatMyActivityRecord = (activity) => {
  return {
    id: activity._id,
    eventType: activity.eventType,
    description: activity.description,
    performedAt: activity.createdAt,

    deviceName: activity.deviceName,
    deviceType: activity.deviceType,

    performedOn: activity.adminActions?.performedOn || null,
    targetId: activity.adminActions?.targetId || null
  };
};

/**
 * Send response for getting a single admin activity
 * @param {Object} res - Express response object
 * @param {Object} activity - Activity tracker document
 */
const getAdminActivitiesSuccessResponse = (res, adminId, activities) => {
  return res.status(OK).json({
    success: true,
    message: `Retrieved ${activities.length} activities for admin ${adminId}`,
    data: activities.map(activity => formatActivityTrackerRecord(activity))
  });
};

/**
 * Send response for listing all activities
 * @param {Object} res - Express response object
 * @param {Array} activities - Array of activity tracker documents
 * @param {Object} pagination - Pagination info {total, page, limit, pages}
 */
const listActivitiesSuccessResponse = (res, activities, pagination = null) => {
  const response = {
    success: true,
    message: "Activities retrieved successfully.",
    data: activities.map(activity => formatActivityTrackerRecord(activity))
  };

  if (pagination) {
    response.pagination = pagination;
  }

  return res.status(OK).json(response);
};

/**
 * Send response for getting my activities (own activities)
 * @param {Object} res - Express response object
 * @param {Array} activities - Array of activity tracker documents (user's own activities)
 * @param {Object} pagination - Pagination info {total, page, limit, pages}
 */
const getMyActivitiesSuccessResponse = (res, activities, pagination = null) => {
  const response = {
    success: true,
    message: "My activities retrieved successfully.",
    data: activities.map(activity => formatMyActivityRecord(activity))
  };

  if (pagination) {
    response.pagination = pagination;
  }

  return res.status(OK).json(response);
};

const activityTrackerSuccessResponses = {
  getAdminActivitiesSuccessResponse,
  listActivitiesSuccessResponse,
  getMyActivitiesSuccessResponse,
  formatActivityTrackerRecord
};

module.exports = {
  activityTrackerSuccessResponses
};
