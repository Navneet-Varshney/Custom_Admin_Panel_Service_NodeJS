const { ACTIVITY_TRACKER_EVENTS } = require("@configs/tracker.config");
const { logWithTime } = require("@utils/time-stamps.util");
const { logActivityTrackerEvent } = require("@/services/audit/activity-tracker.service");
const { OrganizationModel } = require("@/models/organization.model");
const { OrganizationErrorTypes } = require("@/configs/service-error.config");
const { DB_COLLECTIONS } = require("@/configs/db-collections.config");
const { prepareAuditData, cloneForAudit } = require("@utils/audit-data.util");

/**
 * Enable Organization Service (Set isActive: true)
 * @param {Object} updaterAdmin - The admin enabling the organization
 * @param {string} organizationId - Organization ID
 * @param {Object} oldOrganization - Old organization data
 * @param {Object} device - Device object
 * @param {string} requestId - Request ID for tracking
 * @param {string} enableReason - Reason for enabling
 * @param {string} reasonDescription - Optional description of the reason
 * @returns {Promise<{success: boolean, type?: string, message?: string}>}
 */
const enableOrganizationService = async (updaterAdmin, organizationId, oldOrganization, device, requestId, enableReason, reasonDescription = undefined) => {
  try {
    logWithTime(`🔄 Enabling organization: ${organizationId}...`);

    // Clone old data for audit
    const oldOrgClone = cloneForAudit(oldOrganization);

    // Check if already enabled
    if (oldOrganization.isActive) {
      logWithTime(`ℹ️ Organization already enabled: ${organizationId}`);
      return {
        success: false,
        type: OrganizationErrorTypes.INVALID_DATA,
        message: "Organization is already enabled"
      };
    }

    // Enable organization
    const enabledOrganization = await OrganizationModel.findByIdAndUpdate(
      organizationId,
      {
        isActive: true,
        updatedBy: updaterAdmin.adminId
      },
      { returnDocument: 'after' }
    );

    if (!enabledOrganization) {
      return {
        success: false,
        type: OrganizationErrorTypes.NOT_FOUND,
        message: "Organization not found"
      };
    }

    logWithTime(`✅ Organization enabled: ${organizationId}`);

    // Prepare audit data (old vs enabled state)
    const { oldData, newData } = prepareAuditData(oldOrgClone, enabledOrganization);

    // Log activity
    logActivityTrackerEvent(
      updaterAdmin,
      device,
      requestId,
      ACTIVITY_TRACKER_EVENTS.ENABLE_ORGANIZATION,
      `Enabled organization ${organizationId}`,
      {
        oldData,
        newData,
        adminActions: {
          targetId: organizationId,
          performedOn: DB_COLLECTIONS.ORGANIZATIONS,
          reason: enableReason,
          reasonDescription: reasonDescription || undefined
        }
      }
    );

    return {
      success: true,
      data: enabledOrganization
    };

  } catch (error) {
    logWithTime(`❌ Enable organization service error: ${error.message}`);

    return {
      success: false,
      type: OrganizationErrorTypes.INVALID_DATA,
      message: error.message
    };
  }
};

module.exports = { enableOrganizationService };
