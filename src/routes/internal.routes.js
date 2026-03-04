/**
 * Internal Routes
 * 
 * These routes are protected by service token authentication
 * Only other microservices with valid service tokens can access these endpoints
 */

const express = require("express");
const { createSuperAdminController } = require("@controllers/internals/create-super-admin.controller");
const {
  sendAuthServiceHealthSuccess,
  sendSoftwareServiceHealthSuccess,
} = require("@/responses/internals/common.response");
const { INTERNAL_ROUTES } = require("@configs/uri.config");
const { microserviceConfig } = require("@configs/microservice.config");
const { authInternalMiddlewares, softwareManagementInternalMiddlewares } = require("./middleware.gateway.routes");
const { CREATE_SUPER_ADMIN, PROVIDE_HEALTH_CHECK_TO_AUTH_SERVICE, PROVIDE_HEALTH_CHECK_TO_SOFTWARE_SERVICE } = INTERNAL_ROUTES;
const internalRouter = express.Router();

// Check if microservice mode is enabled
if (!microserviceConfig.enabled) {
  console.log('ℹ️  Internal routes disabled (monolithic mode)');
  module.exports = { internalRouter };
} else {
  // Load internal modules only in microservice mode
  const internal = require('../internals');

  if (!internal) {
    console.error('❌ Internal module not available');
    module.exports = { internalRouter };
  } else {
    // ==================== Bootstrap Routes ====================

    /**
     * @route   POST /internal/bootstrap/create-super-admin
     * @desc    Create initial super admin account (Bootstrap)
     * @access  Internal (System Bootstrap - No authentication required for first run)
     * @note    This endpoint should be called once during system initialization
     */
    internalRouter.post(CREATE_SUPER_ADMIN,
      [authInternalMiddlewares],
      createSuperAdminController
    );

    // ==================== Health Check Routes (Service-Specific) ====================

    /**
     * @route   GET /internal/auth/health
     * @desc    Health check for auth service
     * @access  Internal (auth-service ONLY)
     */
    internalRouter.get(PROVIDE_HEALTH_CHECK_TO_AUTH_SERVICE, authInternalMiddlewares, (req, res) => {
      return sendAuthServiceHealthSuccess(res, req.serviceAuth);
    });

    /**
     * @route   GET /internal/software/health
     * @desc    Health check for software management service
     * @access  Internal (software-management-service ONLY)
     */
    internalRouter.get(PROVIDE_HEALTH_CHECK_TO_SOFTWARE_SERVICE, softwareManagementInternalMiddlewares, (req, res) => {
      return sendSoftwareServiceHealthSuccess(res, req.serviceAuth);
    });

    module.exports = {
      internalRouter
    }
  }
}