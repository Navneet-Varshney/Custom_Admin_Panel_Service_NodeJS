const { UserModel } = require("@models/user.model");
const { logWithTime } = require("@utils/time-stamps.util");
const { logActivityTrackerEvent } = require("@/services/audit/activity-tracker.service");
const { ACTIVITY_TRACKER_EVENTS } = require("@configs/tracker.config");
const { AdminErrorTypes } = require("@configs/enums.config");
const { DB_COLLECTIONS } = require("@/configs/db-collections.config");
const { prepareAuditData, cloneForAudit } = require("@/utils/audit-data.util");
const { errorMessage } = require("@/utils/log-error.util");

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
