const { OrganizationModel } = require("@/models/organization.model");
const { logWithTime } = require("@utils/time-stamps.util");
const { logActivityTrackerEvent } = require("@/services/audit/activity-tracker.service");
const { ACTIVITY_TRACKER_EVENTS } = require("@configs/tracker.config");
const { OrganizationErrorTypes } = require("@/configs/service-error.config");
const { DB_COLLECTIONS } = require("@/configs/db-collections.config");
const { prepareAuditData, cloneForAudit } = require("@utils/audit-data.util");

/**
 * Create Organization Service
 * @param {Object} creatorAdmin - The admin creating the organization
 * @param {Object} organizationData - Organization data {organizationName, orgType, website, logoUrl, contactEmail, contactCountryCode, contactLocalNumber, address, description, creationReason}
 * @param {Object} device - Device object {deviceUUID, deviceType, deviceName}
 * @param {string} requestId - Request ID for tracking
 * @returns {Promise<{success: boolean, data?: Object, type?: string, message?: string}>}
 */
const createOrganizationService = async (creatorAdmin, organizationData, device, requestId) => {
  try {
    const { organizationName, orgType, website, logoUrl, contactEmail, contactCountryCode, contactLocalNumber, address, description, creationReason, reasonDescription = undefined } = organizationData;

    logWithTime(`🔄 Creating organization: ${organizationName}...`);

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

    // Create new organization
    const newOrganization = new OrganizationModel({
      organizationName,
      orgType,
      website,
      logoUrl,
      contactEmail,
      contactCountryCode,
      contactLocalNumber,
      address,
      description,
      createdBy: creatorAdmin.adminId,
      isActive: true
    });

    await newOrganization.save();

    logWithTime(`✅ Organization created: ${newOrganization._id}`);

    // Prepare audit data (creation: oldData is null)
    const { oldData, newData } = prepareAuditData(null, newOrganization);

    // Log activity
    logActivityTrackerEvent(
      creatorAdmin,
      device,
      requestId,
      ACTIVITY_TRACKER_EVENTS.CREATE_ORGANIZATION,
      `Created organization ${newOrganization._id} (${organizationName})`,
      {
        oldData,
        newData,
        adminActions: {
          targetId: newOrganization._id.toString(),
          performedOn: DB_COLLECTIONS.ORGANIZATIONS,
          reason: creationReason,
          reasonDescription: reasonDescription || undefined
        }
      }
    );

    return {
      success: true,
      data: newOrganization
    };

  } catch (error) {
    logWithTime(`❌ Create organization service error: ${error.message}`);

    if (error.code === 11000) {
      return {
        success: false,
        type: OrganizationErrorTypes.ALREADY_EXISTS,
        message: "Organization with this name already exists"
      };
    }

    return {
      success: false,
      type: OrganizationErrorTypes.INVALID_DATA,
      message: error.message
    };
  }
};

module.exports = { createOrganizationService };