const { requestIdMiddleware } = require("./check-request-id.middleware");
const { isDeviceBlocked } = require("./is-device-blocked.middleware");
const { validateJwtPayloadMiddleware } = require("./validate-jwt-payload.middleware");
const { validateRedisPayloadMiddleware } = require("./validate-redis-payload.middleware");
const { verifyDeviceField } = require("./verify-device-field.middleware");
const { verifyJWTSignatureMiddleware } = require("./verify-jwt-signature.middleware");
const { sanitizeAuthBody, sanitizeAuthQuery, sanitizeAuthParams } = require("./sanitize-auth.middleware");
const { authValidatorBody, authValidatorQuery, authValidatorParams } = require("./auth.middleware");
const { firstNameValidator } = require("./first-name.middleware");
const { isUserAccountActive } = require("./is-user-account-active.middleware");
const { isUserAccountBlocked } = require("./is-user-blocked.middleware");
const { convertUserToClientMiddleware } = require("./validate-type-transition.middleware");

const commonMiddlewares = {
    requestIdMiddleware,
    isDeviceBlocked,
    verifyDeviceField,
    verifyJWTSignatureMiddleware,
    validateJwtPayloadMiddleware,
    validateRedisPayloadMiddleware,
    sanitizeAuthBody,
    sanitizeAuthQuery,
    sanitizeAuthParams,
    authValidatorBody,
    authValidatorQuery,
    authValidatorParams,
    firstNameValidator,
    isUserAccountActive,
    isUserAccountBlocked,
    convertUserToClientMiddleware
}

module.exports = {
    commonMiddlewares
}