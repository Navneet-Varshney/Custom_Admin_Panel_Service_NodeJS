const { disableOrgUserService } = require("@/services/organizational-users/disable-org-user.service");
const { logWithTime } = require("@utils/time-stamps.util");
const { 
  throwInternalServerError, 
  getLogIdentifiers ,
  throwConflictError
} = require("@/responses/common/error-handler.response");
const { disableOrgUserSuccessResponse } = require("@/responses/success/organization-user.response");
const { OrganizationUserErrorTypes } = require("@/configs/service-error.config");

/**
 * Disable Organization User Controller
 */
const disableOrgUserController = async (req, res) => {
  try {
    const admin = req.admin; // Injected by middleware
    const orgUserId = req.params.orgUserId;
    // Organization user already fetched and attached by middleware
    const oldOrgUser = req.orgUser;
    
    const { disablitionReason, reasonDescription } = req.body;

    logWithTime(`🔄 Disabling organization user ${orgUserId} by ${admin.adminId} ${getLogIdentifiers(req)}`);

    // Call service
    const result = await disableOrgUserService(
      admin,
      orgUserId,
      oldOrgUser,
      req.device,
      req.requestId,
      disablitionReason,
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
    logWithTime(`✅ Organization user disabled successfully: ${orgUserId} ${getLogIdentifiers(req)}`);
    return disableOrgUserSuccessResponse(res, result.data);

  } catch (err) {
    logWithTime(`❌ Internal Error in disableOrgUserController ${getLogIdentifiers(req)}: ${err.message}`);
    return throwInternalServerError(res, err);
  }
};

module.exports = {
    disableOrgUserController
}
