const { roleAuthorize } = require("../factory/role-authorize.middleware-factory");
const { ADMIN_ROUTE_AUTHORIZATION } = require("@configs/api-role-permission.config.js");

const adminRoleAuthorizeMiddlewares = {
    createAdminRoleAuthorizeMiddleware: roleAuthorize(ADMIN_ROUTE_AUTHORIZATION.CREATE_ADMIN),
    createClientRoleAuthorizeMiddleware: roleAuthorize(ADMIN_ROUTE_AUTHORIZATION.CREATE_CLIENT),
    convertUserToClientRoleAuthorizeMiddleware: roleAuthorize(ADMIN_ROUTE_AUTHORIZATION.CONVERT_USER_TO_CLIENT),
    blockAdminRoleAuthorizeMiddleware: roleAuthorize(ADMIN_ROUTE_AUTHORIZATION.BLOCK_ADMIN),
    unblockAdminRoleAuthorizeMiddleware: roleAuthorize(ADMIN_ROUTE_AUTHORIZATION.UNBLOCK_ADMIN)
}

module.exports = {
    adminRoleAuthorizeMiddlewares
}