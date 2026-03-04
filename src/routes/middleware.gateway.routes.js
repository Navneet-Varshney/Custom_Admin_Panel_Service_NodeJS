const { 
    authServiceMiddleware,
    softwareManagementServiceMiddleware 
} = require("@middlewares/internals/verify-service-name.middleware");
const { commonMiddlewares } = require("@middlewares/common/index");

const baseMiddlewares = [
    commonMiddlewares.requestIdMiddleware,
    commonMiddlewares.verifyDeviceField,
    commonMiddlewares.isDeviceBlocked
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
    softwareManagementInternalMiddlewares
};