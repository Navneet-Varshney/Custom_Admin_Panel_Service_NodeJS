// GET MY ACTIVITIES SERVICE

const { ActivityTrackerModel } = require("@models/activity-tracker.model");
const { logWithTime } = require("@utils/time-stamps.util");

// Default pagination settings
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;
const DEFAULT_PAGE = 1;

/**
 * Get my activities service
 * Retrieves a paginated list of the current admin's own activities (no logging needed)
 * @param {Object} admin - The admin requesting their own activities
 * @param {number} limit - Number of activities per page (optional, defaults to 20)
 * @param {number} page - Page number (optional, defaults to 1)
 * @returns {Promise<{success: boolean, data?: Array, pagination?: Object, type?: string, message?: string}>}
 */
const getMyActivitiesService = async (admin, limit = DEFAULT_LIMIT, page = DEFAULT_PAGE) => {
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

    // Fetch total count of admin's own activities
    const totalCount = await ActivityTrackerModel.countDocuments({ adminId: admin.adminId });

    // Fetch admin's activities with pagination
    const activities = await ActivityTrackerModel.find({ adminId: admin.adminId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(normalizedLimit)
      .lean();

    const totalPages = Math.ceil(totalCount / normalizedLimit);

    logWithTime(`✅ Retrieved ${activities.length} own activities for admin: ${admin.adminId} (Page ${normalizedPage}/${totalPages})`);

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
    logWithTime(`❌ Error in getMyActivitiesService: ${err.message}`);
    return {
      success: false,
      type: "DATABASE_ERROR",
      message: "Failed to retrieve your activities"
    };
  }
};

module.exports = { getMyActivitiesService };
