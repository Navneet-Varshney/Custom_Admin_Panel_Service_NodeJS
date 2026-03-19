const { updateOrgUserService } = require("@/services/organizational-users/update-org-user.service");
const { logWithTime } = require("@utils/time-stamps.util");
const { 
  throwBadRequestError, 
  throwInternalServerError, 
  getLogIdentifiers 
} = require("@/responses/common/error-handler.response");
const { 
  updateOrgUserSuccessResponse,
  updateOrgUserNoChangesResponse 
} = require("@/responses/success/organization-user.response");
const { OrganizationUserErrorTypes } = require("@/configs/service-error.config");

/**
 * Update Organization User Controller
 */
const updateOrgUserController = async (req, res) => {
  try {
    const admin = req.admin; // Injected by middleware
    const orgUserId = req.params.orgUserId;
    // Organization user already fetched and attached by middleware
    const oldOrgUser = req.orgUser;
    
    const { role, updationReason, reasonDescription } = req.body;

    logWithTime(`🔄 Updating organization user ${orgUserId} by ${admin.adminId} ${getLogIdentifiers(req)}`);

    // Call service
    const result = await updateOrgUserService(
      admin,
      orgUserId,
      { role, updateReason: updationReason, reasonDescription },
      oldOrgUser,
      req.device,
      req.requestId
    );

    // Handle service errors
    if (!result.success) {
      if (result.type === OrganizationUserErrorTypes.INVALID_DATA) {
        return throwBadRequestError(res, result.message);
      }
      if (result.type === OrganizationUserErrorTypes.NOT_FOUND) {
        return throwBadRequestError(res, "Organization user not found");
      }
      return throwInternalServerError(res, result.message);
    }

    // Success response
    if (result.noChanges) {
      logWithTime(`ℹ️ No changes for org user ${orgUserId} ${getLogIdentifiers(req)}`);
      return updateOrgUserNoChangesResponse(res, result.data);
    }

    logWithTime(`✅ Organization user updated successfully: ${orgUserId} ${getLogIdentifiers(req)}`);
    return updateOrgUserSuccessResponse(res, result.data);

  } catch (err) {
    logWithTime(`❌ Internal Error in updateOrgUserController ${getLogIdentifiers(req)}: ${err.message}`);
    return throwInternalServerError(res, err);
  }
};

module.exports = {
    updateOrgUserController
}