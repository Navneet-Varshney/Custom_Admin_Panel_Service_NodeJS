const { DeviceModel } = require("@models/device.model");
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
const { toggleBlockDeviceStatus } = require("@/internals/internal-client/software-management.client");

const blockDeviceService = async (
    updaterAdmin,
    deviceUUID,
    blockReason,
    reasonDescription = null,
    device,
    requestId
) => {
    try {

        const currentDeviceUUID = device.deviceUUID;

        // ❌ Prevent self-block
        if (deviceUUID === currentDeviceUUID) {
            return {
                success: false,
                type: AdminErrorTypes.CONFLICT,
                message: "You cannot block your current device. Please use another device."
            };
        }

        // Call Custom Auth Service's internal block-device API
        logWithTime(`🔄 Calling Custom Auth Service to block device...`);
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
            method: AUTH_SERVICE_URIS.BLOCK_DEVICE.method,
            uri: AUTH_SERVICE_URIS.BLOCK_DEVICE.uri,
            body: {
                deviceUUID,
                adminId: updaterAdmin.adminId
            }
        });

        if (!authResult.success) {
            logWithTime(`❌ Custom Auth Service failed to block device: ${authResult.error}`);
            return {
                success: false,
                type: AdminErrorTypes.INVALID_DATA,
                message: authResult.error || "Failed to block device in Custom Auth Service"
            };
        }

        logWithTime(`✅ Device blocked in Custom Auth Service: ${deviceUUID}`);

        logWithTime(`🔄 Blocking device: ${deviceUUID}...`);

        // ✅ STEP 1: Find or Create device
        let targetDevice = await DeviceModel.findOne({ deviceUUID });

        if (!targetDevice) {
            logWithTime(`ℹ️  Device not found. Creating new device: ${deviceUUID}`);

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

        // Fire-and-forget: Notify Software Management Service
        toggleBlockDeviceStatus(deviceUUID, updaterAdmin.adminId, true, requestId);

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