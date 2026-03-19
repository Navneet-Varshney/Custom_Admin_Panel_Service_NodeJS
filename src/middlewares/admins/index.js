const { ensureAdminExists, ensureAdminNew, fetchRequestAdmin } = require("./fetch-admin.middleware");
const { validationMiddlewares } = require("./field-validation.middleware");
const { adminRoleAuthorizeMiddlewares } = require("./role-authorize.middleware");
const { hierarchyGuard } = require("./role-hierarchy.middleware");
const { presenceMiddlewares } = require("./validate-request-body.middleware");
const { adminBlockingFeatureEnabledMiddleware } = require("./feature-enabled.middleware");

const adminMiddlewares = {
    ensureAdminExists,
    ensureAdminNew,
    ...validationMiddlewares,
    hierarchyGuard,
    ...presenceMiddlewares,
    fetchRequestAdmin,
    adminBlockingFeatureEnabledMiddleware,
    ...adminRoleAuthorizeMiddlewares
}

module.exports = {
    adminMiddlewares
}