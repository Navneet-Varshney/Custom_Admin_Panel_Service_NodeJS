const { OrganizationUserModel } = require("@/models/organizational-user.model");
const { logWithTime } = require("@utils/time-stamps.util");
const { logActivityTrackerEvent } = require("@/services/audit/activity-tracker.service");
const { ACTIVITY_TRACKER_EVENTS } = require("@configs/tracker.config");
const { OrganizationUserErrorTypes } = require("@/configs/service-error.config");
const { DB_COLLECTIONS } = require("@/configs/db-collections.config");
const { prepareAuditData } = require("@utils/audit-data.util");
const { checkOrgExists } = require("../organizations/check-org-exists.service");

/**
 * Create Organization User Service
 * @param {Object} creatorAdmin - The admin creating the org user
 * @param {Object} orgUserData - Org user data {userId, organizationId, role, creationReason}
 * @param {Object} device - Device object {deviceUUID, deviceType, deviceName}
 * @param {string} requestId - Request ID for tracking
 * @returns {Promise<{success: boolean, data?: Object, type?: string, message?: string}>}
 */
const createOrgUserService = async (creatorAdmin, orgUserData, device, requestId) => {
  try {
    const { user, organizationId, role, creationReason, reasonDescription = undefined } = orgUserData;

    const userId = user.userId;

    logWithTime(`🔄 Creating organization user: ${userId} for org ${organizationId}...`);

    const orgCheck = await checkOrgExists([organizationId]);
    if (!orgCheck) {
      return {
        success: false,
        type: OrganizationUserErrorTypes.INVALID_DATA,
        message: "Organization ID is invalid"
      };
    }

    // Check if user already exists in organization
    const existingOrgUser = await OrganizationUserModel.findOne({
      userId: user._id,
      organizationId,
      deletedAt: null
    });

    if (existingOrgUser) {
      return {
        success: false,
        type: OrganizationUserErrorTypes.DUPLICATE_ASSIGNMENT,
        message: "User is already assigned to this organization"
      };
    }

    // Create new org user
    const newOrgUser = new OrganizationUserModel({
      userId: user._id,
      organizationId,
      role,
      createdBy: creatorAdmin.adminId,
      isActive: true
    });

    await newOrgUser.save();

    logWithTime(`✅ Organization user created: ${newOrgUser._id}`);

    // Prepare audit data (creation: oldData is null)
    const { oldData, newData } = prepareAuditData(null, newOrgUser);

    // Log activity
    logActivityTrackerEvent(
      creatorAdmin,
      device,
      requestId,
      ACTIVITY_TRACKER_EVENTS.CREATE_ORGANIZATION_USER,
      `Created organization user ${userId} in org ${organizationId}`,
      {
        oldData,
        newData,
        adminActions: {
          targetId: newOrgUser._id.toString(),
          performedOn: DB_COLLECTIONS.ORGANIZATION_USERS,
          reason: creationReason,
          reasonDescription: reasonDescription || undefined
        }
      }
    );

    return {
      success: true,
      data: newOrgUser
    };

  } catch (error) {
    logWithTime(`❌ Create organization user service error: ${error.message}`);

    if (error.code === 11000) {
      return {
        success: false,
        type: OrganizationUserErrorTypes.DUPLICATE_ASSIGNMENT,
        message: "User is already assigned to this organization"
      };
    }

    return {
      success: false,
      type: OrganizationUserErrorTypes.INVALID_DATA,
      message: error.message
    };
  }
};

module.exports = { createOrgUserService };
