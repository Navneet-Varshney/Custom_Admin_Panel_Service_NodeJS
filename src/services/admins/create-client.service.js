// CREATE CLIENT SERVICE

const { UserModel } = require("@models/user.model");
const { logWithTime } = require("@utils/time-stamps.util");
const { logActivityTrackerEvent } = require("@/services/audit/activity-tracker.service");
const { ACTIVITY_TRACKER_EVENTS } = require("@configs/tracker.config");
const { AdminErrorTypes, UserTypes, ClientStatus } = require("@configs/enums.config");
// const { notifySupervisorOnAdminCreation } = require("@utils/admin-notifications.util");
const { createInternalServiceClient } = require("@/utils/internal-service-client.util");
const { getServiceToken } = require("@/internals/service-token");
const { AUTH_SERVICE_URIS, SOFTWARE_MANAGEMENT_URIS } = require("@/configs/internal-uri.config");
const { INTERNAL_API, SERVICE_NAMES } = require("@/internals/constants");

/**
 * Create Client Service
 * @param {Object} creatorAdmin - The admin creating the new client
 * @param {Object} clientData - Client data {firstName, creationReason, email, password, countryCode, localNumber, phone, role}
 * @param {Object} device - Device object {deviceUUID, deviceType, deviceName}
 * @param {string} requestId - Request ID for tracking
 * @returns {Promise<{success: boolean, data?: Object, type?: string, message?: string}>}
 */
const createClientService = async (creatorAdmin, clientData, device, requestId) => {
    try {
        const { firstName, creationReason, email, password, countryCode, localNumber, phone, role } = clientData;

        // Create Client In Auth Service and get Client Id
        logWithTime(`🔄 Creating client account in Auth Service...`);
        
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
                type: "user",
                firstName,
                email,
                password,
                countryCode,
                localNumber,
                phone
            }
        });

        if (!authResult.success) {
            logWithTime(`❌ Auth Service failed to create client: ${authResult.error}`);
            return {
                success: false,
                type: AdminErrorTypes.INVALID_DATA,
                message: authResult.error || "Failed to create client account in Auth Service"
            };
        }

        const clientId = authResult.data?.data?.userId || authResult.data?.userId;
        
        if (!clientId) {
            logWithTime(`❌ Auth Service did not return clientId`);
            return {
                success: false,
                type: AdminErrorTypes.INVALID_DATA,
                message: "Auth Service did not return client ID"
            };
        } else {
            // Create Client in Software Management Service
            logWithTime(`🔄 Creating client account in Software Management Service...`);
            const softwareManagementClient = createInternalServiceClient(
                INTERNAL_API.SOFTWARE_MANAGEMENT_BASE_URL,
                serviceToken,
                SERVICE_NAMES.ADMIN_PANEL_SERVICE,
                INTERNAL_API.TIMEOUT,
                INTERNAL_API.RETRY_ATTEMPTS,
                INTERNAL_API.RETRY_DELAY
            );
            const id = clientId; // Use the same ID for consistency across services
            const smsResult = await softwareManagementClient.callService({
                method: SOFTWARE_MANAGEMENT_URIS.CREATE_USER.method,
                uri: SOFTWARE_MANAGEMENT_URIS.CREATE_USER.uri,
                body: {
                    type: "user",
                    firstName,
                    id,
                    role
                }
            });

            if (!smsResult.success) {
                logWithTime(`❌ Software Management Service failed to create client: ${smsResult.error}`);
            } else {
                logWithTime(`✅ Client account created in Software Management Service: ${clientId}`);
            }
        }

        logWithTime(`✅ Client account created in Auth Service: ${clientId}`);

        // Create new client with all required fields
        const newClient = new UserModel({
            userId: clientId,
            firstName,
            userType: UserTypes.CLIENT,
            clientStatus: ClientStatus.ACTIVE, // New clients are active by default
            convertedToClientBy: creatorAdmin.adminId, // Admin who created the client
            convertedToClientAt: new Date(), // Timestamp of creation
            clientCreationReason: creationReason // Reason from request body
        });

        await newClient.save();

        logWithTime(`✅ Client created in DB: ${newClient.userId}`);

        // Log activity
        logActivityTrackerEvent(
            creatorAdmin,
            device,
            requestId,
            ACTIVITY_TRACKER_EVENTS.CREATE_CLIENT,
            `Created client ${newClient.userId}`,
            { 
                newData: { 
                    userId: newClient.userId, 
                    userType: newClient.userType, 
                    firstName, 
                    clientStatus: newClient.clientStatus,
                    clientCreationReason: creationReason
                },
                adminActions: { 
                    targetId: newClient.userId, 
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
            data: newClient
        };

    } catch (error) {
        logWithTime(`❌ Create client service error: ${error.message}`);
        
        if (error.code === 11000) {
            return {
                success: false,
                type: AdminErrorTypes.CONFLICT,
                message: "Client ID already exists"
            };
        }

        return {
            success: false,
            type: AdminErrorTypes.INVALID_DATA,
            message: error.message
        };
    }
};

module.exports = { createClientService };