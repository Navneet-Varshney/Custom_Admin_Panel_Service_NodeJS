const { OrganizationModel } = require("@/models/organization.model");

/**
 * Find organization by ID (excluding soft deleted)
 * @param {string} id - Organization ID
 * @returns {Promise<Object|null>}
 */
const findOrgById = async (id) => {
    // Soft deleted orgs na aayein iska dhyaan rakha
    return await OrganizationModel.findOne({ _id: id, deletedAt: null });
};

/**
 * Fetch organization for get request
 * @param {string} id - Organization ID
 * @returns {Promise<Object|null>}
 */
const fetchOrganization = async (id) => {
    return await findOrgById(id);
};

module.exports = {
    findOrgById,
    fetchOrganization
};