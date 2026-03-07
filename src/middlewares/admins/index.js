const { checkAdminMiddleware } = require("./check-admin.middleware");
const { ensureAdminExists, ensureAdminNew, fetchRequestAdmin } = require("./fetch-admin.middleware");
const { validationMiddlewares } = require("./field-validation.middleware");
const { hierarchyGuard } = require("./role-hierarchy.middleware");
const { presenceMiddlewares } = require("./validate-request-body.middleware");

const adminMiddlewares = {
    checkAdminMiddleware,
    ensureAdminExists,
    ensureAdminNew,
    ...validationMiddlewares,
    hierarchyGuard,
    ...presenceMiddlewares,
    fetchRequestAdmin
}

module.exports = {
    adminMiddlewares
}