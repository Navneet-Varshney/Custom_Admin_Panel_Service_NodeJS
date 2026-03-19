const mongoose = require("mongoose");
const { OrganizationUserModel } = require("@/models/organizational-user.model");
const { logWithTime } = require("@utils/time-stamps.util");

const listOrgUsersByOrganization = async (organizationId = null, filters = {}) => {
  try {
    const {
      page = 1,
      limit = 10,
      createdAfter,
      createdBefore,
      updatedAfter,
      updatedBefore,
      role,
      sortBy = "createdAt",
      sortOrder = -1
    } = filters;

    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 10;

    logWithTime(
      `🔄 Fetching organization users: org=${organizationId || "ALL"}, page=${pageNum}, limit=${limitNum}`
    );

    // ✅ Base filter
    const queryFilter = { deletedAt: null };

    // ✅ Optional organization filter
    if (organizationId) {
      queryFilter.organizationId = new mongoose.Types.ObjectId(organizationId);
    }

    // ✅ Date filters
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

    // ✅ Role filter
    if (role) {
      queryFilter.role = role.toLowerCase();
    }

    // ✅ Pagination
    const skip = (pageNum - 1) * limitNum;

    // ✅ Sorting
    const sortObj = {
      [sortBy]: sortOrder === 1 ? 1 : -1
    };

    // ✅ Query
    const orgUsers = await OrganizationUserModel.find(queryFilter)
      .select("_id userId organizationId role isActive createdAt updatedAt createdBy updatedBy")
      .sort(sortObj)
      .skip(skip)
      .limit(limitNum)
      .lean();

    const total = await OrganizationUserModel.countDocuments(queryFilter);
    const pages = Math.ceil(total / limitNum);

    logWithTime(`✅ Fetched ${orgUsers.length} organization users (Total: ${total})`);

    return {
      orgUsers,
      total,
      limit: limitNum,
      pages,
      currentPage: pageNum
    };

  } catch (error) {
    logWithTime(`❌ List organization users error: ${error.message}`);
    throw error;
  }
};

module.exports = { listOrgUsersByOrganization };