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

/**
 * Unblock Device Service
 * 
 * Unblocks a previously blocked device
 * Sets isBlocked: false and tracks unblocking reason
 * Device must exist to be unblocked
 * 
 * @param {Object} updaterAdmin - The admin performing the unblock operation
 * @param {string} deviceUUID - The device UUID to unblock
 * @param {string} unblockReason - Reason for unblocking
 * @param {string} reasonDescription - Optional additional description
 * @param {Object} device - Device object
 * @param {string} requestId - Request ID for tracking
 * @returns {Promise<{success: boolean, data?: Object, type?: string, message?: string}>}
 */
const unblockDeviceService = async (
  updaterAdmin,
  deviceUUID,
  unblockReason,
  reasonDescription = null,
  device,
  requestId
) => {
  try {
    logWithTime(`🔄 Unblocking device: ${deviceUUID}...`);

    // Call Custom Auth Service's internal unblock-device API
    logWithTime(`🔄 Calling Custom Auth Service to unblock device...`);
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
        method: AUTH_SERVICE_URIS.UNBLOCK_DEVICE.method,
        uri: AUTH_SERVICE_URIS.UNBLOCK_DEVICE.uri,
        body: {
            deviceUUID,
            adminId: updaterAdmin.adminId,
        }
    });

    if (!authResult.success) {
        logWithTime(`❌ Custom Auth Service failed to unblock device: ${authResult.error}`);
        return {
            success: false,
            type: AdminErrorTypes.INVALID_DATA,
            message: authResult.error || "Failed to unblock device in Custom Auth Service"
        };
    }

    logWithTime(`✅ Device unblocked in Custom Auth Service: ${deviceUUID}`);

    // ✅ STEP 1: Find device (NO creation here)
    const targetDevice = await DeviceModel.findOne({ deviceUUID });

    if (!targetDevice) {
      logWithTime(`❌ Device not found: ${deviceUUID}`);
      return {
        success: false,
        type: AdminErrorTypes.NOT_FOUND,
        message: "Device not found"
      };
    }

    logWithTime(`✅ Device found: ${deviceUUID}`);

    // Clone old data
    const oldDeviceClone = cloneForAudit(targetDevice);

    // ❌ Already unblocked
    if (!targetDevice.isBlocked) {
      return {
        success: false,
        type: AdminErrorTypes.ALREADY_UNBLOCKED,
        message: "Device is not currently blocked"
      };
    }

    // ✅ STEP 2: Unblock device
    const unblockedDevice = await DeviceModel.findByIdAndUpdate(
      targetDevice._id,
      {
        isBlocked: false,
        unblockedAt: new Date(),
        unblockedBy: updaterAdmin.adminId,
        unblockReason,
        unblockReasonDetails: reasonDescription || null
      },
      { returnDocument: "after" } // 🔥 fix warning
    );

    if (!unblockedDevice) {
      return {
        success: false,
        type: AdminErrorTypes.NOT_FOUND,
        message: "Device not found"
      };
    }

    logWithTime(`✅ Device unblocked successfully: ${deviceUUID}`);

    // Prepare audit
    const { oldData, newData } = prepareAuditData(oldDeviceClone, unblockedDevice);

    // Log activity
    logActivityTrackerEvent(
      updaterAdmin,
      device,
      requestId,
      ACTIVITY_TRACKER_EVENTS.UNBLOCK_USER_DEVICE,
      `Unblocked device ${deviceUUID} by ${updaterAdmin.adminId}`,
      {
        oldData,
        newData,
        adminActions: {
          targetId: unblockedDevice._id,
          performedOn: DB_COLLECTIONS.DEVICES,
          reason: unblockReason,
          reasonDescription: reasonDescription || null
        }
      }
    );

    return {
      success: true,
      data: unblockedDevice
    };

  } catch (error) {
    logWithTime(`❌ Unblock device service error: ${error.message}`);
    errorMessage(error);

    return {
      success: false,
      type: AdminErrorTypes.INVALID_DATA,
      message: error.message
    };
  }
};

module.exports = { unblockDeviceService };
