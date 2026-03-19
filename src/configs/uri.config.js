// Base path of all APIs (can be changed in one place if needed)
const BASE_PATH = "/admin-panel-service";

// API versioning (helps us move from /v1 to /v2 easily)
const API_VERSION = "/api/v1";

// API Prefix that is Base Path + API Version
const API_PREFIX = `${BASE_PATH}${API_VERSION}`;

const INTERNAL_BASE = `${API_PREFIX}/internal`;  // /admin-panel-service/api/v1/internal
const ADMIN_BASE = `${API_PREFIX}/admins`; // /admin-panel-service/api/v1/admins
const ORGANIZATION_BASE = `${API_PREFIX}/organizations`; // /admin-panel-service/api/v1/organizations
const USER_BASE = `${API_PREFIX}/users`; // /admin-panel-service/api/v1/users
const DEVICE_BASE = `${API_PREFIX}/devices`; // /admin-panel-service/api/v1/devices

module.exports = {
    ADMIN_BASE: ADMIN_BASE,
    INTERNAL_BASE: INTERNAL_BASE,
    ORG_BASE: ORGANIZATION_BASE,
    USER_BASE: USER_BASE,
    DEVICE_BASE: DEVICE_BASE,
    INTERNAL_ROUTES: {
        CREATE_SUPER_ADMIN: `/create-super-admin`, // /admin-panel-service/api/v1/internal/create-super-admin
        PROVIDE_HEALTH_CHECK_TO_AUTH_SERVICE: `/auth/health`, // /admin-panel-service/api/v1/internal/auth/health
        PROVIDE_HEALTH_CHECK_TO_SOFTWARE_SERVICE: `/software-management/health`, // /admin-panel-service/api/v1/internal/software/health
        CREATE_USER: `/create-user`, // /admin-panel-service/api/v1/internal/create-user
        BLOCK_USER: `/block-user`, // /admin-panel-service/api/v1/internal/block-user
        UNBLOCK_USER: `/unblock-user`, // /admin-panel-service/api/v1/internal/unblock-user
        BLOCK_DEVICE: `/block-device`, // /admin-panel-service/api/v1/internal/block-device
        UNBLOCK_DEVICE: `/unblock-device` // /admin-panel-service/api/v1/internal/unblock-device
    },
    ADMIN_ROUTES: {
        CREATE_ADMIN: `/create-admin`, // /admin-panel-service/api/v1/admins/create-admin
        CREATE_CLIENT: `/create-client`, // /admin-panel-service/api/v1/admins/create-client
        CONVERT_USER_TO_CLIENT: `/convert-user-to-client`, // /admin-panel-service/api/v1/admins/convert-user-to-client
        BLOCK_ADMIN: `/block-admin`, // /admin-panel-service/api/v1/admins/block-admin
        UNBLOCK_ADMIN: `/unblock-admin`, // /admin-panel-service/api/v1/admins/unblock-admin
        GET_ADMIN: `/get-admin`, // /admin-panel-service/api/v1/admins/get-admin
        UPDATE_ADMIN: `/update-admin`, // /admin-panel-service/api/v1/admins/update-admin
        DELETE_ADMIN: `/delete-admin` // /admin-panel-service/api/v1/admins/delete-admin
    },
    ORGANIZATIONAL_ROUTES: {
        CREATE_ORGANIZATION: `/create`, // /admin-panel-service/api/v1/organizations/create
        UPDATE_ORGANIZATION: `/update/:organizationId`, // /admin-panel-service/api/v1/organizations/update/:organizationId
        DELETE_ORGANIZATION: `/delete/:organizationId`, // /admin-panel-service/api/v1/organizations/delete/:organizationId
        DISABLE_ORGANIZATION: `/disable/:organizationId`, // /admin-panel-service/api/v1/organizations/disable/:organizationId
        ENABLE_ORGANIZATION: `/enable/:organizationId`, // /admin-panel-service/api/v1/organizations/enable/:organizationId
        GET_ORGANIZATION: `/get/:organizationId`, // /admin-panel-service/api/v1/organizations/get/:organizationId
        LIST_ORGANIZATIONS: `/list`, // /admin-panel-service/api/v1/organizations/list

        CREATE_ORGANIZATION_USER: `/create-org-user`, // /admin-panel-service/api/v1/organizations/create-org-user
        UPDATE_ORGANIZATION_USER: `/update-org-user/:orgUserId`, // /admin-panel-service/api/v1/organizations/update-org-user/:orgUserId
        DELETE_ORGANIZATION_USER: `/delete-org-user/:orgUserId`, // /admin-panel-service/api/v1/organizations/delete-org-user/:orgUserId
        DISABLE_ORGANIZATION_USER: `/disable-org-user/:orgUserId`, // /admin-panel-service/api/v1/organizations/disable-org-user/:orgUserId
        ENABLE_ORGANIZATION_USER: `/enable-org-user/:orgUserId`, // /admin-panel-service/api/v1/organizations/enable-org-user/:orgUserId
        GET_ORGANIZATION_USER: `/get-org-user/:orgUserId`, // /admin-panel-service/api/v1/organizations/get-org-user/:orgUserId
        LIST_ORGANIZATION_USERS: `/list-org-users` // /admin-panel-service/api/v1/organizations/list-org-users/:organizationId
    },
    USER_ROUTES: {
        BLOCK_USER: `/block`, // /admin-panel-service/api/v1/users/block
        UNBLOCK_USER: `/unblock` // /admin-panel-service/api/v1/users/unblock
    },
    DEVICE_ROUTES: {
        BLOCK_DEVICE: `/block`, // /admin-panel-service/api/v1/devices/block
        UNBLOCK_DEVICE: `/unblock` // /admin-panel-service/api/v1/devices/unblock
    }
};