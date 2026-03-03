/**
 * Example Internal Routes
 * 
 * These routes are protected by service token authentication
 * Only other microservices with valid service tokens can access these endpoints
 */

const express = require("express");
const { verifyServiceToken, restrictToServices, isFromService } = require("@middlewares/internals/verify-service-token.middleware");
const { OK } = require("@configs/http-status.config");

const router = express.Router();

/**
 * @route   GET /internal/health
 * @desc    Health check for internal services (allows all services)
 * @access  Internal (any authenticated service)
 */
router.get("/health", verifyServiceToken(), (req, res) => {
  res.status(OK).json({
    success: true,
    message: "Internal service is healthy",
    requestedBy: {
      serviceName: req.serviceAuth.serviceName,
      serviceInstanceId: req.serviceAuth.serviceInstanceId
    }
  });
});

/**
 * @route   POST /internal/sync-admins
 * @desc    Sync admin data (only for auth-service)
 * @access  Internal (auth-service only)
 */
router.post("/sync-admins", restrictToServices(["auth-service"]), (req, res) => {
  // Your sync logic here
  res.status(OK).json({
    success: true,
    message: "Admin sync initiated",
    data: {
      synced: 0,
      serviceName: req.serviceAuth.serviceName
    }
  });
});

/**
 * @route   POST /internal/validate-admin
 * @desc    Validate admin credentials (multiple services allowed)
 * @access  Internal (auth-service, payment-service)
 */
router.post("/validate-admin", restrictToServices(["auth-service", "payment-service"]), (req, res) => {
  const { adminId } = req.body;

  // Example: Different response based on calling service
  if (isFromService(req, "auth-service")) {
    // Special handling for auth service
    return res.status(OK).json({
      success: true,
      message: "Admin validation for auth service",
      specialAccess: true
    });
  }

  // Standard response for other services
  res.status(OK).json({
    success: true,
    message: "Admin validation completed",
    adminId: adminId
  });
});

/**
 * @route   GET /internal/service-info
 * @desc    Get information about the calling service
 * @access  Internal (any authenticated service)
 */
router.get("/service-info", verifyServiceToken(), (req, res) => {
  res.status(OK).json({
    success: true,
    message: "Service information retrieved",
    yourServiceInfo: {
      serviceName: req.serviceAuth.serviceName,
      serviceInstanceId: req.serviceAuth.serviceInstanceId,
      tokenIssuedAt: new Date(req.serviceAuth.issuedAt * 1000).toISOString(),
      tokenExpiresAt: new Date(req.serviceAuth.expiresAt * 1000).toISOString()
    }
  });
});

module.exports = router;
