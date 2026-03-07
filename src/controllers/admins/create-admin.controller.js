const { createAdminService } = require("@services/admins/create-admin.service");
const { fetchAdmin } = require("@/services/common/fetch-admin.service");
const { logWithTime } = require("@utils/time-stamps.util");
const { 
  throwBadRequestError, 
  throwInternalServerError, 
  getLogIdentifiers, 
  throwConflictError,
  throwDBResourceNotFoundError 
} = require("@/responses/common/error-handler.response");
const { createAdminSuccessResponse } = require("@responses/success/index");
const { AdminErrorTypes } = require("@configs/enums.config");
const { canActOnRole } = require("@/utils/role.util");

const createAdmin = async (req, res) => {
  try {
    const creator = req.admin; // Injected by middleware
    const { firstName, adminType, supervisorId: requestedSupervisorId, creationReason, email, password, countryCode, localNumber, phone, role } = req.body;

    // Determine supervisor
    let supervisorId = requestedSupervisorId;
    let supervisor = null;

    if (requestedSupervisorId) {
      supervisor = await fetchAdmin(null, null, requestedSupervisorId);
      
      if (!supervisor) {
        logWithTime(`❌ Supervisor not found: ${requestedSupervisorId} while creating admin by ${creator.adminId} ${getLogIdentifiers(req)}`);
        return throwDBResourceNotFoundError(res, "Supervisor", requestedSupervisorId);
      }
      
      if (canActOnRole(supervisor.adminType, adminType) === false) {
        logWithTime(`❌ Supervisor cannot oversee an admin of equal or higher role: ${requestedSupervisorId} by ${creator.adminId} ${getLogIdentifiers(req)}`);
        return throwBadRequestError(res, "Supervisor cannot oversee an admin of equal or higher role");
      }
    } else {
      supervisorId = creator.adminId;
      supervisor = creator;
    }

    // Call service
    const result = await createAdminService(
      creator,
      { firstName, adminType, supervisorId, creationReason, email, password, countryCode, localNumber, phone, role },
      supervisor,
      req.device,
      req.requestId
    );

    // Handle service errors
    if (!result.success) {
      if (result.type === AdminErrorTypes.CONFLICT) {
        return throwConflictError(res, result.message);
      }
      if (result.type === AdminErrorTypes.INVALID_DATA) {
        return throwBadRequestError(res, result.message);
      }
      return throwInternalServerError(res, result.message);
    }

    // Success response
    return createAdminSuccessResponse(res, result.data);

  } catch (err) {
    logWithTime(`❌ Internal Error in createAdmin controller ${getLogIdentifiers(req)}: ${err.message}`);
    return throwInternalServerError(res, err);
  }
};

module.exports = { createAdmin };