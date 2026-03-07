// Base path of all APIs (can be changed in one place if needed)
const BASE_PATH = "/admin-panel-service";

// API versioning (helps us move from /v1 to /v2 easily)
const API_VERSION = "/api/v1";

// API Prefix that is Base Path + API Version
const API_PREFIX = `${BASE_PATH}${API_VERSION}`;

const INTERNAL_BASE = `${API_PREFIX}/internal`;  // /admin-panel-service/api/v1/internal
const ADMIN_BASE = `${API_PREFIX}/admins`; // /admin-panel-service/api/v1/admins

module.exports = {
    ADMIN_BASE: ADMIN_BASE,
    INTERNAL_BASE: INTERNAL_BASE,
    INTERNAL_ROUTES: {
        CREATE_SUPER_ADMIN: `/create-super-admin`, // /admin-panel-service/api/v1/internal/create-super-admin
        PROVIDE_HEALTH_CHECK_TO_AUTH_SERVICE: `/auth/health`, // /admin-panel-service/api/v1/internal/auth/health
        PROVIDE_HEALTH_CHECK_TO_SOFTWARE_SERVICE: `/software-management/health`, // /admin-panel-service/api/v1/internal/software/health
        CREATE_USER: `/create-user` // /admin-panel-service/api/v1/internal/create-user
    },
    ADMIN_ROUTES: {
        CREATE_ADMIN: `/create-admin`, // /admin-panel-service/api/v1/admins/create-admin
        CREATE_USER: `/create-user`, // /admin-panel-service/api/v1/admins/create-user
        GET_ADMIN: `/get-admin`, // /admin-panel-service/api/v1/admins/get-admin
        UPDATE_ADMIN: `/update-admin`, // /admin-panel-service/api/v1/admins/update-admin
        DELETE_ADMIN: `/delete-admin` // /admin-panel-service/api/v1/admins/delete-admin
    }
};