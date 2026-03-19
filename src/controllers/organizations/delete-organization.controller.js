const { deleteOrganizationService } = require("@/services/organizations/delete-organization.service");
const { logWithTime } = require("@utils/time-stamps.util");
const { 
  throwInternalServerError, 
  getLogIdentifiers 
} = require("@/responses/common/error-handler.response");
const { deleteOrganizationSuccessResponse } = require("@/responses/success/organization.response");
const { OrganizationErrorTypes } = require("@/configs/service-error.config");

/**
 * Delete Organization Controller
 */
const deleteOrganizationController = async (req, res) => {
  try {
    const admin = req.admin; // Injected by middleware
    const organizationId = req.params.organizationId;
    // Organization already fetched and attached by middleware
    const oldOrganization = req.organization;
    
    const { deletionReason, reasonDescription } = req.body;

    logWithTime(`🔄 Deleting organization ${organizationId} by ${admin.adminId} ${getLogIdentifiers(req)}`);

    // Call service
    const result = await deleteOrganizationService(
      admin,
      organizationId,
      oldOrganization,
      req.device,
      req.requestId,
      deletionReason,
      reasonDescription
    );

    // Handle service errors
    if (!result.success) {
      if (result.type === OrganizationErrorTypes.NOT_FOUND) {
        return throwInternalServerError(res, "Organization not found");
      }
      return throwInternalServerError(res, result.message);
    }

    // Success response
    logWithTime(`✅ Organization deleted successfully: ${organizationId} ${getLogIdentifiers(req)}`);
    return deleteOrganizationSuccessResponse(res);

  } catch (err) {
    logWithTime(`❌ Internal Error in deleteOrganizationController ${getLogIdentifiers(req)}: ${err.message}`);
    return throwInternalServerError(res, err);
  }
};

module.exports = {
    deleteOrganizationController
}