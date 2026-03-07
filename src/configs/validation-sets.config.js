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

const { FieldDefinitions, getValidationSet } = require("./field-definitions.config");

// AUTO-GENERATED VALIDATION SETS

const validationSets = {
    createAdmin: getValidationSet(FieldDefinitions.CREATE_ADMIN),
    createUser: getValidationSet(FieldDefinitions.CREATE_USER)
};

module.exports = {
  validationSets
};