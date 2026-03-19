const { enableOrganizationService } = require("@/services/organizations/enable-organization.service");
const { logWithTime } = require("@utils/time-stamps.util");
const { 
  throwInternalServerError, 
  getLogIdentifiers ,
  throwConflictError
} = require("@/responses/common/error-handler.response");
const { enableOrganizationSuccessResponse } = require("@/responses/success/organization.response");
const { OrganizationErrorTypes } = require("@/configs/service-error.config");

/**
 * Enable Organization Controller
 */
const enableOrganizationController = async (req, res) => {
  try {
    const admin = req.admin; // Injected by middleware
    const organizationId = req.params.organizationId;
    // Organization already fetched and attached by middleware
    const oldOrganization = req.organization;
    
    const { enableReason, reasonDescription } = req.body;

    logWithTime(`🔄 Enabling organization ${organizationId} by ${admin.adminId} ${getLogIdentifiers(req)}`);

    // Call service
    const result = await enableOrganizationService(
      admin,
      organizationId,
      oldOrganization,
      req.device,
      req.requestId,
      enableReason,
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
    logWithTime(`✅ Organization enabled successfully: ${organizationId} ${getLogIdentifiers(req)}`);
    return enableOrganizationSuccessResponse(res, result.data);

  } catch (err) {
    logWithTime(`❌ Internal Error in enableOrganizationController ${getLogIdentifiers(req)}: ${err.message}`);
    return throwInternalServerError(res, err);
  }
};

module.exports = {
    enableOrganizationController
}
