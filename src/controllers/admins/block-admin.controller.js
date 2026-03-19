const { blockAdminService } = require("@services/admins/block-admin.service");
const { logWithTime } = require("@utils/time-stamps.util");
const { 
  throwBadRequestError, 
  throwInternalServerError, 
  getLogIdentifiers, 
  throwConflictError,
  throwUnauthorizedError,
  throwSpecificInternalServerError
} = require("@/responses/common/error-handler.response");
const { blockAdminSuccessResponse } = require("@responses/success/index");
const { AdminErrorTypes } = require("@configs/enums.config");

const blockAdmin = async (req, res) => {
  try {
    const updater = req.admin; // Injected by middleware
    const targetAdmin = req.foundAdmin; // Injected by ensureAdminExists middleware
    const { blockReason, reasonDescription } = req.body;

    // Call service
    const result = await blockAdminService(
      updater,
      targetAdmin,
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
      if (result.type === AdminErrorTypes.CONFLICT) {
        return throwConflictError(res, result.message);
      }
      if (result.type === AdminErrorTypes.INVALID_DATA) {
        return throwBadRequestError(res, result.message);
      }
      return throwSpecificInternalServerError(res, result.message);
    }

    logWithTime(`✅ Admin blocked successfully: ${targetAdmin.adminId} by ${updater.adminId}`);
    // Success response
    return blockAdminSuccessResponse(res, result.data);

  } catch (err) {
    logWithTime(`❌ Internal Error in blockAdmin controller ${getLogIdentifiers(req)}: ${err.message}`);
    return throwInternalServerError(res, err);
  }
};

module.exports = { blockAdmin };
