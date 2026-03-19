const { unblockUserService } = require("@services/users/unblock-user.service");
const { logWithTime } = require("@utils/time-stamps.util");
const { 
  throwBadRequestError, 
  throwInternalServerError, 
  getLogIdentifiers, 
  throwConflictError,
  throwUnauthorizedError,
  throwSpecificInternalServerError
} = require("@/responses/common/error-handler.response");
const { unblockUserSuccessResponse } = require("@responses/success/index");
const { AdminErrorTypes } = require("@configs/enums.config");

const unblockUser = async (req, res) => {
  try {
    const updater = req.admin; // Injected by middleware
    const targetUser = req.foundUser; // Injected by ensureUserExists middleware
    const { unblockReason, reasonDescription } = req.body;

    // Call service
    const result = await unblockUserService(
      updater,
      targetUser,
      unblockReason,
      reasonDescription,
      req.device,
      req.requestId
    );

    // Handle service errors
    if (!result.success) {
      if (result.type === AdminErrorTypes.UNAUTHORIZED) {
        return throwUnauthorizedError(res, result.message);
      }
      if (result.type === AdminErrorTypes.ALREADY_UNBLOCKED) {
        return throwConflictError(res, result.message);
      }
      if (result.type === AdminErrorTypes.CONFLICT) {
        return throwConflictError(res, result.message);
      }
      if (result.type === AdminErrorTypes.INVALID_DATA) {
        return throwBadRequestError(res, result.message);
      }
      return throwSpecificInternalServerError(res, result.message);
    }

    logWithTime(`✅ User unblocked successfully: ${targetUser.userId} by ${updater.adminId}`);
    // Success response
    return unblockUserSuccessResponse(res, result.data);

  } catch (err) {
    logWithTime(`❌ Internal Error in unblockUser controller ${getLogIdentifiers(req)}: ${err.message}`);
    return throwInternalServerError(res, err);
  }
};

module.exports = { unblockUser };
