const { createClientService } = require("@services/admins/create-client.service");
const { logWithTime } = require("@utils/time-stamps.util");
const { 
  throwBadRequestError, 
  throwInternalServerError, 
  getLogIdentifiers, 
  throwConflictError
} = require("@/responses/common/error-handler.response");
const { createUserSuccessResponse } = require("@responses/success/index");
const { AdminErrorTypes } = require("@configs/enums.config");

const createClient = async (req, res) => {
  try {
    const creator = req.admin; // Injected by middleware
    const { firstName, creationReason, email, password, countryCode, localNumber, phone, role } = req.body;

    // Call service
    const result = await createClientService(
      creator,
      { firstName, creationReason, email, password, countryCode, localNumber, phone, role },
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
      return throwInternalServerError(res, result.message);
    }

    // Success response
    return createUserSuccessResponse(res, result.data);

  } catch (err) {
    logWithTime(`❌ Internal Error in createClient controller ${getLogIdentifiers(req)}: ${err.message}`);
    return throwInternalServerError(res, err);
  }
};

module.exports = { createClient };