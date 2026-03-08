const { createUserService } = require("@services/internals/create-user.service");
const { logWithTime } = require("@utils/time-stamps.util");
const { 
  throwBadRequestError, 
  throwInternalServerError, 
  getLogIdentifiers, 
  throwConflictError
} = require("@/responses/common/error-handler.response");
const { createUserSuccessResponse } = require("@responses/success/index");
const { AdminErrorTypes } = require("@configs/enums.config");

const createUser = async (req, res) => {
  try {
    const { firstName, userId } = req.body;

    // Call service
    const result = await createUserService(
      { firstName, userId },
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
    logWithTime(`❌ Internal Error in createUser controller ${getLogIdentifiers(req)}: ${err.message}`);
    return throwInternalServerError(res, err);
  }
};

module.exports = { createUser };