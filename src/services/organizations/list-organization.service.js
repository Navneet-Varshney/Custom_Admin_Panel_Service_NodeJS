const { OrganizationModel } = require("@/models/organization.model");
const { logWithTime } = require("@utils/time-stamps.util");

/**
 * List all organizations with pagination and filtering
 * @param {Object} filters - Filter criteria {page, limit, createdAfter, createdBefore, updatedAfter, updatedBefore, searchText, sortBy, sortOrder}
 * @returns {Promise<{organizations: Array, total: number, limit: number, pages: number, currentPage: number}>}
 */
const listOrganizations = async (filters = {}) => {
  try {
    const {
      page = 1,
      limit = 10,
      createdAfter,
      createdBefore,
      updatedAfter,
      updatedBefore,
      searchText,
      sortBy = 'createdAt',
      sortOrder = -1
    } = filters;

    logWithTime(`🔄 Fetching organizations: page=${page}, limit=${limit}...`);

    // Build query filter
    const queryFilter = { deletedAt: null };

    // Date range filters
    if (createdAfter || createdBefore) {
      queryFilter.createdAt = {};
      if (createdAfter) queryFilter.createdAt.$gte = new Date(createdAfter);
      if (createdBefore) queryFilter.createdAt.$lte = new Date(createdBefore);
    }

    if (updatedAfter || updatedBefore) {
      queryFilter.updatedAt = {};
      if (updatedAfter) queryFilter.updatedAt.$gte = new Date(updatedAfter);
      if (updatedBefore) queryFilter.updatedAt.$lte = new Date(updatedBefore);
    }

    // Search filter
    if (searchText) {
      queryFilter.organizationName = { $regex: searchText, $options: 'i' };
    }

    // Calculate skip
    const skip = (page - 1) * limit;

    // Build sort object
    const sortObj = {};
    sortObj[sortBy] = sortOrder; // -1 for desc, 1 for asc

    // Fetch organizations
    const organizations = await OrganizationModel.find(queryFilter)
      .select('_id organizationName orgType website contactEmail isActive createdAt updatedAt createdBy updatedBy')
      .sort(sortObj)
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const total = await OrganizationModel.countDocuments(queryFilter);
    const pages = Math.ceil(total / limit);

    logWithTime(`✅ Fetched ${organizations.length} organizations (Total: ${total})`);
    
    return {
      organizations,
      total,
      limit,
      pages,
      currentPage: page
    };

  } catch (error) {
    logWithTime(`❌ List organizations error: ${error.message}`);
    throw error;
  }
};

module.exports = { listOrganizations };