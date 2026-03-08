const { ROLE_TRANSITIONS } = require("@configs/role-transitions.config");
const { 
  throwBadRequestError, 
  throwAccessDeniedError,
  logMiddlewareError,
  throwInternalServerError
} = require("@/responses/common/error-handler.response");
const { TotalTypes } = require("@/configs/enums.config");
const { logWithTime } = require("@/utils/time-stamps.util");

/**
 * Type Transition Validator Middleware
 *
 * Validates if type transition is allowed according to ROLE_TRANSITIONS policy
 *
 * @param {string} currentTypeField - Field name for current type (e.g., 'userType')
 * @param {string} newTypeField - Field name for new type in request body (e.g., 'newUserType')
 * @param {string} entityKey - Where entity is stored in req (e.g., 'foundUser')
 */
const validateTypeTransition = (currentTypeField, newTypeField) => {
  return (req, res, next) => {
    try {

      // 1️⃣ Target entity
      let foundCurrType = null;
      if(req.foundAdmin){
        foundCurrType = TotalTypes.ADMIN;
      }else {
        if(req.foundUser.userType === TotalTypes.CLIENT){
          foundCurrType = TotalTypes.CLIENT;
        }else {
          foundCurrType = TotalTypes.USER;
        }
      }

      // 2️⃣ Current type
      if(currentTypeField !== foundCurrType){
        logMiddlewareError("typeTransition", `Current type mismatch: expected ${currentTypeField}, found ${foundCurrType}`, req);
        return throwBadRequestError(res, `Current type mismatch: expected ${currentTypeField}, found ${foundCurrType}`);
      }

      // 3️⃣ Requested new type and Prevent same type assignment
      if (foundCurrType === newTypeField) {
        logMiddlewareError("typeTransition", `Entity already has type: ${newTypeField}`, req);
        return throwBadRequestError(res, `Entity already has type: ${newTypeField}`);
      }

      // 4️⃣ Check transition policy
      const admin = req.admin;

      const transitionsFromCurrentType = ROLE_TRANSITIONS[foundCurrType];
      if (!transitionsFromCurrentType) {
        logMiddlewareError("typeTransition", `No transitions defined for type: ${foundCurrType}`, req);
        return throwAccessDeniedError(res, `Type transition from ${foundCurrType} is not allowed`);
      }

      const allowedAdmins = transitionsFromCurrentType[newTypeField];
      if (!allowedAdmins || allowedAdmins.length === 0) {
        logMiddlewareError(
          "typeTransition",
          `Transition not allowed: ${foundCurrType} → ${newTypeField}`,
          req
        );
        return throwAccessDeniedError(
          res,
          `Cannot change type from ${foundCurrType} to ${newTypeField}`
        );
      }

      // 5️⃣ Admin authorization check
      if (!allowedAdmins.includes(admin.adminType)) {
        logMiddlewareError(
          "typeTransition",
          `Admin ${admin.adminType} not authorized for ${foundCurrType} → ${newTypeField}`,
          req
        );
        return throwAccessDeniedError(
          res,
          "You are not authorized to perform this type transition"
        );
      }

      // ✅ All validations passed
      logWithTime("✅ Type transition validation passed", req);

      return next();

    } catch (error) {
      logMiddlewareError("typeTransition", `Unexpected error: ${error.message}`, req);
      return throwInternalServerError(res, "Type transition validation failed");
    }
  };
};

module.exports = {
  validateTypeTransition
};