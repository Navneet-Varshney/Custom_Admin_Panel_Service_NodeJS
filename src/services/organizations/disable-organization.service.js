const { ACTIVITY_TRACKER_EVENTS } = require("@configs/tracker.config");
const { logWithTime } = require("@utils/time-stamps.util");
const { logActivityTrackerEvent } = require("@/services/audit/activity-tracker.service");
const { OrganizationModel } = require("@/models/organization.model");
const { OrganizationErrorTypes } = require("@/configs/service-error.config");
const { DB_COLLECTIONS } = require("@/configs/db-collections.config");
const { prepareAuditData, cloneForAudit } = require("@utils/audit-data.util");

/**
 * Disable Organization Service (Set isActive: false)
 * @param {Object} updaterAdmin - The admin disabling the organization
 * @param {string} organizationId - Organization ID
 * @param {Object} oldOrganization - Old organization data
 * @param {Object} device - Device object
 * @param {string} requestId - Request ID for tracking
 * @param {string} disablitionReason - Reason for disabling
 * @param {string} reasonDescription - Optional description of the reason
 * @returns {Promise<{success: boolean, type?: string, message?: string}>}
 */
const disableOrganizationService = async (updaterAdmin, organizationId, oldOrganization, device, requestId, disablitionReason, reasonDescription = undefined) => {
  try {
    logWithTime(`🔄 Disabling organization: ${organizationId}...`);

    // Clone old data for audit
    const oldOrgClone = cloneForAudit(oldOrganization);

    // Check if already disabled
    if (!oldOrganization.isActive) {
      logWithTime(`ℹ️ Organization already disabled: ${organizationId}`);
      return {
        success: false,
        type: OrganizationErrorTypes.INVALID_DATA,
        message: "Organization is already disabled"
      };
    }

    // Disable organization
    const disabledOrganization = await OrganizationModel.findByIdAndUpdate(
      organizationId,
      {
        isActive: false,
        updatedBy: updaterAdmin.adminId
      },
      { returnDocument: 'after' }
    );

    if (!disabledOrganization) {
      return {
        success: false,
        type: OrganizationErrorTypes.NOT_FOUND,
        message: "Organization not found"
      };
    }

    logWithTime(`✅ Organization disabled: ${organizationId}`);

    // Prepare audit data (old vs disabled state)
    const { oldData, newData } = prepareAuditData(oldOrgClone, disabledOrganization);

    // Log activity
    logActivityTrackerEvent(
      updaterAdmin,
      device,
      requestId,
      ACTIVITY_TRACKER_EVENTS.DISABLE_ORGANIZATION,
      `Disabled organization ${organizationId}`,
      {
        oldData,
        newData,
        adminActions: {
          targetId: organizationId,
          performedOn: DB_COLLECTIONS.ORGANIZATIONS,
          reason: disablitionReason,
          reasonDescription: reasonDescription || undefined
        }
      }
    );

    return {
      success: true,
      data: disabledOrganization
    };

  } catch (error) {
    logWithTime(`❌ Disable organization service error: ${error.message}`);

    return {
      success: false,
      type: OrganizationErrorTypes.INVALID_DATA,
      message: error.message
    };
  }
};

module.exports = { disableOrganizationService };
