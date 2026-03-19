const { unblockAdminService } = require("@services/admins/unblock-admin.service");
const { logWithTime } = require("@utils/time-stamps.util");
const { 
  throwBadRequestError, 
  throwInternalServerError, 
  getLogIdentifiers, 
  throwConflictError,
  throwUnauthorizedError,
  throwSpecificInternalServerError
} = require("@/responses/common/error-handler.response");
const { unblockAdminSuccessResponse } = require("@responses/success/index");
const { AdminErrorTypes } = require("@configs/enums.config");

const unblockAdmin = async (req, res) => {
  try {
    const updater = req.admin; // Injected by middleware
    const targetAdmin = req.foundAdmin; // Injected by ensureAdminExists middleware
    const { unblockReason, reasonDescription } = req.body;

    // Call service
    const result = await unblockAdminService(
      updater,
      targetAdmin,
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
      if (result.type === AdminErrorTypes.CONFLICT) {
        return throwConflictError(res, result.message);
      }
      if (result.type === AdminErrorTypes.INVALID_DATA) {
        return throwBadRequestError(res, result.message);
      }
      return throwSpecificInternalServerError(res, result.message);
    }

    logWithTime(`✅ Admin unblocked successfully: ${targetAdmin.adminId} by ${updater.adminId}`);
    // Success response
    return unblockAdminSuccessResponse(res, result.data);

  } catch (err) {
    logWithTime(`❌ Internal Error in unblockAdmin controller ${getLogIdentifiers(req)}: ${err.message}`);
    return throwInternalServerError(res, err);
  }
};

module.exports = { unblockAdmin };
