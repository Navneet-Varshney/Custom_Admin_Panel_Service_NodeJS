const { DeviceModel } = require("@models/device.model");
const { logWithTime } = require("@utils/time-stamps.util");
const { logActivityTrackerEvent } = require("@/services/audit/activity-tracker.service");
const { ACTIVITY_TRACKER_EVENTS } = require("@configs/tracker.config");
const { AdminErrorTypes } = require("@configs/enums.config");
const { DB_COLLECTIONS } = require("@/configs/db-collections.config");
const { prepareAuditData, cloneForAudit } = require("@/utils/audit-data.util");
const { errorMessage } = require("@/utils/log-error.util");

const blockDeviceService = async (
    updaterAdmin,
    deviceUUID,
    blockReason,
    reasonDescription = null,
    device,
    requestId
) => {
    try {
        logWithTime(`🔄 Blocking device: ${deviceUUID}...`);

        const currentDeviceUUID = device.deviceUUID;

        // ❌ Prevent self-block
        if (deviceUUID === currentDeviceUUID) {
            return {
                success: false,
                type: AdminErrorTypes.CONFLICT,
                message: "You cannot block your current device. Please use another device."
            };
        }

        // ✅ STEP 1: Find or Create device
        let targetDevice = await DeviceModel.findOne({ deviceUUID });

        if (!targetDevice) {
            logWithTime(`ℹ️ Device not found. Creating new device: ${deviceUUID}`);

            targetDevice = await DeviceModel.create({
                deviceUUID,
                deviceType: "UNKNOWN",
                deviceName: "Unknown Device"
            });

            logActivityTrackerEvent(
                updaterAdmin,
                device,
                requestId,
                ACTIVITY_TRACKER_EVENTS.CREATE_USER_DEVICE,
                `Created device ${deviceUUID} during block operation`,
                {
                    oldData: null,
                    newData: targetDevice.toObject(),
                    adminActions: {
                        targetId: targetDevice._id,
                        performedOn: DB_COLLECTIONS.DEVICES,
                        reason: "Device created during block operation"
                    }
                }
            );
        } else {
            logWithTime(`✅ Device found: ${deviceUUID}`);
        }

        // Clone old data
        const oldDeviceClone = cloneForAudit(targetDevice);

        // ❌ Already blocked
        if (targetDevice.isBlocked) {
            return {
                success: false,
                type: AdminErrorTypes.ALREADY_BLOCKED,
                message: "Device is already blocked"
            };
        }

        // ✅ STEP 2: Block device
        const blockedDevice = await DeviceModel.findByIdAndUpdate(
            targetDevice._id,
            {
                isBlocked: true,
                blockedAt: new Date(),
                blockedBy: updaterAdmin.adminId,
                blockReason,
                blockReasonDetails: reasonDescription,
                $inc: { blockCount: 1 }
            },
            { returnDocument: "after" } // 🔥 Mongoose warning fix
        );

        if (!blockedDevice) {
            return {
                success: false,
                type: AdminErrorTypes.NOT_FOUND,
                message: "Device not found"
            };
        }

        logWithTime(`✅ Device blocked successfully: ${deviceUUID}`);

        // Prepare audit
        const { oldData, newData } = prepareAuditData(oldDeviceClone, blockedDevice);

        // Log activity
        logActivityTrackerEvent(
            updaterAdmin,
            device,
            requestId,
            ACTIVITY_TRACKER_EVENTS.BLOCK_USER_DEVICE,
            `Blocked device ${deviceUUID}`,
            {
                oldData,
                newData,
                adminActions: {
                    targetId: blockedDevice._id,
                    performedOn: DB_COLLECTIONS.DEVICES,
                    reason: blockReason,
                    reasonDescription
                }
            }
        );

        return {
            success: true,
            data: blockedDevice
        };

    } catch (error) {
        logWithTime(`❌ Block device service error: ${error.message}`);
        errorMessage(error);

        return {
            success: false,
            type: AdminErrorTypes.INVALID_DATA,
            message: error.message
        };
    }
};

module.exports = { blockDeviceService };