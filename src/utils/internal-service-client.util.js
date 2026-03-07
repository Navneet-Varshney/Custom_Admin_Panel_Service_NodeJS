/**
 * Internal Service Client Utility
 * 
 * Reusable axios-based client for internal microservice communication.
 * Provides a generic interface for making authenticated API calls to internal services.
 * Includes automatic retry mechanism for failed requests.
 * 
 * @author Admin Panel Service Team
 * @date 2026-03-06
 */

const axios = require("axios");
const { v4: uuidv4 } = require("uuid");
const { logWithTime } = require("@/utils/time-stamps.util");
const { device } = require("@/configs/security.config");

/**
 * Creates a reusable internal service client with service authentication
 * 
 * @param {string} baseURL - Base URL of the microservice
 * @param {string} serviceToken - Service authentication token
 * @param {string} serviceName - Name of the calling service
 * @param {number} timeout - Request timeout in milliseconds (default: 5000)
 * @param {number} retryAttempts - Number of retry attempts for failed requests (default: 3)
 * @param {number} retryDelay - Delay between retry attempts in milliseconds (default: 1000)
 * @returns {Object} Client object with callService method
 */
function createInternalServiceClient(
  baseURL, 
  serviceToken, 
  serviceName, 
  timeout = 5000,
  retryAttempts = 3,
  retryDelay = 1000
) {
  
  const instance = axios.create({
    baseURL,
    timeout,
    headers: {
      "x-service-token": serviceToken,
      "x-service-name": serviceName,
      "Content-Type": "application/json",
      "x-device-uuid": device.DEVICE_UUID,
      "x-device-type": device.DEVICE_TYPE,
      "x-device-name": device.DEVICE_NAME
    }
  });

  /**
   * Retry logic for failed requests
   * @param {Function} requestFn - The request function to retry
   * @param {number} maxRetries - Maximum number of retry attempts
   * @returns {Promise<any>} Response from successful request
   */
  const retryRequest = async (requestFn, maxRetries) => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await requestFn();
      } catch (error) {
        if (attempt === maxRetries) {
          // Last attempt failed, throw error
          throw error;
        }
        
        logWithTime(`⚠️  Request failed (attempt ${attempt}/${maxRetries}). Retrying in ${retryDelay}ms...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    }
  };

  /**
   * Makes an API call to the internal service with automatic retry
   * 
   * @param {Object} config - Request configuration
   * @param {string} config.method - HTTP method (GET, POST, PUT, DELETE, etc.)
   * @param {string} config.uri - API endpoint URI
   * @param {Object} [config.body] - Request body data
   * @param {Object} [config.query] - URL query parameters
   * @param {Object} [config.headers] - Additional headers
   * @param {number} [config.retries] - Override default retry attempts for this request
   * @returns {Promise<Object>} Response object { success: boolean, data?: any, error?: string }
   */
  const callService = async ({
    method = "GET",
    uri,
    body = {},
    query = {},
    headers = {},
    retries
  }) => {
    const maxRetries = retries !== undefined ? retries : retryAttempts;

    try {
      const response = await retryRequest(async () => {
        // Add unique request ID for tracing
        const requestId = uuidv4();
        
        return await instance({
          method,
          url: uri,
          data: body,
          params: query,
          headers: {
            "x-request-id": requestId,
            ...headers
          }
        });
      }, maxRetries);

      logWithTime(`✅ [${method}] ${uri} - Success`);
      
      return {
        success: true,
        data: response.data
      };

    } catch (err) {
      logWithTime(`❌ [${method}] ${uri} - Failed after ${maxRetries} attempts: ${err.message}`);
      
      // Handle different error scenarios
      if (err.response) {
        // Server responded with error status
        return {
          success: false,
          error: err.response.data || err.message,
          statusCode: err.response.status
        };
      } else if (err.request) {
        // Request made but no response received
        return {
          success: false,
          error: "Service is not reachable",
          message: err.message
        };
      } else {
        // Error in setting up the request
        return {
          success: false,
          error: err.message
        };
      }
    }
  };

  return { callService };
}

module.exports = { createInternalServiceClient };
