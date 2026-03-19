const { ACTIVITY_TRACKER_EVENTS } = require("@configs/tracker.config");
const { logWithTime } = require("@utils/time-stamps.util");
const { logActivityTrackerEvent } = require("@/services/audit/activity-tracker.service");
const { OrganizationModel } = require("@/models/organization.model");
const { OrganizationErrorTypes } = require("@/configs/service-error.config");
const { DB_COLLECTIONS } = require("@/configs/db-collections.config");
const { prepareAuditData, cloneForAudit } = require("@utils/audit-data.util");

/**
 * Delete Organization Service (Soft Delete)
 * @param {Object} deleterAdmin - The admin deleting the organization
 * @param {string} organizationId - Organization ID
 * @param {Object} oldOrganization - Old organization data
 * @param {Object} device - Device object
 * @param {string} requestId - Request ID for tracking
 * @param {string} deletionReason - Reason for deletion
 * @param {string} reasonDescription - Optional description of the reason
 * @returns {Promise<{success: boolean, type?: string, message?: string}>}
 */
const deleteOrganizationService = async (deleterAdmin, organizationId, oldOrganization, device, requestId, deletionReason, reasonDescription = undefined) => {
  try {
    logWithTime(`🔄 Deleting organization: ${organizationId}...`);

    // Clone old data for audit
    const oldOrgClone = cloneForAudit(oldOrganization);

    // Soft delete
    const deletedOrganization = await OrganizationModel.findByIdAndUpdate(
      organizationId,
      {
        deletedAt: new Date(),
        deletedBy: deleterAdmin.adminId,
        isActive: false
      },
      { returnDocument: 'after' }
    );

    if (!deletedOrganization) {
      return {
        success: false,
        type: OrganizationErrorTypes.NOT_FOUND,
        message: "Organization not found"
      };
    }

    logWithTime(`✅ Organization deleted: ${organizationId}`);

    // Prepare audit data (old vs deleted state)
    const { oldData, newData } = prepareAuditData(oldOrgClone, deletedOrganization);

    // Log activity
    logActivityTrackerEvent(
      deleterAdmin,
      device,
      requestId,
      ACTIVITY_TRACKER_EVENTS.DELETE_ORGANIZATION,
      `Deleted organization ${organizationId}`,
      {
        oldData,
        newData,
        adminActions: {
          targetId: organizationId,
          performedOn: DB_COLLECTIONS.ORGANIZATIONS,
          reason: deletionReason,
          reasonDescription: reasonDescription || undefined
        }
      }
    );

    return {
      success: true
    };

  } catch (error) {
    logWithTime(`❌ Delete organization service error: ${error.message}`);

    return {
      success: false,
      type: OrganizationErrorTypes.INVALID_DATA,
      message: error.message
    };
  }
};

module.exports = { deleteOrganizationService };