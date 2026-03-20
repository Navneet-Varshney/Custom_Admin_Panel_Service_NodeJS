const { logWithTime } = require("@utils/time-stamps.util");
const { OK } = require("@configs/http-status.config");

/**
 * Common Response Handlers for Internal Routes
 * 
 * Centralized response management for internal/microservice communication
 * No hardcoded responses in routes
 */

/**
 * Success Response - Auth Service Health Check
 * @param {Object} res - Express response object
 * @param {Object} serviceAuth - Service authentication data
 */
const sendAuthServiceHealthSuccess = (res, serviceAuth) => {
    logWithTime("✅ Auth service health check successful");
    return res.status(OK).json({
        success: true,
        message: "Auth service endpoint is healthy",
        service: "admin-panel-service",
        requestedBy: {
            serviceName: serviceAuth.serviceName,
            serviceInstanceId: serviceAuth.serviceInstanceId
        },
        timestamp: new Date().toISOString()
    });
};

/**
 * Success Response - Software Management Service Health Check
 * @param {Object} res - Express response object
 * @param {Object} serviceAuth - Service authentication data
 */
const sendSoftwareServiceHealthSuccess = (res, serviceAuth) => {
    logWithTime("✅ Software management service health check successful");
    return res.status(OK).json({
        success: true,
        message: "Software management service endpoint is healthy",
        service: "admin-panel-service",
        requestedBy: {
            serviceName: serviceAuth.serviceName,
            serviceInstanceId: serviceAuth.serviceInstanceId
        },
        timestamp: new Date().toISOString()
    });
};

/**
 * Success Response - Delete User
 * @param {Object} res - Express response object
 * @param {Object} data - Deleted user/admin data { userId, type }
 */
const sendDeleteUserSuccess = (res, data) => {
    logWithTime("✅ User deleted successfully");
    return res.status(OK).json({
        success: true,
        message: "User deleted successfully",
        data: {
            userId: data.userId || data.adminId,
            type: data.userType || "ADMIN"
        }
    });
};

/**
 * Success Response - Toggle Active Status
 * @param {Object} res - Express response object
 * @param {Object} data - Updated user/admin data { userId, isActive }
 */
const sendToggleActiveStatusSuccess = (res, data) => {
    const action = data.isActive ? "activated" : "deactivated";
    logWithTime(`✅ User ${action} successfully`);
    return res.status(OK).json({
        success: true,
        message: `User ${action} successfully`,
        data: {
            userId: data.userId || data.adminId,
            isActive: data.isActive
        }
    });
};

const sendUpdatedUserDetailsSuccess = (res, data) => {
    logWithTime(`✅ User details updated successfully`);
    return res.status(OK).json({
        success: true,
        message: `User details updated successfully`,
        data: {
            userId: data.userId || data.adminId,
            firstName: data.firstName,
            userType: data.userType
        }
    });
}

module.exports = {
    // Health checks
    sendAuthServiceHealthSuccess,
    sendSoftwareServiceHealthSuccess,
    // Delete operations
    sendDeleteUserSuccess,
    // Status operations
    sendToggleActiveStatusSuccess,
    // Update operations
    sendUpdatedUserDetailsSuccess
};
