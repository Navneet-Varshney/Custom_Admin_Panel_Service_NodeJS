const { OrganizationModel } = require("@/models/organization.model");
const { isValidMongoID } = require("@/utils/id-validators.util");


const checkOrgExists = async (organizationIds = []) => {
    // Step 1: format validation
    const allValid = organizationIds.every(id => isValidMongoID(id));
    if (!allValid) return false;

    // Step 2: DB check (single query)
    const count = await OrganizationModel.countDocuments({
        _id: { $in: organizationIds }
    });

    return count === organizationIds.length;
};

module.exports = { checkOrgExists };