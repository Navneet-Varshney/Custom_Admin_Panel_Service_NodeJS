const { deleteOrgUserService } = require("@/services/organizational-users/delete-org-user.service");
const { logWithTime } = require("@utils/time-stamps.util");
const { 
  throwInternalServerError, 
  getLogIdentifiers 
} = require("@/responses/common/error-handler.response");
const { deleteOrgUserSuccessResponse } = require("@/responses/success/organization-user.response");
const { OrganizationUserErrorTypes } = require("@/configs/service-error.config");

/**
 * Delete Organization User Controller
 */
const deleteOrgUserController = async (req, res) => {
  try {
    const admin = req.admin; // Injected by middleware
    const orgUserId = req.params.orgUserId;
    // Organization user already fetched and attached by middleware
    const oldOrgUser = req.orgUser;
    
    const { deletionReason, reasonDescription } = req.body;

    logWithTime(`🔄 Deleting organization user ${orgUserId} by ${admin.adminId} ${getLogIdentifiers(req)}`);

    // Call service
    const result = await deleteOrgUserService(
      admin,
      orgUserId,
      oldOrgUser,
      req.device,
      req.requestId,
      deletionReason,
      reasonDescription
    );

    // Handle service errors
    if (!result.success) {
      if (result.type === OrganizationUserErrorTypes.NOT_FOUND) {
        return throwInternalServerError(res, "Organization user not found");
      }
      return throwInternalServerError(res, result.message);
    }

    // Success response
    logWithTime(`✅ Organization user deleted successfully: ${orgUserId} ${getLogIdentifiers(req)}`);
    return deleteOrgUserSuccessResponse(res);

  } catch (err) {
    logWithTime(`❌ Internal Error in deleteOrgUserController ${getLogIdentifiers(req)}: ${err.message}`);
    return throwInternalServerError(res, err);
  }
};

module.exports = {
    deleteOrgUserController
}