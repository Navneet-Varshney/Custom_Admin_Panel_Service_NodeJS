// LIST ACTIVITIES SERVICE

const { ActivityTrackerModel } = require("@models/activity-tracker.model");
const { logWithTime } = require("@utils/time-stamps.util");
const { logActivityTrackerEvent } = require("@/services/audit/activity-tracker.service");
const { ACTIVITY_TRACKER_EVENTS } = require("@configs/tracker.config");
const { DB_COLLECTIONS } = require("@/configs/db-collections.config");

// Default pagination settings
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;
const DEFAULT_PAGE = 1;

/**
 * List activities service
 * Retrieves a paginated list of all activities and logs the list action
 * @param {Object} viewerAdmin - The admin viewing the activities
 * @param {number} limit - Number of activities per page (optional, defaults to 20)
 * @param {number} page - Page number (optional, defaults to 1)
 * @param {Object} device - Device object {deviceUUID, deviceType, deviceName}
 * @param {string} requestId - Request ID for tracking
 * @returns {Promise<{success: boolean, data?: Array, pagination?: Object, type?: string, message?: string}>}
 */
const listActivitiesService = async (viewerAdmin, limit = DEFAULT_LIMIT, page = DEFAULT_PAGE, device, requestId) => {
  try {
    // Validate and normalize pagination params
    let normalizedLimit = parseInt(limit, 10) || DEFAULT_LIMIT;
    let normalizedPage = parseInt(page, 10) || DEFAULT_PAGE;

    // Enforce limits to prevent abuse
    if (normalizedLimit > MAX_LIMIT) {
      normalizedLimit = MAX_LIMIT;
    }
    if (normalizedLimit < 1) {
      normalizedLimit = 1;
    }
    if (normalizedPage < 1) {
      normalizedPage = 1;
    }

    // Calculate skip for pagination
    const skip = (normalizedPage - 1) * normalizedLimit;

    // Fetch total count for pagination info
    const totalCount = await ActivityTrackerModel.countDocuments();

    // Fetch activities with pagination
    const activities = await ActivityTrackerModel.find({})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(normalizedLimit)
      .lean();

    const totalPages = Math.ceil(totalCount / normalizedLimit);

    logWithTime(`✅ Retrieved ${activities.length} activities (Page ${normalizedPage}/${totalPages}) by ${viewerAdmin.adminId}`);

    // Log this listing action to activity tracker
    logActivityTrackerEvent(
      viewerAdmin,
      device,
      requestId,
      ACTIVITY_TRACKER_EVENTS.LIST_ACTIVITY_TRACKER,
      `Listed activity tracker (Page ${normalizedPage}, Limit ${normalizedLimit})`,
      {
        oldData: null,
        newData: null,
        adminActions: {
          targetId: null,
          performedOn: DB_COLLECTIONS.ACTIVITY_TRACKERS,
          reason: null,
          reasonDescription: null
        }
      }
    );

    return {
      success: true,
      data: activities,
      pagination: {
        page: normalizedPage,
        limit: normalizedLimit,
        total: totalCount,
        pages: totalPages
      }
    };

  } catch (err) {
    logWithTime(`❌ Error in listActivitiesService: ${err.message}`);
    return {
      success: false,
      type: "DATABASE_ERROR",
      message: "Failed to retrieve activities list"
    };
  }
};

module.exports = { listActivitiesService };
