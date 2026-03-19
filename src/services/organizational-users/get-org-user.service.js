const { OrganizationUserModel } = require("@/models/organizational-user.model");

/**
 * Find organization user by ID (excluding soft deleted)
 * @param {string} id - Organization User ID
 * @returns {Promise<Object|null>}
 */
const findOrgUserById = async (id) => {
    return await OrganizationUserModel.findOne({ _id: id, deletedAt: null });
};

/**
 * Fetch organization user for get request
 * @param {string} id - Organization User ID
 * @returns {Promise<Object|null>}
 */
const fetchOrgUser = async (id) => {
    return await findOrgUserById(id);
};

module.exports = {
    findOrgUserById,
    fetchOrgUser
};
