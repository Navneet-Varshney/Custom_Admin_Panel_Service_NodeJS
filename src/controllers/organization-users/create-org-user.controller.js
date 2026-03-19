const { createOrgUserService } = require("@/services/organizational-users/create-org-user.service");
const { logWithTime } = require("@utils/time-stamps.util");
const { 
  throwBadRequestError, 
  throwInternalServerError, 
  getLogIdentifiers 
} = require("@/responses/common/error-handler.response");
const { createOrgUserSuccessResponse } = require("@/responses/success/organization-user.response");
const { OrganizationUserErrorTypes } = require("@/configs/service-error.config");

/**
 * Create Organization User Controller
 */
const createOrgUserController = async (req, res) => {
  try {
    const admin = req.admin; // Injected by middleware
    const { organizationId, role, creationReason, reasonDescription } = req.body;

    const user = req.foundUser;

    logWithTime(`🔄 Creating organization user by ${admin.adminId} ${getLogIdentifiers(req)}`);

    // Call service
    const result = await createOrgUserService(
      admin,
      { user, organizationId, role, creationReason, reasonDescription },
      req.device,
      req.requestId
    );

    // Handle service errors
    if (!result.success) {
      if (result.type === OrganizationUserErrorTypes.DUPLICATE_ASSIGNMENT) {
        return throwBadRequestError(res, result.message);
      }
      if (result.type === OrganizationUserErrorTypes.INVALID_DATA) {
        return throwBadRequestError(res, result.message);
      }
      return throwInternalServerError(res, result.message);
    }

    // Success response
    logWithTime(`✅ Organization user created successfully: ${result.data._id} ${getLogIdentifiers(req)}`);
    return createOrgUserSuccessResponse(res, result.data);

  } catch (err) {
    logWithTime(`❌ Internal Error in createOrgUserController ${getLogIdentifiers(req)}: ${err.message}`);
    return throwInternalServerError(res, err);
  }
};

module.exports = {
    createOrgUserController
}