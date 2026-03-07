const { throwInternalServerError, throwAccessDeniedError } = require("@/responses/common/error-handler.response");
const { isAdminId } = require("@/utils/entity-type.util");
const { logMiddlewareError } = require("@/utils/log-error.util");
const { logWithTime } = require("@/utils/time-stamps.util");

const checkAdminMiddleware = (req, res, next) => {
    try {

        const userId = req.userId; // This should be injected by the JWT verification middleware

        // Check if userId starts with Admin prefix
        if (!isAdminId(userId)) {
            logMiddlewareError("checkAdmin", `User ID does not have admin prefix: ${userId}`, req);
            return throwAccessDeniedError(res, "Admin privileges required");
        }

        logWithTime(`✅ Admin ID verified: ${userId}`);

        // If it passes the check, proceed to next middleware
        return next();
    } catch (err) {
        logMiddlewareError("checkAdmin", `Unexpected error: ${err.message}`, req);
        return throwInternalServerError(res, err);
    }
};

module.exports = { 
    checkAdminMiddleware 
};