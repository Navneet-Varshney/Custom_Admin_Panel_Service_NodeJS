/**
 * VALIDATION SETS CONFIG (Auto-Generated)
 * 
 * DO NOT MANUALLY EDIT THIS FILE!
 * 
 * These validation sets are automatically derived from:
 * @see field-definitions.config.js (Single Source of Truth)
 * 
 * To add/remove/modify validation rules:
 * → Edit FieldDefinitions in field-definitions.config.js
 * → Changes will automatically reflect here
 */

const { getValidationSet } = require("@/utils/field-definition.util");
const { FieldDefinitions } = require("./field-definitions.config");

// AUTO-GENERATED VALIDATION SETS

const validationSets = {
    createAdmin: getValidationSet(FieldDefinitions.CREATE_ADMIN),
    createUser: getValidationSet(FieldDefinitions.CREATE_USER),
    convertUserToClient: getValidationSet(FieldDefinitions.CONVERT_USER_TO_CLIENT)
};

module.exports = {
  validationSets
};