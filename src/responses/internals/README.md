# Internal Responses

This directory contains **success response handlers** for **internal/bootstrap operations** and **system-level endpoints**.

## Purpose

Centralized **success response management** following the **DRY (Don't Repeat Yourself)** principle. 

✅ **Success responses** are defined here (specific to internal operations)  
✅ **Error responses** use common error handlers from `responses/common/error-handler.response.js`  
✅ **No Hardcoding** - Controllers never hardcode responses  
✅ **Consistency** - Same response format across all internal endpoints  

---

## Files

### 1. `create-super-admin.response.js`

Success response handler for the super admin bootstrap operation.

**Functions:**

#### `sendSuperAdminCreatedSuccess(res, data)`
- **Status:** 201 Created
- **When:** Super admin successfully created
- **Returns:** Success message with admin data

**Error Handling:**  
All errors are handled by common error handlers:
- `throwMissingFieldsError()` - Missing required fields
- `throwConflictError()` - Super admin already exists
- `throwInternalServerError()` - Creation failed

---

## Usage Pattern

### ✅ CORRECT - Controller Using Common Error Handlers

```javascript
const { createSuperAdmin } = require("@services/internals/create-super-admin.service");
const {
    sendSuperAdminCreatedSuccess
} = require("@/responses/internals/create-super-admin.response");
const {
    throwMissingFieldsError,
    throwConflictError,
    throwInternalServerError
} = require("@/responses/common/error-handler.response");

const createSuperAdminController = async (req, res) => {
    try {
        const { adminId, firstName } = req.body;
        const result = await createSuperAdmin({ adminId, firstName });

        if (!result.success) {
            if (result.message === "adminId and firstName are required") {
                return throwMissingFieldsError(res, ["adminId", "firstName"]);
            }
            
            if (result.message === "Super admin already exists") {
                return throwConflictError(
                    res,
                    "A super admin account has already been created. Only one super admin is allowed.",
                    "If you need to modify the super admin, please contact system administrator."
                );
            }
            
            return throwInternalServerError(res, new Error(result.error));
        }

        // Use internal success response
        return sendSuperAdminCreatedSuccess(res, result.data);

    } catch (err) {
        return throwInternalServerError(res, err);
    }
};
```

### ❌ INCORRECT - Hardcoded Responses in Controller

```javascript
// Don't do this!
const createSuperAdminController = async (req, res) => {
    try {
        const result = await createSuperAdmin({ adminId, firstName });

        if (!result.success) {
            return res.status(400).json({
                success: false,
                message: "Failed" // ❌ Hardcoded
            });
        }

        return res.status(201).json({
            success: true,
            message: "Created" // ❌ Hardcoded
        });

    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Error" // ❌ Hardcoded
        });
    }
};
```

---

## Response Structure

All responses follow a consistent structure:

### Success Response (Internal Specific)
```json
{
  "success": true,
  "message": "Human-readable success message",
  "data": {
    // Response data
  }
}
```

### Error Response (Common Error Handlers)
```json
{
  "success": false,
  "type": "ErrorType",
  "warning": "Brief error description",
  "message": "Detailed user-friendly error message",
  "suggestion": "Optional: How to fix the error",
  "fields": ["Optional: Missing field names"],
  "errors": "Optional: Validation errors",
  "response": "Optional: Additional context"
}
```

---

## Architecture: Separation of Concerns

```
Internal Operations:
├─ Success Responses → responses/internals/*.response.js
└─ Error Responses   → responses/common/error-handler.response.js

Common Error Handlers Used:
├─ throwMissingFieldsError(res, fields)
├─ throwConflictError(res, message, suggestion)
├─ throwInternalServerError(res, error)
├─ throwBadRequestError(res, reason, details)
└─ throwAccessDeniedError(res, reason)
```

---

## Creating New Response Handlers

When creating new internal response handlers, follow this pattern:

1. **Create response file**: `responses/internals/{feature-name}.response.js`
2. **Import required dependencies**:
   ```javascript
   const { logWithTime } = require("@utils/time-stamps.util");
   const { CREATED, OK } = require("@configs/http-status.config");
   ```
3. **Define ONLY success responses**: Error handling uses common handlers
4. **Name functions clearly**: `send{Feature}{Action}Success`
5. **Log actions**: Use `logWithTime()` for visibility
6. **Export all functions**: Make them available to controllers

### Example Pattern

```javascript
// responses/internals/example-feature.response.js

const { logWithTime } = require("@utils/time-stamps.util");
const { CREATED, OK } = require("@configs/http-status.config");

/**
 * Success Response - Feature Created
 */
const sendFeatureCreatedSuccess = (res, data) => {
    logWithTime("✅ Feature created successfully");
    return res.status(CREATED).json({
        success: true,
        message: "Feature created successfully",
        data
    });
};

/**
 * Success Response - Feature Updated
 */
const sendFeatureUpdatedSuccess = (res, data) => {
    logWithTime("✅ Feature updated successfully");
    return res.status(OK).json({
        success: true,
        message: "Feature updated successfully",
        data
    });
};

module.exports = {
    sendFeatureCreatedSuccess,
    sendFeatureUpdatedSuccess
};
```

Then in controller:
```javascript
const { sendFeatureCreatedSuccess } = require("@/responses/internals/example-feature.response");
const { throwMissingFieldsError, throwConflictError } = require("@/responses/common/error-handler.response");

// Use common error handlers for errors
// Use internal success handlers for success
```

---

## HTTP Status Codes Used

| Code | Constant | Usage |
|------|----------|-------|
| 200 | OK | Standard success |
| 201 | CREATED | Resource created |
| 400 | BAD_REQUEST | Invalid input |
| 401 | UNAUTHORIZED | Missing/invalid token |
| 403 | FORBIDDEN | Insufficient permissions |
| 404 | NOT_FOUND | Resource not found |
| 409 | CONFLICT | Resource already exists |
| 422 | UNPROCESSABLE_ENTITY | Invalid business logic |
| 429 | TOO_MANY_REQUESTS | Rate limit exceeded |
| 500 | INTERNAL_ERROR | Server error |

---

## Related Files

- [Common Error Handlers](../common/error-handler.response.js) - Generic error responses
- [HTTP Status Config](../../configs/http-status.config.js) - Status code constants
- [Create Super Admin Controller](../../controllers/internals/create-super-admin.controller.js)

---

## Best Practices

✅ **DO:**
- Create specific **success** response handlers for each internal endpoint in this folder
- Use **common error handlers** from `responses/common/error-handler.response.js`
- Use appropriate HTTP status codes
- Include helpful success messages for users
- Log important actions
- Keep responses consistent

❌ **DON'T:**
- Create duplicate error handlers (use common ones)
- Hardcode responses in controllers
- Expose sensitive error details to users
- Use generic success messages without context
- Forget to log important operations
- Return inconsistent response structures

---

## Common Error Handlers Reference

Available error handlers from `responses/common/error-handler.response.js`:

```javascript
const {
    throwMissingFieldsError,        // 400 - Missing required fields
    throwBadRequestError,            // 400 - Invalid request
    throwUnauthorizedError,          // 401 - Invalid credentials
    throwAccessDeniedError,          // 403 - Insufficient permissions
    throwSessionExpiredError,        // 401 - Session expired
    throwDBResourceNotFoundError,    // 404 - Resource not found
    throwConflictError,              // 409 - Resource conflict
    throwValidationError,            // 422 - Validation failed
    throwTooManyRequestsError,       // 429 - Rate limit exceeded
    throwInternalServerError,        // 500 - Internal error
    throwSpecificInternalServerError // 500 - Custom internal error
} = require("@/responses/common/error-handler.response");
```

**Usage Examples:**

```javascript
// Missing fields
throwMissingFieldsError(res, ["adminId", "firstName"]);

// Conflict (resource already exists)
throwConflictError(res, "Resource already exists", "Try updating instead");

// Internal error
throwInternalServerError(res, error);

// Access denied
throwAccessDeniedError(res, "Insufficient permissions");
```

---

## Testing Response Handlers

```javascript
// Example test
const { sendSuperAdminCreatedSuccess } = require("@/responses/internals/create-super-admin.response");

describe("Create Super Admin Responses", () => {
    it("should return 201 with success message", () => {
        const res = mockResponse();
        const data = { adminId: "admin-001", adminType: "SUPER_ADMIN" };
        
        sendSuperAdminCreatedSuccess(res, data);
        
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                success: true,
                message: expect.any(String),
                data: expect.objectContaining(data)
            })
        );
    });
});
```

---

For more information on the overall response structure, see [responses/common/README.md](../common/README.md).
