const { enableOrgUserService } = require("@/services/organizational-users/enable-org-user.service");
const { logWithTime } = require("@utils/time-stamps.util");
const { 
  throwInternalServerError, 
  getLogIdentifiers,
  throwConflictError
} = require("@/responses/common/error-handler.response");
const { enableOrgUserSuccessResponse } = require("@/responses/success/organization-user.response");
const { OrganizationUserErrorTypes } = require("@/configs/service-error.config");

/**
 * Enable Organization User Controller
 */
const enableOrgUserController = async (req, res) => {
  try {
    const admin = req.admin; // Injected by middleware
    const orgUserId = req.params.orgUserId;
    // Organization user already fetched and attached by middleware
    const oldOrgUser = req.orgUser;
    
    const { enableReason, reasonDescription } = req.body;

    logWithTime(`🔄 Enabling organization user ${orgUserId} by ${admin.adminId} ${getLogIdentifiers(req)}`);

    // Call service
    const result = await enableOrgUserService(
      admin,
      orgUserId,
      oldOrgUser,
      req.device,
      req.requestId,
      enableReason,
      reasonDescription
    );

    // Handle service errors
    if (!result.success) {
      if (result.type === OrganizationUserErrorTypes.INVALID_DATA) {
        return throwConflictError(res, result.message);
      }
      if (result.type === OrganizationUserErrorTypes.NOT_FOUND) {
        return throwInternalServerError(res, "Organization user not found");
      }
      return throwInternalServerError(res, result.message);
    }

    // Success response
    logWithTime(`✅ Organization user enabled successfully: ${orgUserId} ${getLogIdentifiers(req)}`);
    return enableOrgUserSuccessResponse(res, result.data);

  } catch (err) {
    logWithTime(`❌ Internal Error in enableOrgUserController ${getLogIdentifiers(req)}: ${err.message}`);
    return throwInternalServerError(res, err);
  }
};

module.exports = {
    enableOrgUserController
}
