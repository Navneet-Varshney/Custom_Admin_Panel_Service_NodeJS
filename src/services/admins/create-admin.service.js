// CREATE ADMIN SERVICE

const { AdminModel } = require("@models/admin.model");
const { logWithTime } = require("@utils/time-stamps.util");
const { logActivityTrackerEvent } = require("@/services/audit/activity-tracker.service");
const { ACTIVITY_TRACKER_EVENTS } = require("@configs/tracker.config");
const { AdminErrorTypes } = require("@configs/enums.config");
// const { notifySupervisorOnAdminCreation } = require("@utils/admin-notifications.util");
const { createInternalServiceClient } = require("@/utils/internal-service-client.util");
const { getServiceToken } = require("@/internals/service-token");
const { AUTH_SERVICE_URIS, SOFTWARE_MANAGEMENT_URIS } = require("@/configs/internal-uri.config");
const { INTERNAL_API, SERVICE_NAMES } = require("@/internals/constants");

/**
 * Create Admin Service
 * @param {Object} creatorAdmin - The admin creating the new admin
 * @param {Object} adminData - Admin data {firstName, adminType, supervisorId, creationReason, email, password, countryCode, localNumber, phone}
 * @param {Object} supervisor - Supervisor admin object (if applicable)
 * @param {Object} device - Device object {deviceUUID, deviceType, deviceName}
 * @param {string} requestId - Request ID for tracking
 * @returns {Promise<{success: boolean, data?: Object, type?: string, message?: string}>}
 */
const createAdminService = async (creatorAdmin, adminData, supervisor, device, requestId) => {
    try {
        const { firstName, adminType, supervisorId, creationReason, email, password, countryCode, localNumber, phone, role } = adminData;

        // Create Admin In Auth Service and get Admin Id
        logWithTime(`🔄 Creating admin account in Auth Service...`);
        
        const serviceToken = await getServiceToken(SERVICE_NAMES.ADMIN_PANEL_SERVICE);
        const authClient = createInternalServiceClient(
            INTERNAL_API.CUSTOM_AUTH_SERVICE_URL,
            serviceToken,
            SERVICE_NAMES.ADMIN_PANEL_SERVICE,
            INTERNAL_API.TIMEOUT,
            INTERNAL_API.RETRY_ATTEMPTS,
            INTERNAL_API.RETRY_DELAY
        );

        const authResult = await authClient.callService({
            method: AUTH_SERVICE_URIS.CREATE_USER.method,
            uri: AUTH_SERVICE_URIS.CREATE_USER.uri,
            body: {
                type: "admin",
                firstName,
                email,
                password,
                countryCode,
                localNumber,
                phone
            }
        });

        if (!authResult.success) {
            logWithTime(`❌ Auth Service failed to create admin: ${authResult.error}`);
            return {
                success: false,
                type: AdminErrorTypes.INVALID_DATA,
                message: authResult.error || "Failed to create admin account in Auth Service"
            };
        }

        const adminId = authResult.data?.data?.userId || authResult.data?.userId;
        
        if (!adminId) {
            logWithTime(`❌ Auth Service did not return adminId`);
            return {
                success: false,
                type: AdminErrorTypes.INVALID_DATA,
                message: "Auth Service did not return admin ID"
            };
        } else {
            // Create Admin in Software Management Service
            logWithTime(`🔄 Creating admin account in Software Management Service...`);
            const softwareManagementClient = createInternalServiceClient(
                INTERNAL_API.SOFTWARE_MANAGEMENT_BASE_URL,
                serviceToken,
                SERVICE_NAMES.ADMIN_PANEL_SERVICE,
                INTERNAL_API.TIMEOUT,
                INTERNAL_API.RETRY_ATTEMPTS,
                INTERNAL_API.RETRY_DELAY
            );
            const id = adminId; // Use the same ID for consistency across services
            const smsResult = await softwareManagementClient.callService({
                method: SOFTWARE_MANAGEMENT_URIS.CREATE_USER.method,
                uri: SOFTWARE_MANAGEMENT_URIS.CREATE_USER.uri,
                body: {
                    type: "admin",
                    firstName,
                    id,
                    role
                }
            });

            if (!smsResult.success) {
                logWithTime(`❌ Software Management Service failed to create admin: ${smsResult.error}`);
            } else {
                logWithTime(`✅ Admin account created in Software Management Service: ${adminId}`);
            }
        }

        logWithTime(`✅ Admin account created in Auth Service: ${adminId}`);

        // Create new admin
        const newAdmin = new AdminModel({
            adminId,
            firstName,
            adminType,
            supervisorId: supervisorId || null,
            createdBy: creatorAdmin.adminId,
            isActive: true
        });

        await newAdmin.save();

        logWithTime(`✅ Admin created in DB: ${newAdmin.adminId}`);

        // Log activity
        logActivityTrackerEvent(
            creatorAdmin,
            device,
            requestId,
            ACTIVITY_TRACKER_EVENTS.CREATE_ADMIN,
            `Created admin ${newAdmin.adminId} (${adminType})`,
            { 
                newData: { adminId: newAdmin.adminId, adminType, firstName, supervisorId },
                adminActions: { 
                    targetId: newAdmin.adminId, 
                    reason: creationReason 
                } 
            }
        );

        /*
        // Notify supervisor if applicable
        if (supervisor) {
            await notifySupervisorOnAdminCreation(supervisor, newAdmin, creatorAdmin);
        }
        */
        return {
            success: true,
            data: newAdmin
        };

    } catch (error) {
        logWithTime(`❌ Create admin service error: ${error.message}`);
        
        if (error.code === 11000) {
            return {
                success: false,
                type: AdminErrorTypes.CONFLICT,
                message: "Admin ID already exists"
            };
        }

        return {
            success: false,
            type: AdminErrorTypes.INVALID_DATA,
            message: error.message
        };
    }
};

module.exports = { createAdminService };