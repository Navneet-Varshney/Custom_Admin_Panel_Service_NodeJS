const jwt = require("jsonwebtoken");
const { SERVICE_TOKEN_SECRET, ALLOWED_SERVICE_NAMES } = require("@configs/security.config");
const { logWithTime } = require("@utils/time-stamps.util");

/**
 * Verifies a service token's JWT signature and structure
 * @param {string} token - The JWT token to verify
 * @returns {Object} { success: boolean, decoded: Object|null, error: string|null }
 */
const verifyServiceToken = (token) => {
  try {
    if (!token || token.trim() === "") {
      return {
        success: false,
        decoded: null,
        error: "Service token is missing or empty"
      };
    }

    // Verify JWT signature and decode
    const decoded = jwt.verify(token, SERVICE_TOKEN_SECRET, {
      algorithms: ["HS256"]
    });

    // Validate token type
    if (decoded.type !== "service-token") {
      return {
        success: false,
        decoded: null,
        error: "Invalid token type. Expected 'service-token'"
      };
    }

    // Validate required fields
    if (!decoded.serviceName || !decoded.serviceInstanceId) {
      return {
        success: false,
        decoded: null,
        error: "Token missing required fields (serviceName, serviceInstanceId)"
      };
    }

    logWithTime(`✅ Service token verified: ${decoded.serviceName} (${decoded.serviceInstanceId})`);

    return {
      success: true,
      decoded: decoded,
      error: null
    };

  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return {
        success: false,
        decoded: null,
        error: "Service token has expired"
      };
    }

    if (err.name === "JsonWebTokenError") {
      return {
        success: false,
        decoded: null,
        error: "Invalid service token signature or format"
      };
    }

    logWithTime(`❌ Service token verification error: ${err.message}`);
    return {
      success: false,
      decoded: null,
      error: "Service token verification failed"
    };
  }
};

/**
 * Validates if the service name is in the allowed list
 * @param {string} serviceName - The service name from token
 * @param {Array<string>} allowedServices - Optional list of allowed services (overrides global config)
 * @returns {Object} { isValid: boolean, error: string|null }
 */
const validateServiceName = (serviceName, allowedServices = null) => {
  const serviceList = allowedServices || ALLOWED_SERVICE_NAMES;

  // If no allowed services configured, allow all
  if (!serviceList || serviceList.length === 0) {
    return { isValid: true, error: null };
  }

  if (!serviceList.includes(serviceName)) {
    return {
      isValid: false,
      error: `Service '${serviceName}' is not in the allowed services list`
    };
  }

  return { isValid: true, error: null };
};

/**
 * Combined verification: Verifies token AND validates service name
 * @param {string} token - The JWT token to verify
 * @param {Array<string>} allowedServices - Optional list of allowed services
 * @returns {Object} { success: boolean, decoded: Object|null, error: string|null }
 */
const verifyAndValidateServiceToken = (token, allowedServices = null) => {
  // Step 1: Verify token
  const verificationResult = verifyServiceToken(token);

  if (!verificationResult.success) {
    return verificationResult;
  }

  // Step 2: Validate service name
  const validationResult = validateServiceName(
    verificationResult.decoded.serviceName,
    allowedServices
  );

  if (!validationResult.isValid) {
    return {
      success: false,
      decoded: null,
      error: validationResult.error
    };
  }

  return verificationResult;
};

module.exports = {
  verifyServiceToken,
  validateServiceName,
  verifyAndValidateServiceToken
};
