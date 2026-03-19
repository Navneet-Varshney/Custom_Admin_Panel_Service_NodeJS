const { convertUserToClientService } = require("@services/admins/convert-user-to-client.service");
const { logWithTime } = require("@utils/time-stamps.util");
const { 
  throwBadRequestError, 
  throwInternalServerError, 
  getLogIdentifiers, 
  throwConflictError,
  throwSpecificInternalServerError
} = require("@/responses/common/error-handler.response");
const { convertUserToClientSuccessResponse } = require("@responses/success/index");
const { AdminErrorTypes } = require("@configs/enums.config");

const convertUserToClient = async (req, res) => {
  try {
    const creator = req.admin; // Injected by middleware
    const { convertReason, reasonDescription, role, organizationIds } = req.body;

    const user = req.foundUser; // Injected by checkUserMiddleware

    // Call service
    const result = await convertUserToClientService(
      creator,
      { user, convertReason, reasonDescription, role, organizationIds },
      req.device,
      req.requestId
    );

    // Handle service errors
    if (!result.success) {
      if (result.type === AdminErrorTypes.CONFLICT) {
        return throwConflictError(res, result.message);
      }
      if (result.type === AdminErrorTypes.INVALID_DATA) {
        return throwBadRequestError(res, result.message);
      }
      return throwSpecificInternalServerError(res, result.message);
    }

    // Success response
    return convertUserToClientSuccessResponse(res, result.data);

  } catch (err) {
    logWithTime(`❌ Internal Error in convertUserToClient controller ${getLogIdentifiers(req)}: ${err.message}`);
    return throwInternalServerError(res, err);
  }
};

module.exports = { convertUserToClient };