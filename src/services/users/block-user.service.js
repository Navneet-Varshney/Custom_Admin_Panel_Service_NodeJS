const { UserModel } = require("@models/user.model");
const { logWithTime } = require("@utils/time-stamps.util");
const { logActivityTrackerEvent } = require("@/services/audit/activity-tracker.service");
const { ACTIVITY_TRACKER_EVENTS } = require("@configs/tracker.config");
const { AdminErrorTypes, UserTypes } = require("@configs/enums.config");
const { DB_COLLECTIONS } = require("@/configs/db-collections.config");
const { prepareAuditData, cloneForAudit } = require("@/utils/audit-data.util");
const { errorMessage } = require("@/utils/log-error.util");
const { ALLOW_CLIENT_BLOCKING } = require("@configs/security.config");

/**
 * Block User Service
 * 
 * Blocks a user account preventing login and access
 * Sets isBlocked: true and tracks blocking reason
 * 
 * @param {Object} updaterAdmin - The admin performing the block operation
 * @param {Object} targetUser - The user being blocked
 * @param {string} blockReason - Reason for blocking
 * @param {string} reasonDescription - Optional additional description
 * @param {Object} device - Device object
 * @param {string} requestId - Request ID for tracking
 * @returns {Promise<{success: boolean, data?: Object, type?: string, message?: string}>}
 */
const blockUserService = async (updaterAdmin, targetUser, blockReason, reasonDescription = null, device, requestId) => {
    try {
        const userId = targetUser.userId;
        logWithTime(`🔄 Blocking user: ${userId}...`);

        // Prevent blocking CLIENT if not allowed
        if (targetUser.userType === UserTypes.CLIENT && !ALLOW_CLIENT_BLOCKING) {
            logWithTime(`❌ Cannot block CLIENT user: ${userId} - Client blocking not allowed`);
            return {
                success: false,
                type: AdminErrorTypes.UNAUTHORIZED,
                message: "This user is a CLIENT. Please convert to USER first before blocking"
            };
        }

        // Clone old data for audit
        const oldUserClone = cloneForAudit(targetUser);

        // Check if already blocked
        if (targetUser.isBlocked) {
            logWithTime(`ℹ️ User already blocked: ${userId}`);
            return {
                success: false,
                type: AdminErrorTypes.ALREADY_BLOCKED,
                message: "User is already blocked"
            };
        }

        // Block the user
        const blockedUser = await UserModel.findByIdAndUpdate(
            targetUser._id,
            {
                isBlocked: true,
                blockedAt: new Date(),
                blockedBy: updaterAdmin.adminId,
                blockReason: blockReason,
                $inc: { blockCount: 1 }
            },
            { returnDocument: 'after' }
        );

        if (!blockedUser) {
            logWithTime(`❌ Failed to block user: ${userId}`);
            return {
                success: false,
                type: AdminErrorTypes.NOT_FOUND,
                message: "User not found"
            };
        }

        logWithTime(`✅ User blocked successfully: ${userId}`);

        // Prepare audit data
        const { oldData, newData } = prepareAuditData(oldUserClone, blockedUser);

        // Log activity
        logActivityTrackerEvent(
            updaterAdmin,
            device,
            requestId,
            ACTIVITY_TRACKER_EVENTS.BLOCK_USER,
            `Blocked user ${userId}`,
            {
                oldData,
                newData,
                adminActions: {
                    targetId: targetUser._id,
                    reason: blockReason,
                    reasonDescription: reasonDescription || null,
                    performedOn: DB_COLLECTIONS.USERS
                }
            }
        );

        return {
            success: true,
            data: blockedUser
        };

    } catch (error) {
        logWithTime(`❌ Block user service error: ${error.message}`);
        errorMessage(error);
        
        return {
            success: false,
            type: AdminErrorTypes.INVALID_DATA,
            message: error.message
        };
    }
};

module.exports = { blockUserService };
