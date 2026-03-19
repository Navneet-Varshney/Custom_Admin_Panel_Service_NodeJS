const { OrganizationUserModel } = require("@/models/organizational-user.model");
const { logWithTime } = require("@utils/time-stamps.util");
const { logActivityTrackerEvent } = require("@/services/audit/activity-tracker.service");
const { ACTIVITY_TRACKER_EVENTS } = require("@configs/tracker.config");
const { OrganizationUserErrorTypes } = require("@/configs/service-error.config");
const { DB_COLLECTIONS } = require("@/configs/db-collections.config");
const { prepareAuditData, cloneForAudit } = require("@utils/audit-data.util");

/**
 * Update Organization User Service
 * @param {Object} updaterAdmin - The admin updating the org user
 * @param {string} orgUserId - Organization User ID
 * @param {Object} updateData - Update data {role, updateReason}
 * @param {Object} oldOrgUser - Old org user data
 * @param {Object} device - Device object
 * @param {string} requestId - Request ID for tracking
 * @returns {Promise<{success: boolean, data?: Object, type?: string, message?: string, noChanges?: boolean}>}
 */
const updateOrgUserService = async (updaterAdmin, orgUserId, updateData, oldOrgUser, device, requestId) => {
  try {
    const { role, updateReason, reasonDescription = undefined } = updateData;

    logWithTime(`🔄 Updating organization user: ${orgUserId}...`);

    // Clone old data for audit
    const oldOrgUserClone = cloneForAudit(oldOrgUser);

    // Prepare update object
    const updateObject = {};
    if (role !== undefined && (role).toLowerCase() !== oldOrgUser.role) {
      updateObject.role = role;
    }

    // Add updater info
    updateObject.updatedBy = updaterAdmin.adminId;

    // Check if there are no changes (excluding updatedBy which is always added)
    if (Object.keys(updateObject).length === 1 && updateObject.updatedBy) {
      logWithTime(`ℹ️ No changes detected for org user: ${orgUserId}`);
      return {
        success: true,
        data: oldOrgUser,
        noChanges: true
      };
    }

    // Update org user
    const updatedOrgUser = await OrganizationUserModel.findByIdAndUpdate(
      orgUserId,
      updateObject,
      { new: true, runValidators: true }
    );

    if (!updatedOrgUser) {
      return {
        success: false,
        type: OrganizationUserErrorTypes.NOT_FOUND,
        message: "Organization user not found"
      };
    }

    logWithTime(`✅ Organization user updated: ${orgUserId}`);

    // Prepare audit data
    const { oldData, newData } = prepareAuditData(oldOrgUserClone, updatedOrgUser);

    // Log activity
    logActivityTrackerEvent(
      updaterAdmin,
      device,
      requestId,
      ACTIVITY_TRACKER_EVENTS.UPDATE_ORGANIZATION_USER,
      `Updated organization user ${orgUserId}`,
      {
        oldData,
        newData,
        adminActions: {
          targetId: orgUserId,
          performedOn: DB_COLLECTIONS.ORGANIZATION_USERS,
          reason: updateReason,
          reasonDescription: reasonDescription || undefined
        }
      }
    );

    return {
      success: true,
      data: updatedOrgUser
    };

  } catch (error) {
    logWithTime(`❌ Update organization user service error: ${error.message}`);

    return {
      success: false,
      type: OrganizationUserErrorTypes.INVALID_DATA,
      message: error.message
    };
  }
};

module.exports = { updateOrgUserService };
