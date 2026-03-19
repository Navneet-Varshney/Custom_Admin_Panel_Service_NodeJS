const { createOrganizationService } = require("@/services/organizations/create-organization.service");
const { logWithTime } = require("@utils/time-stamps.util");
const { 
  throwBadRequestError, 
  throwInternalServerError, 
  getLogIdentifiers,
  throwSpecificInternalServerError 
} = require("@/responses/common/error-handler.response");
const { createOrganizationSuccessResponse } = require("@/responses/success/organization.response");
const { OrganizationErrorTypes } = require("@/configs/service-error.config");

/**
 * Create Organization Controller
 */
const createOrganizationController = async (req, res) => {
  try {
    const admin = req.admin; // Injected by middleware
    const { organizationName, orgType, website, logoUrl, contactEmail, contactCountryCode, contactLocalNumber, address, description, creationReason, reasonDescription } = req.body;

    logWithTime(`🔄 Creating organization by ${admin.adminId} ${getLogIdentifiers(req)}`);

    // Validate contactCountryCode and contactLocalNumber are both provided or both undefined
    const hasCountryCode = contactCountryCode !== undefined;
    const hasLocalNumber = contactLocalNumber !== undefined;
    if (hasCountryCode !== hasLocalNumber) {
      return throwBadRequestError(
        res, 
        "Both contactCountryCode and contactLocalNumber must be provided together"
      );
    }

    // Call service
    const result = await createOrganizationService(
      admin,
      { organizationName, orgType, website, logoUrl, contactEmail, contactCountryCode, contactLocalNumber, address, description, creationReason , reasonDescription},
      req.device,
      req.requestId
    );

    // Handle service errors
    if (!result.success) {
      if (result.type === OrganizationErrorTypes.ALREADY_EXISTS) {
        return throwBadRequestError(res, result.message);
      }
      if (result.type === OrganizationErrorTypes.INVALID_DATA) {
        return throwBadRequestError(res, result.message);
      }
      return throwSpecificInternalServerError(res, result.message);
    }

    // Success response
    logWithTime(`✅ Organization created successfully: ${result.data._id} ${getLogIdentifiers(req)}`);
    return createOrganizationSuccessResponse(res, result.data);

  } catch (err) {
    logWithTime(`❌ Internal Error in createOrganizationController ${getLogIdentifiers(req)}: ${err.message}`);
    return throwInternalServerError(res, err);
  }
};

module.exports = {
    createOrganizationController
}