

const { updateUserDetailsService } = require("@services/internals/update-user-details.service");
const { sendUpdatedUserDetailsSuccess } = require("@responses/internals/common.response");
const {
  throwSpecificInternalServerError,
  throwInternalServerError,
  throwMissingFieldsError
} = require("@responses/common/error-handler.response");
const { logWithTime } = require("@/utils/time-stamps.util");

/**
 * Update User Details Controller
 * Updates user details for a user or admin
 * 
 * @param {Object} req - Express request object
 * @param {string} req.params.userId - The custom user/admin ID to update
 * @param {string} req.body.type - The entity type (ADMIN, USER, CLIENT)
 * @param {string} req.body.firstName - The new firstName
 * @param {Object} req.admin - Admin object from middleware { adminId, ... }
 * @param {string} req.requestId - Request ID for tracking
 * @param {Object} res - Express response object
 */
const updateUserDetails = async (req, res) => {
  try {
    const { userId } = req.params;
    const { type, firstName } = req.body;

    // Validate required fields
    const missingFields = [];
    if (!type) missingFields.push("type");
    if (!firstName) missingFields.push("firstName");

    if (missingFields.length > 0) {
      return throwMissingFieldsError(res, missingFields);
    }

    // Extract admin info from request
    const executedBy = req.admin?.adminId;
    const requestId = req.requestId;

    // Call the update service
    const result = await updateUserDetailsService(userId, type, firstName, executedBy, requestId);

    // Handle failure responses
    if (!result.success) {
      // Other errors: Internal server error
      return throwSpecificInternalServerError(res, result.message);
    }

    // Success response
    return sendUpdatedUserDetailsSuccess(res, result.data);

  } catch (error) {
    logWithTime(`❌ Error in updateUserDetails controller: ${error.message}`);
    return throwInternalServerError(res, error);
  }
};

module.exports = {
  updateUserDetails
};