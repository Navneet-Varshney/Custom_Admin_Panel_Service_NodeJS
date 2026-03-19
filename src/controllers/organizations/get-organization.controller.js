const { logWithTime } = require("@utils/time-stamps.util");
const { 
  throwInternalServerError,
  getLogIdentifiers 
} = require("@/responses/common/error-handler.response");
const { getOrganizationSuccessResponse } = require("@/responses/success/organization.response");

/**
 * Get Organization Controller
 */
const getOrganizationController = async (req, res) => {
  try {
    const organizationId = req.params.organizationId;

    logWithTime(`🔄 Fetching organization ${organizationId} ${getLogIdentifiers(req)}`);

    // Organization already fetched by middleware and attached to req
    const organization = req.organization;

    // Success response
    logWithTime(`✅ Organization fetched successfully: ${organizationId} ${getLogIdentifiers(req)}`);
    return getOrganizationSuccessResponse(res, organization);

  } catch (err) {
    logWithTime(`❌ Internal Error in getOrganizationController ${getLogIdentifiers(req)}: ${err.message}`);
    return throwInternalServerError(res, err);
  }
};

module.exports = {
    getOrganizationController
}