const { AdminModel } = require("@models/admin.model");
const { logWithTime } = require("@utils/time-stamps.util");
const { logActivityTrackerEvent } = require("@/services/audit/activity-tracker.service");
const { ACTIVITY_TRACKER_EVENTS } = require("@configs/tracker.config");
const { AdminErrorTypes, AdminTypes } = require("@configs/enums.config");
const { DB_COLLECTIONS } = require("@/configs/db-collections.config");
const { prepareAuditData, cloneForAudit } = require("@/utils/audit-data.util");
const { errorMessage } = require("@/utils/log-error.util");
const { createInternalServiceClient } = require("@/utils/internal-service-client.util");
const { getServiceToken } = require("@/internals/service-token");
const { AUTH_SERVICE_URIS } = require("@/configs/internal-uri.config");
const { INTERNAL_API, SERVICE_NAMES } = require("@/internals/constants");

/**
 * Unblock Admin Service
 * 
 * Unblocks a previously blocked admin account
 * Sets isBlocked: false and tracks unblocking reason
 * 
 * @param {Object} updaterAdmin - The admin performing the unblock operation
 * @param {Object} targetAdmin - The admin being unblocked
 * @param {string} unblockReason - Reason for unblocking
 * @param {string} reasonDescription - Optional additional description
 * @param {Object} device - Device object
 * @param {string} requestId - Request ID for tracking
 * @returns {Promise<{success: boolean, data?: Object, type?: string, message?: string}>}
 */
const unblockAdminService = async (updaterAdmin, targetAdmin, unblockReason, reasonDescription = null, device, requestId) => {
    try {
        const adminId = targetAdmin.adminId;

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
                userId: targetAdmin.adminId,
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

        logWithTime(`✅ User unblocked in Custom Auth Service: ${targetAdmin.adminId}`);

        logWithTime(`🔄 Unblocking admin: ${adminId}...`);

        // Prevent unblocking SUPER_ADMIN
        if (targetAdmin.adminType === AdminTypes.SUPER_ADMIN) {
            logWithTime(`❌ Cannot unblock SUPER_ADMIN: ${adminId}`);
            return {
                success: false,
                type: AdminErrorTypes.UNAUTHORIZED,
                message: "SUPER_ADMIN cannot be unblocked"
            };
        }

        // Clone old data for audit
        const oldAdminClone = cloneForAudit(targetAdmin);

        // Check if not blocked
        if (!targetAdmin.isBlocked) {
            logWithTime(`ℹ️ Admin is not blocked: ${adminId}`);
            return {
                success: false,
                type: AdminErrorTypes.INVALID_DATA,
                message: "Admin is not currently blocked"
            };
        }

        // Unblock the admin
        const unblockedAdmin = await AdminModel.findByIdAndUpdate(
            targetAdmin._id,
            {
                isBlocked: false,
                unblockedAt: new Date(),
                unblockedBy: updaterAdmin.adminId,
                lastUnblockReason: unblockReason
            },
            { returnDocument: 'after' }
        );

        if (!unblockedAdmin) {
            logWithTime(`❌ Failed to unblock admin: ${adminId}`);
            return {
                success: false,
                type: AdminErrorTypes.NOT_FOUND,
                message: "Admin not found"
            };
        }

        logWithTime(`✅ Admin unblocked successfully: ${adminId}`);

        // Prepare audit data
        const { oldData, newData } = prepareAuditData(oldAdminClone, unblockedAdmin);

        // Log activity
        logActivityTrackerEvent(
            updaterAdmin,
            device,
            requestId,
            ACTIVITY_TRACKER_EVENTS.UNBLOCK_ADMIN,
            `Unblocked admin ${adminId}`,
            {
                oldData,
                newData,
                adminActions: {
                    targetId: targetAdmin._id,
                    reason: unblockReason,
                    reasonDescription: reasonDescription || null,
                    performedOn: DB_COLLECTIONS.ADMINS
                }
            }
        );

        return {
            success: true,
            data: unblockedAdmin
        };

    } catch (error) {
        logWithTime(`❌ Unblock admin service error: ${error.message}`);
        errorMessage(error);
        
        return {
            success: false,
            type: AdminErrorTypes.INVALID_DATA,
            message: error.message
        };
    }
};

module.exports = { unblockAdminService };
