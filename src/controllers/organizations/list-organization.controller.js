const { listOrganizations } = require("@/services/organizations/list-organization.service");
const { logWithTime } = require("@utils/time-stamps.util");
const { 
  throwInternalServerError, 
  getLogIdentifiers 
} = require("@/responses/common/error-handler.response");
const { listOrganizationsSuccessResponse } = require("@/responses/success/organization.response");

/**
 * List Organizations Controller
 */
const listOrganizationController = async (req, res) => {
  try {
    const filters = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 10,
      createdAfter: req.query.createdAfter,
      createdBefore: req.query.createdBefore,
      updatedAfter: req.query.updatedAfter,
      updatedBefore: req.query.updatedBefore,
      searchText: req.query.searchText,
      sortBy: req.query.sortBy || 'createdAt',
      sortOrder: req.query.sortOrder === 'asc' ? 1 : -1
    };

    logWithTime(`🔄 Fetching organizations with filters: ${JSON.stringify(filters)} ${getLogIdentifiers(req)}`);

    // Fetch organizations
    const result = await listOrganizations(filters);

    // Success response
    logWithTime(`✅ Organizations fetched successfully: ${result.organizations.length} records ${getLogIdentifiers(req)}`);
    return listOrganizationsSuccessResponse(res, result);

  } catch (err) {
    logWithTime(`❌ Internal Error in listOrganizationController ${getLogIdentifiers(req)}: ${err.message}`);
    return throwInternalServerError(res, err);
  }
};

module.exports = {
    listOrganizationController
}