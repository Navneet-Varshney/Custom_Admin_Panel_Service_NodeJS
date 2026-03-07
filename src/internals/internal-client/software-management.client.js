/**
 * Software Management Service Client
 * 
 * Internal API client for communicating with Software Management Service.
 * Handles license management, software registration, and related operations.
 * 
 * @author Admin Panel Service Team
 * @date 2026-03-06
 */

const guard = require('../microservice.guard');
if (!guard) {
    module.exports = null;
    return;
}

const { getServiceToken } = require('../service-token');
const { INTERNAL_API, SERVICE_NAMES } = require('../constants');
const { logWithTime } = require('@/utils/time-stamps.util');
const { createInternalServiceClient } = require('@/utils/internal-service-client.util');
const { SOFTWARE_MANAGEMENT_URIS } = require('@/configs/internal-uri.config');

/**
 * Get authenticated Software Management Service client
 * @returns {Promise<Object>} Client with callService method
 */
const getSoftwareManagementClient = async () => {
    const serviceToken = await getServiceToken(SERVICE_NAMES.ADMIN_PANEL_SERVICE);
    
    return createInternalServiceClient(
        INTERNAL_API.SOFTWARE_MANAGEMENT_BASE_URL,
        serviceToken,
        SERVICE_NAMES.ADMIN_PANEL_SERVICE,
        INTERNAL_API.TIMEOUT,
        INTERNAL_API.RETRY_ATTEMPTS,
        INTERNAL_API.RETRY_DELAY
    );
};

/**
 * Health check for Software Management Service
 * 
 * @returns {Promise<Object>} Health status response
 */
const healthCheck = async () => {
    try {
        logWithTime('🏥 Checking Software Management Service health...');
        
        const client = await getSoftwareManagementClient();
        const result = await client.callService({
            method: SOFTWARE_MANAGEMENT_URIS.HEALTH_CHECK.method,
            uri: SOFTWARE_MANAGEMENT_URIS.HEALTH_CHECK.uri
        });

        if (result.success && result.data?.success === true) {
            logWithTime('✅ Software Management Service is live');
            return {
                success: true,
                data: result.data
            };
        } else {
            logWithTime('⚠️  Software Management Service responded but status is not healthy');
            return {
                success: false,
                error: result.error || 'Service not healthy'
            };
        }
    } catch (error) {
        logWithTime(`❌ Software Management Service health check failed: ${error.message}`);
        return {
            success: false,
            error: error.message
        };
    }
};

module.exports = {
    healthCheck
};