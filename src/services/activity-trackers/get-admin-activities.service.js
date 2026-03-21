// GET ADMIN ACTIVITIES SERVICE

const { ActivityTrackerModel } = require("@models/activity-tracker.model");
const { logWithTime } = require("@utils/time-stamps.util");
const { logActivityTrackerEvent } = require("@/services/audit/activity-tracker.service");
const { ACTIVITY_TRACKER_EVENTS } = require("@configs/tracker.config");
const { DB_COLLECTIONS } = require("@/configs/db-collections.config");

/**
 * Get admin activities service
 * Retrieves all activities of a specific admin and logs the viewing action
 * @param {Object} viewerAdmin - The admin viewing the activities
 * @param {string} targetAdminId - The admin ID whose activities to retrieve
 * @param {Object} device - Device object {deviceUUID, deviceType, deviceName}
 * @param {string} requestId - Request ID for tracking
 * @param {string} reason - Reason for viewing activities
 * @param {string} reasonDescription - Optional description of the reason
 * @returns {Promise<{success: boolean, data?: Array, type?: string, message?: string}>}
 */
const getAdminActivitiesService = async (viewerAdmin, targetAdminId, device, requestId, reason, reasonDescription) => {
  try {
    // Fetch all activities for the target admin
    const activities = await ActivityTrackerModel.find({ adminId: targetAdminId })
      .sort({ createdAt: -1 })
      .lean();

    logWithTime(`✅ Retrieved ${activities.length} activities for admin: ${targetAdminId} by ${viewerAdmin.adminId}`);

    // Log this viewing action to activity tracker
    // This event tracks that an admin viewed another admin's activities
    logActivityTrackerEvent(
      viewerAdmin,
      device,
      requestId,
      ACTIVITY_TRACKER_EVENTS.VIEW_ADMIN_ACTIVITY_TRACKER,
      `Viewed activity tracker for admin ${targetAdminId}`,
      {
        oldData: null,
        newData: null,
        adminActions: {
          targetId: null,
          performedOn: DB_COLLECTIONS.ACTIVITY_TRACKERS,
          reason: reason,
          reasonDescription: reasonDescription
        }
      }
    );

    return {
      success: true,
      data: activities
    };

  } catch (err) {
    logWithTime(`❌ Error in getAdminActivitiesService: ${err.message}`);
    return {
      success: false,
      type: "DATABASE_ERROR",
      message: "Failed to retrieve admin activities"
    };
  }
};

module.exports = { getAdminActivitiesService };
