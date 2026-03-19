const { blockDeviceService } = require("@services/devices/block-device.service");
const { logWithTime } = require("@utils/time-stamps.util");
const { 
  throwBadRequestError, 
  throwInternalServerError, 
  getLogIdentifiers, 
  throwConflictError,
  throwUnauthorizedError,
  throwSpecificInternalServerError
} = require("@/responses/common/error-handler.response");
const { blockDeviceSuccessResponse } = require("@responses/success/index");
const { AdminErrorTypes } = require("@configs/enums.config");

const blockDevice = async (req, res) => {
  try {
    const updater = req.admin; // Injected by middleware
    const { deviceUUID, blockReason, reasonDescription } = req.body;

    // Call service
    const result = await blockDeviceService(
      updater,
      deviceUUID,
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

    logWithTime(`✅ Device blocked successfully: ${deviceUUID} by ${updater.adminId}`);
    // Success response
    return blockDeviceSuccessResponse(res, result.data);

  } catch (err) {
    logWithTime(`❌ Internal Error in blockDevice controller ${getLogIdentifiers(req)}: ${err.message}`);
    return throwInternalServerError(res, err);
  }
};

module.exports = { blockDevice };
