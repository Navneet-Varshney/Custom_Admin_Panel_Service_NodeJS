const { checkFeatureEnabled } = require("../factory/feature-enabled.middleware-factory");
const { ALLOW_ADMIN_BLOCKING } = require("@/configs/security.config");

const adminBlockingFeatureEnabledMiddleware = checkFeatureEnabled(
    "Admin Blocking Feature",
    () => ALLOW_ADMIN_BLOCKING,
    true,
    "Admin blocking feature is currently disabled on this system."
);

module.exports = {
    adminBlockingFeatureEnabledMiddleware
};
