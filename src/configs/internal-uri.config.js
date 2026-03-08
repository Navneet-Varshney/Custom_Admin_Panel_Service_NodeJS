/**
 * Internal Service URI Configuration
 * 
 * Central configuration for all internal microservice API endpoints.
 * Contains URIs and HTTP methods for Auth Service and Software Management Service.
 * 
 * @author Admin Panel Service Team
 * @date 2026-03-06
 */

/**
 * HTTP Request Methods
 */
const requestMethod = {
    GET: "GET",
    POST: "POST",
    PUT: "PUT",
    DELETE: "DELETE",
    PATCH: "PATCH"
};

/**
 * Auth Service Internal API Endpoints
 */
const AUTH_SERVICE_URIS = {
    HEALTH_CHECK: {
        method: requestMethod.GET,
        uri: "/custom-auth-service/api/v1/internal/admin-panel/health"
    },
    POST_REFRESH: {
        method: requestMethod.POST,
        uri: "/custom-auth-service/api/v1/internal/post-refresh"
    },
    BOOTSTRAP_SUPER_ADMIN: {
        method: requestMethod.POST,
        uri: "/custom-auth-service/api/v1/internal/admin-panel/bootstrap/super-admin"
    },
    CREATE_USER: {
        method: requestMethod.POST,
        uri: "/custom-auth-service/api/v1/internal/create-user"
    },
    CONVERT_USER_TO_CLIENT: {
        method: requestMethod.PATCH,
        uri: "/custom-auth-service/api/v1/internal/convert-user-type/{userId}"
    }
};

/**
 * Software Management Service Internal API Endpoints
 */
const SOFTWARE_MANAGEMENT_URIS = {
    HEALTH_CHECK: {
        method: requestMethod.GET,
        uri: "/software-management-service/api/v1/internal/admin-panel/health"
    },
    CREATE_USER: {
        method: requestMethod.POST,
        uri: "/software-management-service/api/v1/internal/create-user"
    }
};

module.exports = {
    AUTH_SERVICE_URIS,
    SOFTWARE_MANAGEMENT_URIS,
    requestMethod
};
