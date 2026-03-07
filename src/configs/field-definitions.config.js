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
    }
    // Future endpoints can be added here following the same structure
};

// HELPER: Get Required Fields Array

/**
 * Extracts required field names from a definition object
 * @param {Object} definition - Field definition object (e.g., FieldDefinitions.SIGN_UP)
 * @returns {Array<string>} - Array of required field names
 * 
 * Example:
 * getRequiredFields(FieldDefinitions.CHANGE_PASSWORD) 
 * => ['password', 'newPassword', 'confirmPassword']
 */

const getRequiredFields = (definition) => {
  return Object.values(definition)
    .filter(fieldMeta => fieldMeta.required)
    .map(fieldMeta => fieldMeta.field);
};

// HELPER: Get Validation Set

/**
 * Extracts validation rules mapped to field names
 * @param {Object} definition - Field definition object
 * @returns {Object} - Validation set { fieldName: validationRule }
 * 
 * Example:
 * getValidationSet(FieldDefinitions.VERIFY_PHONE)
 * => { phone: validationRules.phone }
 */

const getValidationSet = (definition) => {
  return Object.values(definition).reduce((acc, fieldMeta) => {
    if (fieldMeta.validation) {
      acc[fieldMeta.field] = fieldMeta.validation;
    }
    return acc;
  }, {});
};

// EXPORTS

module.exports = {
  FieldDefinitions,
  getRequiredFields,
  getValidationSet
};