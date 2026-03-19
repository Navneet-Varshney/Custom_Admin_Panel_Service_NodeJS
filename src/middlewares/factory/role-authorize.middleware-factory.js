const { throwAccessDeniedError, throwInternalServerError, logMiddlewareError } = require("@/responses/common/error-handler.response");
const { logWithTime } = require("@/utils/time-stamps.util");


const roleAuthorize = (allowedRoles = []) => {
    return (req, res, next) => {
        try {
            const adminType = req.admin.adminType; 

            if (!allowedRoles.includes(adminType)) {
                logMiddlewareError('roleAuthorize',`❌ Role authorization failed - Admin type '${adminType}' is not in allowed roles: ${allowedRoles.join(", ")}`, req);
                return throwAccessDeniedError(res, "You do not have permission to perform this action");
            }

            logWithTime(`✅ Role authorization passed for admin type: ${adminType} - Allowed roles: ${allowedRoles.join(", ")}`);
            return next();
        } catch (err) {
            logMiddlewareError('roleAuthorize', `❌ Internal Error in roleAuthorize middleware`, req);
            return throwInternalServerError(res, err);
        }
    };
};

module.exports = {
    roleAuthorize
};