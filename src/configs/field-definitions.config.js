/**
 * CENTRALIZED FIELD DEFINITIONS CONFIG
 * 
 * Single Source of Truth for:
 * - Required fields per endpoint/action
 * - Validation rules mapping
 * - Field-level metadata
 * 
 * Benefits:
 * 1. Ek jagah change karein, sab jagah reflect ho
 * 2. Type-safe through enum-like structure
 * 3. Automatic derivation of required-fields arrays
 * 4. Direct mapping to validation rules
 */

const { validationRules } = require("./validation.config");

/**
 * Field Metadata Structure:
 * {
 *   field: 'fieldName',           // Field identifier
 *   required: true/false,         // Is this field required?
 *   validation: validationRule,   // Link to validation.config.js rule
 *   description: 'Field purpose'  // Optional documentation
 * }
 */

// AUTH ENDPOINTS FIELD DEFINITIONS

const FieldDefinitions = {
    CREATE_ADMIN: {
        ADMIN_TYPE: {
            field: "adminType",
            required: true,
            validation: validationRules.adminType,
            description: "Type of admin (SUPER_ADMIN, SUB_ADMIN)"
        },
        CREATION_REASON: {
            field: "creationReason",
            required: true,
            validation: validationRules.adminCreationReason,
            description: "Reason for creating this admin account (optional but recommended)"
        },
        PASSWORD: {
            field: "password",
            required: true,
            validation: validationRules.password,
            description: "Password for the new admin account"
        },
        ROLE: {
            field: "role",
            required: true,
            validation: validationRules.adminRole,
            description: "Role of the new admin account"
        }
    },
    CREATE_USER: {
        CREATION_REASON: {
            field: "creationReason",
            required: true,
            validation: validationRules.clientCreationReason,
            description: "Reason for creating this client/user account"
        },
        PASSWORD: {
            field: "password",
            required: true,
            validation: validationRules.password,
            description: "Password for the new client account"
        },
        ROLE: {
            field: "role",
            required: true,
            validation: validationRules.clientRole,
            description: "Role of the new client account (for software management)"
        }
    },
    CONVERT_USER_TO_CLIENT: {
        USER_ID: {
            field: "userId",
            required: true,
            validation: validationRules.userId,
            description: "ID of the user to be converted to client"
        },
        CONVERT_REASON: {
            field: "convertReason",
            required: true,
            validation: validationRules.convertReason,
            description: "Reason for converting user to client"
        },
        ROLE: {
            field: "role",
            required: true,
            validation: validationRules.clientRole,
            description: "Role for the client in software management service"
        }
    }
    // Future endpoints can be added here following the same structure
};

module.exports = {
  FieldDefinitions
};