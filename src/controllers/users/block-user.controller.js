const { blockUserService } = require("@services/users/block-user.service");
const { logWithTime } = require("@utils/time-stamps.util");
const { 
  throwBadRequestError, 
  throwInternalServerError, 
  getLogIdentifiers, 
  throwConflictError,
  throwUnauthorizedError,
  throwSpecificInternalServerError
} = require("@/responses/common/error-handler.response");
const { blockUserSuccessResponse } = require("@responses/success/index");
const { AdminErrorTypes } = require("@configs/enums.config");

const blockUser = async (req, res) => {
  try {
    const updater = req.admin; // Injected by middleware
    const targetUser = req.foundUser; // Injected by ensureUserExists middleware
    const { blockReason, reasonDescription } = req.body;

    // Call service
    const result = await blockUserService(
      updater,
      targetUser,
      blockReason,
      reasonDescription,
      req.device,
      req.requestId
    );

    // Handle service errors
    if (!result.success) {
      if (result.type === AdminErrorTypes.UNAUTHORIZED) {
        return throwUnauthorizedError(res, result.message);
      }
      if (result.type === AdminErrorTypes.ALREADY_BLOCKED) {
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

    logWithTime(`✅ User blocked successfully: ${targetUser.userId} by ${updater.adminId}`);
    // Success response
    return blockUserSuccessResponse(res, result.data);

  } catch (err) {
    logWithTime(`❌ Internal Error in blockUser controller ${getLogIdentifiers(req)}: ${err.message}`);
    return throwInternalServerError(res, err);
  }
};

module.exports = { blockUser };
