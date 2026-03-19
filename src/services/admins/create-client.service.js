// CREATE CLIENT SERVICE

const { UserModel } = require("@models/user.model");
const { logWithTime } = require("@utils/time-stamps.util");
const { logActivityTrackerEvent } = require("@/services/audit/activity-tracker.service");
const { ACTIVITY_TRACKER_EVENTS } = require("@configs/tracker.config");
const { AdminErrorTypes, UserTypes, ClientStatus } = require("@configs/enums.config");
const { DB_COLLECTIONS } = require("@/configs/db-collections.config");
const { prepareAuditData } = require("@/utils/audit-data.util");
// const { notifySupervisorOnAdminCreation } = require("@utils/admin-notifications.util");
const { createInternalServiceClient } = require("@/utils/internal-service-client.util");
const { getServiceToken } = require("@/internals/service-token");
const { AUTH_SERVICE_URIS, SOFTWARE_MANAGEMENT_URIS } = require("@/configs/internal-uri.config");
const { INTERNAL_API, SERVICE_NAMES } = require("@/internals/constants");
const { errorMessage } = require("@/utils/log-error.util");
const { checkOrgExists } = require("../organizations/check-org-exists.service");

/**
 * Create Client Service
 * @param {Object} creatorAdmin - The admin creating the new client
 * @param {Object} clientData - Client data {firstName, creationReason, email, password, countryCode, localNumber, phone, role}
 * @param {Object} device - Device object {deviceUUID, deviceType, deviceName}
 * @param {string} requestId - Request ID for tracking
 * @returns {Promise<{success: boolean, data?: Object, type?: string, message?: string}>}
 */

const createClientInSoftwareManagementService = async (client, firstName, role, orgIds = []) => {
    try {
        const clientId = client.userId; // Use the same ID for consistency across services

        // Create Client in Software Management Service
        const serviceToken = await getServiceToken(SERVICE_NAMES.ADMIN_PANEL_SERVICE);
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
                role,
                orgIds
            }
        });

        if (!smsResult.success) {
            logWithTime(`❌ Software Management Service failed to create client: ${smsResult.error}`);
        } else {
            logWithTime(`✅ Client account created in Software Management Service: ${clientId}`);
        }
    } catch (error) {
        logWithTime(`❌ Error in createClientInSoftwareManagementService`);
        errorMessage(error);
    }
}

const createClientService = async (creatorAdmin, clientData, device, requestId) => {
    try {
        const { firstName, creationReason, reasonDescription = undefined, email, password, countryCode, localNumber, phone, role, orgIds } = clientData;

        const checkOrgIds = await checkOrgExists(orgIds);
        if (!checkOrgIds) {
            return {
                success: false,
                type: AdminErrorTypes.INVALID_DATA,
                message: "One or more organization IDs are invalid"
            };
        }

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

        logWithTime(`🔍 Auth Service Full Response: ${JSON.stringify(authResult, null, 2)}`);
        
        const clientId = authResult?.data?.data?.userId;

        if (!clientId) {
            logWithTime(`❌ Auth Service did not return clientId`);
            return {
                success: false,
                type: AdminErrorTypes.INVALID_DATA,
                message: "Auth Service did not return client ID"
            };
        }

        logWithTime(`✅ Client account created in Auth Service: ${clientId}`);

        // Upsert client: Update if SYNC_USER already created it, or Insert if it doesn't exist yet
        const newClient = await UserModel.findOneAndUpdate(
            { userId: clientId },
            {
                $set: {
                    firstName,
                    userType: UserTypes.CLIENT,
                    clientStatus: ClientStatus.ACTIVE,
                    convertedToClientBy: creatorAdmin.adminId,
                    convertedToClientAt: new Date(),
                    clientCreationReason: creationReason
                }
            },
            {
                new: true,          // Returns the updated document
                upsert: true,       // Creates it if SYNC_USER hasn't fired yet
                runValidators: true // Runs your schema validators
            }
        );

        logWithTime(`✅ Client created in DB: ${newClient.userId}`);

        // Prepare audit data (creation: oldData is null)
        const { oldData, newData } = prepareAuditData(null, newClient);

        // Create client in Software Management Service (fire and forget - we don't want to fail the whole process if this fails)
        createClientInSoftwareManagementService(newClient, firstName, role, orgIds);

        // Log activity
        logActivityTrackerEvent(
            creatorAdmin,
            device,
            requestId,
            ACTIVITY_TRACKER_EVENTS.CREATE_CLIENT,
            `Created client ${newClient.userId}`,
            {
                oldData,
                newData,
                adminActions: {
                    targetId: newClient._id,
                    reason: creationReason,
                    reasonDescription: reasonDescription || undefined,
                    performedOn: DB_COLLECTIONS.USERS
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

module.exports = { 
    createClientService,
    createClientInSoftwareManagementService
};