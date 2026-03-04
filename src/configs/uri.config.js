// Base path of all APIs (can be changed in one place if needed)
const BASE_PATH = "/admin-panel-service";

// API versioning (helps us move from /v1 to /v2 easily)
const API_VERSION = "/api/v1";

// API Prefix that is Base Path + API Version
const API_PREFIX = `${BASE_PATH}${API_VERSION}`;

const INTERNAL_BASE = `${API_PREFIX}/internals`;  // /admin-panel-service/api/v1/internal
            
module.exports = {
    INTERNAL_BASE: INTERNAL_BASE,
    INTERNAL_ROUTES: {
        CREATE_SUPER_ADMIN: `/create-super-admin`, // /admin-panel-service/api/v1/internal/create-super-admin
        PROVIDE_HEALTH_CHECK_TO_AUTH_SERVICE: `/auth/health`, // /admin-panel-service/api/v1/internal/auth/health
        PROVIDE_HEALTH_CHECK_TO_SOFTWARE_SERVICE: `/software/health` // /admin-panel-service/api/v1/internal/software/health
    }
};