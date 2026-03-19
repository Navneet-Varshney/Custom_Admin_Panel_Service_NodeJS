const { updateOrganizationService } = require("@/services/organizations/update-organization.service");
const { logWithTime } = require("@utils/time-stamps.util");
const { 
  throwBadRequestError, 
  throwInternalServerError, 
  getLogIdentifiers 
} = require("@/responses/common/error-handler.response");
const { 
  updateOrganizationSuccessResponse,
  updateOrganizationNoChangesResponse 
} = require("@/responses/success/organization.response");
const { OrganizationErrorTypes } = require("@/configs/service-error.config");

/**
 * Update Organization Controller
 */
const updateOrganizationController = async (req, res) => {
  try {
    const admin = req.admin; // Injected by middleware
    const organizationId = req.params.organizationId;
    // Organization already fetched and attached by middleware
    const oldOrganization = req.organization;
    
    // Extract all fields - both required and optional
    const { 
      organizationName, 
      orgType, 
      website, 
      logoUrl, 
      contactEmail, 
      contactCountryCode, 
      contactLocalNumber, 
      address, 
      description,
      updationReason,
      reasonDescription
    } = req.body;

    logWithTime(`🔄 Updating organization ${organizationId} by ${admin.adminId} ${getLogIdentifiers(req)}`);

    // Validate contactCountryCode and contactLocalNumber are both provided or both undefined
    const hasCountryCode = contactCountryCode !== undefined;
    const hasLocalNumber = contactLocalNumber !== undefined;
    if (hasCountryCode !== hasLocalNumber) {
      return throwBadRequestError(
        res, 
        "Both contactCountryCode and contactLocalNumber must be provided together"
      );
    }

    // Call service
    const result = await updateOrganizationService(
      admin,
      organizationId,
      { 
        organizationName, 
        orgType, 
        website, 
        logoUrl, 
        contactEmail, 
        contactCountryCode, 
        contactLocalNumber, 
        address, 
        description,
        updateReason: updationReason,
        reasonDescription
      },
      oldOrganization,
      req.device,
      req.requestId
    );

    // Handle service errors
    if (!result.success) {
      if (result.type === OrganizationErrorTypes.CONFLICT) {
        return throwBadRequestError(res, result.message);
      }
      if (result.type === OrganizationErrorTypes.INVALID_DATA) {
        return throwBadRequestError(res, result.message);
      }
      if (result.type === OrganizationErrorTypes.NOT_FOUND) {
        return throwBadRequestError(res, "Organization not found");
      }
      return throwInternalServerError(res, result.message);
    }

    // Success response
    if (result.noChanges) {
      logWithTime(`ℹ️ No changes for organization ${organizationId} ${getLogIdentifiers(req)}`);
      return updateOrganizationNoChangesResponse(res, result.data);
    }

    logWithTime(`✅ Organization updated successfully: ${organizationId} ${getLogIdentifiers(req)}`);
    return updateOrganizationSuccessResponse(res, result.data);

  } catch (err) {
    logWithTime(`❌ Internal Error in updateOrganizationController ${getLogIdentifiers(req)}: ${err.message}`);
    return throwInternalServerError(res, err);
  }
};

module.exports = {
    updateOrganizationController
}