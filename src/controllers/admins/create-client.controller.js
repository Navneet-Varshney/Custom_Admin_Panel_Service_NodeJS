const { createClientService } = require("@services/admins/create-client.service");
const { logWithTime } = require("@utils/time-stamps.util");
const { 
  throwBadRequestError, 
  throwInternalServerError, 
  getLogIdentifiers, 
  throwConflictError,
  throwSpecificInternalServerError
} = require("@/responses/common/error-handler.response");
const { createUserSuccessResponse } = require("@responses/success/index");
const { AdminErrorTypes } = require("@configs/enums.config");

const createClient = async (req, res) => {
  try {
    const creator = req.admin; // Injected by middleware
    const { firstName, creationReason, reasonDescription, email, password, countryCode, localNumber, phone, role, orgIds } = req.body;

    let organizationIds = orgIds || [];

    // Call service
    const result = await createClientService(
      creator,
      { firstName, creationReason, reasonDescription, email, password, countryCode, localNumber, phone, role, orgIds: organizationIds },
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
    return createUserSuccessResponse(res, result.data);

  } catch (err) {
    logWithTime(`❌ Internal Error in createClient controller ${getLogIdentifiers(req)}: ${err.message}`);
    return throwInternalServerError(res, err);
  }
};

module.exports = { createClient };