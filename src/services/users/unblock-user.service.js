const { UserModel } = require("@models/user.model");
const { logWithTime } = require("@utils/time-stamps.util");
const { logActivityTrackerEvent } = require("@/services/audit/activity-tracker.service");
const { ACTIVITY_TRACKER_EVENTS } = require("@configs/tracker.config");
const { AdminErrorTypes } = require("@configs/enums.config");
const { DB_COLLECTIONS } = require("@/configs/db-collections.config");
const { prepareAuditData, cloneForAudit } = require("@/utils/audit-data.util");
const { errorMessage } = require("@/utils/log-error.util");
const { createInternalServiceClient } = require("@/utils/internal-service-client.util");
const { getServiceToken } = require("@/internals/service-token");
const { AUTH_SERVICE_URIS } = require("@/configs/internal-uri.config");
const { INTERNAL_API, SERVICE_NAMES } = require("@/internals/constants");

/**
 * Unblock User Service
 * 
 * Unblocks a previously blocked user account
 * Sets isBlocked: false and tracks unblocking reason
 * 
 * @param {Object} updaterAdmin - The admin performing the unblock operation
 * @param {Object} targetUser - The user being unblocked
 * @param {string} unblockReason - Reason for unblocking
 * @param {string} reasonDescription - Optional additional description
 * @param {Object} device - Device object
 * @param {string} requestId - Request ID for tracking
 * @returns {Promise<{success: boolean, data?: Object, type?: string, message?: string}>}
 */
const unblockUserService = async (updaterAdmin, targetUser, unblockReason, reasonDescription = null, device, requestId) => {
    try {
        const userId = targetUser.userId;
        logWithTime(`🔄 Unblocking user: ${userId}...`);

        // Call Custom Auth Service to internal unblock-user API
        logWithTime(`🔄 Calling Custom Auth Service to unblock user...`);
        const serviceToken = await getServiceToken(SERVICE_NAMES.ADMIN_PANEL_SERVICE);
        const authClient = createInternalServiceClient(
            INTERNAL_API.CUSTOM_AUTH_SERVICE_URL,
            serviceToken,
            SERVICE_NAMES.AUTH_SERVICE,
            INTERNAL_API.TIMEOUT,
            INTERNAL_API.RETRY_ATTEMPTS,
            INTERNAL_API.RETRY_DELAY
        );

        const authResult = await authClient.callService({
            method: AUTH_SERVICE_URIS.UNBLOCK_USER.method,
            uri: AUTH_SERVICE_URIS.UNBLOCK_USER.uri,
            body: {
                userId,
                adminId: updaterAdmin.adminId
            }
        });

        if (!authResult.success) {
            logWithTime(`❌ Custom Auth Service failed to unblock user: ${authResult.error}`);
            return {
                success: false,
                type: AdminErrorTypes.INVALID_DATA,
                message: authResult.error || "Failed to unblock user in Custom Auth Service"
            };
        }

        logWithTime(`✅ User unblocked in Custom Auth Service: ${userId}`);

        // Clone old data for audit
        const oldUserClone = cloneForAudit(targetUser);

        // Check if not blocked
        if (!targetUser.isBlocked) {
            logWithTime(`ℹ️ User is not blocked: ${userId}`);
            return {
                success: false,
                type: AdminErrorTypes.ALREADY_UNBLOCKED,
                message: "User is not currently blocked"
            };
        }

        // Unblock the user
        const unblockedUser = await UserModel.findByIdAndUpdate(
            targetUser._id,
            {
                isBlocked: false,
                unblockedAt: new Date(),
                unblockedBy: updaterAdmin.adminId,
                unblockReason: unblockReason
            },
            { returnDocument: 'after' }
        );

        if (!unblockedUser) {
            logWithTime(`❌ Failed to unblock user: ${userId}`);
            return {
                success: false,
                type: AdminErrorTypes.NOT_FOUND,
                message: "User not found"
            };
        }

        logWithTime(`✅ User unblocked successfully: ${userId}`);

        // Prepare audit data
        const { oldData, newData } = prepareAuditData(oldUserClone, unblockedUser);

        // Log activity
        logActivityTrackerEvent(
            updaterAdmin,
            device,
            requestId,
            ACTIVITY_TRACKER_EVENTS.UNBLOCK_USER,
            `Unblocked user ${userId}`,
            {
                oldData,
                newData,
                adminActions: {
                    targetId: targetUser._id,
                    reason: unblockReason,
                    reasonDescription: reasonDescription || null,
                    performedOn: DB_COLLECTIONS.USERS
                }
            }
        );

        return {
            success: true,
            data: unblockedUser
        };

    } catch (error) {
        logWithTime(`❌ Unblock user service error: ${error.message}`);
        errorMessage(error);
        
        return {
            success: false,
            type: AdminErrorTypes.INVALID_DATA,
            message: error.message
        };
    }
};

module.exports = { unblockUserService };
