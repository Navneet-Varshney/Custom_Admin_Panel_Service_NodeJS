const { AdminModel } = require("@models/admin.model");
const { logWithTime } = require("@utils/time-stamps.util");
const { logActivityTrackerEvent } = require("@/services/audit/activity-tracker.service");
const { ACTIVITY_TRACKER_EVENTS } = require("@configs/tracker.config");
const { AdminErrorTypes, AdminTypes } = require("@configs/enums.config");
const { DB_COLLECTIONS } = require("@/configs/db-collections.config");
const { prepareAuditData, cloneForAudit } = require("@/utils/audit-data.util");
const { errorMessage } = require("@/utils/log-error.util");

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
