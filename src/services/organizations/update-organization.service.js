const { OrganizationModel } = require("@/models/organization.model");
const { ACTIVITY_TRACKER_EVENTS } = require("@configs/tracker.config");
const { logWithTime } = require("@utils/time-stamps.util");
const { logActivityTrackerEvent } = require("@/services/audit/activity-tracker.service");
const { OrganizationErrorTypes } = require("@/configs/service-error.config");
const { DB_COLLECTIONS } = require("@/configs/db-collections.config");
const { prepareAuditData, cloneForAudit } = require("@utils/audit-data.util");

/**
 * Update Organization Service
 * @param {Object} updaterAdmin - The admin updating the organization
 * @param {string} organizationId - Organization ID
 * @param {Object} updateData - Update data {organizationName, orgType, website, logoUrl, contactEmail, contactCountryCode, contactLocalNumber, address, description, updateReason}
 * @param {Object} oldOrganization - Old organization data
 * @param {Object} device - Device object
 * @param {string} requestId - Request ID for tracking
 * @returns {Promise<{success: boolean, data?: Object, type?: string, message?: string, noChanges?: boolean}>}
 */
const updateOrganizationService = async (updaterAdmin, organizationId, updateData, oldOrganization, device, requestId) => {
  try {
    const { organizationName, orgType, website, logoUrl, contactEmail, contactCountryCode, contactLocalNumber, address, description, updateReason, reasonDescription = undefined } = updateData;

    logWithTime(`🔄 Updating organization: ${organizationId}...`);

    // Validate contactCountryCode and contactLocalNumber are both provided or both undefined
    const hasCountryCode = contactCountryCode !== undefined;
    const hasLocalNumber = contactLocalNumber !== undefined;
    if (hasCountryCode !== hasLocalNumber) {
      return {
        success: false,
        type: OrganizationErrorTypes.INVALID_DATA,
        message: "Both contactCountryCode and contactLocalNumber must be provided together"
      };
    }

    // Clone old data for audit
    const oldOrgClone = cloneForAudit(oldOrganization);

    // Prepare update object
    const updateObject = {};
    if (organizationName !== undefined && organizationName !== oldOrganization.organizationName) {
      updateObject.organizationName = organizationName;
    }
    if (orgType !== undefined && orgType !== oldOrganization.orgType) {
      updateObject.orgType = orgType;
    }
    if (website !== undefined && website !== oldOrganization.website) {
      updateObject.website = website;
    }
    if (logoUrl !== undefined && logoUrl !== oldOrganization.logoUrl) {
      updateObject.logoUrl = logoUrl;
    }
    if (contactEmail !== undefined && contactEmail !== oldOrganization.contactEmail) {
      updateObject.contactEmail = contactEmail;
    }
    if (contactCountryCode !== undefined && contactCountryCode !== oldOrganization.contactCountryCode) {
      updateObject.contactCountryCode = contactCountryCode;
    }
    if (contactLocalNumber !== undefined && contactLocalNumber !== oldOrganization.contactLocalNumber) {
      updateObject.contactLocalNumber = contactLocalNumber;
    }
    if (description !== undefined && description !== oldOrganization.description) {
      updateObject.description = description;
    }
    if (address !== undefined && JSON.stringify(address) !== JSON.stringify(oldOrganization.address)) {
      updateObject.address = address;
    }

    // Add updater info
    updateObject.updatedBy = updaterAdmin.adminId;

    // Check if there are no changes (excluding updatedBy which is always added)
    if (Object.keys(updateObject).length === 1 && updateObject.updatedBy) {
      logWithTime(`ℹ️ No changes detected for organization: ${organizationId}`);
      return {
        success: true,
        data: oldOrganization,
        noChanges: true
      };
    }

    // Update organization
    const updatedOrganization = await OrganizationModel.findByIdAndUpdate(
      organizationId,
      updateObject,
      { new: true, runValidators: true }
    );

    if (!updatedOrganization) {
      return {
        success: false,
        type: OrganizationErrorTypes.NOT_FOUND,
        message: "Organization not found"
      };
    }

    logWithTime(`✅ Organization updated: ${organizationId}`);

    // Prepare audit data
    const { oldData, newData } = prepareAuditData(oldOrgClone, updatedOrganization);

    // Log activity
    logActivityTrackerEvent(
      updaterAdmin,
      device,
      requestId,
      ACTIVITY_TRACKER_EVENTS.UPDATE_ORGANIZATION,
      `Updated organization ${organizationId}`,
      {
        oldData,
        newData,
        adminActions: {
          targetId: organizationId,
          performedOn: DB_COLLECTIONS.ORGANIZATIONS,
          reason: updateReason,
          reasonDescription: reasonDescription || undefined
        }
      }
    );

    return {
      success: true,
      data: updatedOrganization
    };

  } catch (error) {
    logWithTime(`❌ Update organization service error: ${error.message}`);

    if (error.code === 11000) {
      return {
        success: false,
        type: OrganizationErrorTypes.CONFLICT,
        message: "Organization name already exists"
      };
    }

    return {
      success: false,
      type: OrganizationErrorTypes.INVALID_DATA,
      message: error.message
    };
  }
};

module.exports = { updateOrganizationService };