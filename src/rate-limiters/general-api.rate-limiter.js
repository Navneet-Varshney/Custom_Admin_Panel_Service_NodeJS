// middlewares/rate-limiters/apiRateLimiters.js
const { createRateLimiter } = require("./create.rate-limiter");
const { perUserAndDevice } = require("@configs/rate-limit.config");

module.exports = {
    createAdminRateLimiter: createRateLimiter(perUserAndDevice.createAdmin),
    createClientRateLimiter: createRateLimiter(perUserAndDevice.createClient),
    convertUserToClientRateLimiter: createRateLimiter(perUserAndDevice.convertUserToClient),
    blockAdminRateLimiter: createRateLimiter(perUserAndDevice.blockAdmin),
    unblockAdminRateLimiter: createRateLimiter(perUserAndDevice.unblockAdmin),
    blockUserRateLimiter: createRateLimiter(perUserAndDevice.blockUser),
    unblockUserRateLimiter: createRateLimiter(perUserAndDevice.unblockUser),
    blockDeviceRateLimiter: createRateLimiter(perUserAndDevice.blockDevice),
    unblockDeviceRateLimiter: createRateLimiter(perUserAndDevice.unblockDevice),
    createOrganizationRateLimiter: createRateLimiter(perUserAndDevice.createOrganization),
    updateOrganizationRateLimiter: createRateLimiter(perUserAndDevice.updateOrganization),
    deleteOrganizationRateLimiter: createRateLimiter(perUserAndDevice.deleteOrganization),
    disableOrganizationRateLimiter: createRateLimiter(perUserAndDevice.disableOrganization),
    enableOrganizationRateLimiter: createRateLimiter(perUserAndDevice.enableOrganization),
    getOrganizationRateLimiter: createRateLimiter(perUserAndDevice.getOrganization),
    listOrganizationsRateLimiter: createRateLimiter(perUserAndDevice.listOrganizations),
    createOrgUserRateLimiter: createRateLimiter(perUserAndDevice.createOrgUser),
    updateOrgUserRateLimiter: createRateLimiter(perUserAndDevice.updateOrgUser),
    deleteOrgUserRateLimiter: createRateLimiter(perUserAndDevice.deleteOrgUser),
    disableOrgUserRateLimiter: createRateLimiter(perUserAndDevice.disableOrgUser),
    enableOrgUserRateLimiter: createRateLimiter(perUserAndDevice.enableOrgUser),
    getOrgUserRateLimiter: createRateLimiter(perUserAndDevice.getOrgUser),
    listOrgUsersRateLimiter: createRateLimiter(perUserAndDevice.listOrgUsers),
    getAdminActivitiesRateLimiter: createRateLimiter(perUserAndDevice.getAdminActivities),
    listActivitiesRateLimiter: createRateLimiter(perUserAndDevice.listActivities),
    getMyActivitiesRateLimiter: createRateLimiter(perUserAndDevice.getMyActivities),
    createClientConversionRequestRateLimiter: createRateLimiter(perUserAndDevice.createClientConversionRequest)
}