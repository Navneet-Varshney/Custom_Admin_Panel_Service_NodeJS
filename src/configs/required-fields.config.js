/**
 * REQUIRED FIELDS CONFIG (Auto-Generated)
 * 
 * DO NOT MANUALLY EDIT THIS FILE!
 * 
 * These arrays are automatically derived from:
 * @see field-definitions.config.js (Single Source of Truth)
 * 
 * To add/remove/modify required fields:
 * → Edit FieldDefinitions in field-definitions.config.js
 * → Changes will automatically reflect here
 */

const { getRequiredFields } = require("@/utils/field-definition.util");
const { FieldDefinitions } = require("./field-definitions.config");

// AUTO-GENERATED REQUIRED FIELDS

const createAdminField = getRequiredFields(FieldDefinitions.CREATE_ADMIN);
const createUserField = getRequiredFields(FieldDefinitions.CREATE_USER);
const convertUserToClientField = getRequiredFields(FieldDefinitions.CONVERT_USER_TO_CLIENT);

module.exports = {
    createAdminField,
    createUserField,
    convertUserToClientField
};