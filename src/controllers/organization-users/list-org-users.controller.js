const { listOrgUsersByOrganization } = require("@/services/organizational-users/list-org-users.service");
const { logWithTime } = require("@utils/time-stamps.util");
const { 
  throwInternalServerError, 
  getLogIdentifiers 
} = require("@/responses/common/error-handler.response");
const { listOrgUsersSuccessResponse } = require("@/responses/success/organization-user.response");

/**
 * List Organization Users Controller
 */
const listOrgUsersController = async (req, res) => {
  try {
    const organizationId = req.params.organizationId;
    const filters = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 10,
      createdAfter: req.query.createdAfter,
      createdBefore: req.query.createdBefore,
      updatedAfter: req.query.updatedAfter,
      updatedBefore: req.query.updatedBefore,
      role: req.query.role,
      sortBy: req.query.sortBy || 'createdAt',
      sortOrder: req.query.sortOrder === 'asc' ? 1 : -1
    };

    logWithTime(`🔄 Fetching organization users for org ${organizationId} with filters: ${JSON.stringify(filters)} ${getLogIdentifiers(req)}`);

    // Fetch org users
    const result = await listOrgUsersByOrganization(organizationId, filters);

    // Success response
    logWithTime(`✅ Organization users fetched successfully: ${result.orgUsers.length} records ${getLogIdentifiers(req)}`);
    return listOrgUsersSuccessResponse(res, result);

  } catch (err) {
    logWithTime(`❌ Internal Error in listOrgUsersController ${getLogIdentifiers(req)}: ${err.message}`);
    return throwInternalServerError(res, err);
  }
};

module.exports = {
    listOrgUsersController
}