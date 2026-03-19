const { AdminModel } = require("@models/admin.model");
const { logWithTime } = require("@utils/time-stamps.util");
const { logActivityTrackerEvent } = require("@/services/audit/activity-tracker.service");
const { ACTIVITY_TRACKER_EVENTS } = require("@configs/tracker.config");
const { AdminErrorTypes, AdminTypes } = require("@configs/enums.config");
const { DB_COLLECTIONS } = require("@/configs/db-collections.config");
const { prepareAuditData, cloneForAudit } = require("@/utils/audit-data.util");
const { errorMessage } = require("@/utils/log-error.util");

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
