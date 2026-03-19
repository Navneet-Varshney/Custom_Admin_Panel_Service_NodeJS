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
 * Block Admin Service
 * 
 * Blocks an admin account preventing login and access
 * Sets isBlocked: true and tracks blocking reason
 * 
 * @param {Object} updaterAdmin - The admin performing the block operation
 * @param {Object} targetAdmin - The admin being blocked
 * @param {string} blockReason - Reason for blocking
 * @param {string} reasonDescription - Optional additional description
 * @param {Object} device - Device object
 * @param {string} requestId - Request ID for tracking
 * @returns {Promise<{success: boolean, data?: Object, type?: string, message?: string}>}
 */
const blockAdminService = async (updaterAdmin, targetAdmin, blockReason, reasonDescription = null, device, requestId) => {
    try {
        const adminId = targetAdmin.adminId;
        // Call Custom Auth Service's internal block-user API
        logWithTime(`🔄 Calling Custom Auth Service to block user...`);
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
            method: AUTH_SERVICE_URIS.BLOCK_USER.method,
            uri: AUTH_SERVICE_URIS.BLOCK_USER.uri,
            body: {
                userId: targetAdmin.adminId,
                adminId: updaterAdmin.adminId
            }
        });

        if (!authResult.success) {
            logWithTime(`❌ Custom Auth Service failed to block user: ${authResult.error}`);
            return {
                success: false,
                type: AdminErrorTypes.INVALID_DATA,
                message: authResult.error || "Failed to block user in Custom Auth Service"
            };
        }

        logWithTime(`✅ User blocked in Custom Auth Service: ${targetAdmin.adminId}`);

        logWithTime(`🔄 Blocking admin: ${adminId}...`);

        // Prevent blocking SUPER_ADMIN
        if (targetAdmin.adminType === AdminTypes.SUPER_ADMIN) {
            logWithTime(`❌ Cannot block SUPER_ADMIN: ${adminId}`);
            return {
                success: false,
                type: AdminErrorTypes.UNAUTHORIZED,
                message: "SUPER_ADMIN cannot be blocked"
            };
        }

        // Clone old data for audit
        const oldAdminClone = cloneForAudit(targetAdmin);

        // Check if already blocked
        if (targetAdmin.isBlocked) {
            logWithTime(`ℹ️ Admin already blocked: ${adminId}`);
            return {
                success: false,
                type: AdminErrorTypes.INVALID_DATA,
                message: "Admin is already blocked"
            };
        }

        // Block the admin
        const blockedAdmin = await AdminModel.findByIdAndUpdate(
            targetAdmin._id,
            {
                isBlocked: true,
                blockedAt: new Date(),
                blockedBy: updaterAdmin.adminId,
                lastBlockReason: blockReason,
                $inc: { blockCount: 1 }
            },
            { returnDocument: 'after' }
        );

        if (!blockedAdmin) {
            logWithTime(`❌ Failed to block admin: ${adminId}`);
            return {
                success: false,
                type: AdminErrorTypes.NOT_FOUND,
                message: "Admin not found"
            };
        }

        logWithTime(`✅ Admin blocked successfully: ${adminId}`);

        // Prepare audit data
        const { oldData, newData } = prepareAuditData(oldAdminClone, blockedAdmin);

        // Log activity
        logActivityTrackerEvent(
            updaterAdmin,
            device,
            requestId,
            ACTIVITY_TRACKER_EVENTS.BLOCK_ADMIN,
            `Blocked admin ${adminId}`,
            {
                oldData,
                newData,
                adminActions: {
                    targetId: targetAdmin._id,
                    reason: blockReason,
                    reasonDescription: reasonDescription || null,
                    performedOn: DB_COLLECTIONS.ADMINS
                }
            }
        );

        return {
            success: true,
            data: blockedAdmin
        };

    } catch (error) {
        logWithTime(`❌ Block admin service error: ${error.message}`);
        errorMessage(error);
        
        return {
            success: false,
            type: AdminErrorTypes.INVALID_DATA,
            message: error.message
        };
    }
};

module.exports = { blockAdminService };
