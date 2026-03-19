const { disableOrganizationService } = require("@/services/organizations/disable-organization.service");
const { logWithTime } = require("@utils/time-stamps.util");
const { 
  throwInternalServerError, 
  getLogIdentifiers,
  throwConflictError
} = require("@/responses/common/error-handler.response");
const { disableOrganizationSuccessResponse } = require("@/responses/success/organization.response");
const { OrganizationErrorTypes } = require("@/configs/service-error.config");

/**
 * Disable Organization Controller
 */
const disableOrganizationController = async (req, res) => {
  try {
    const admin = req.admin; // Injected by middleware
    const organizationId = req.params.organizationId;
    // Organization already fetched and attached by middleware
    const oldOrganization = req.organization;
    
    const { disablitionReason, reasonDescription } = req.body;

    logWithTime(`🔄 Disabling organization ${organizationId} by ${admin.adminId} ${getLogIdentifiers(req)}`);

    // Call service
    const result = await disableOrganizationService(
      admin,
      organizationId,
      oldOrganization,
      req.device,
      req.requestId,
      disablitionReason,
      reasonDescription
    );

    // Handle service errors
    if (!result.success) {
      if (result.type === OrganizationErrorTypes.INVALID_DATA) {
        return throwConflictError(res, result.message);
      }
      if (result.type === OrganizationErrorTypes.NOT_FOUND) {
        return throwInternalServerError(res, "Organization not found");
      }
      return throwInternalServerError(res, result.message);
    }

    // Success response
    logWithTime(`✅ Organization disabled successfully: ${organizationId} ${getLogIdentifiers(req)}`);
    return disableOrganizationSuccessResponse(res, result.data);

  } catch (err) {
    logWithTime(`❌ Internal Error in disableOrganizationController ${getLogIdentifiers(req)}: ${err.message}`);
    return throwInternalServerError(res, err);
  }
};

module.exports = {
    disableOrganizationController
}
