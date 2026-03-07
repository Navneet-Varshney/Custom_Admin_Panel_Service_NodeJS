const { 
    authServiceMiddleware,
    softwareManagementServiceMiddleware 
} = require("@middlewares/internals/verify-service-name.middleware");
const { commonMiddlewares } = require("@middlewares/common/index");
const { adminMiddlewares } = require("@/middlewares/admins");

const baseMiddlewares = [
    commonMiddlewares.requestIdMiddleware,
    commonMiddlewares.verifyDeviceField,
    commonMiddlewares.isDeviceBlocked
];

const accountStatusMiddlewares = [
    commonMiddlewares.isUserAccountActive,
    commonMiddlewares.isUserAccountBlocked
];

const baseAuthMiddlewares = [
    ...baseMiddlewares,
    commonMiddlewares.validateRedisPayloadMiddleware,
    commonMiddlewares.validateJwtPayloadMiddleware,
    commonMiddlewares.verifyJWTSignatureMiddleware,
];

const baseAuthAdminMiddlewares = [
    ...baseAuthMiddlewares,
    adminMiddlewares.checkAdminMiddleware,
    adminMiddlewares.fetchRequestAdmin,
    ...accountStatusMiddlewares
];

const authInternalMiddlewares = [
    ...baseMiddlewares,
    authServiceMiddleware
];

const softwareManagementInternalMiddlewares = [
    ...baseMiddlewares,
    softwareManagementServiceMiddleware
];

module.exports = {
    authInternalMiddlewares,
    softwareManagementInternalMiddlewares,
    baseAuthAdminMiddlewares
};