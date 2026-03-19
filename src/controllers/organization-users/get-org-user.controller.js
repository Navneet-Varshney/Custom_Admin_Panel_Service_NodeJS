const { logWithTime } = require("@utils/time-stamps.util");
const { 
  throwInternalServerError,
  getLogIdentifiers 
} = require("@/responses/common/error-handler.response");
const { getOrgUserSuccessResponse } = require("@/responses/success/organization-user.response");

/**
 * Get Organization User Controller
 */
const getOrgUserController = async (req, res) => {
  try {
    const orgUserId = req.params.orgUserId;

    logWithTime(`🔄 Fetching organization user ${orgUserId} ${getLogIdentifiers(req)}`);

    // Organization user already fetched by middleware and attached to req
    const orgUser = req.orgUser;

    // Success response
    logWithTime(`✅ Organization user fetched successfully: ${orgUserId} ${getLogIdentifiers(req)}`);
    return getOrgUserSuccessResponse(res, orgUser);

  } catch (err) {
    logWithTime(`❌ Internal Error in getOrgUserController ${getLogIdentifiers(req)}: ${err.message}`);
    return throwInternalServerError(res, err);
  }
};

module.exports = {
    getOrgUserController
}