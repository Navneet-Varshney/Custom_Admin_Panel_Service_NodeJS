// Enum Helpers using Factory Design Pattern
const { isValidEnumValue, getEnumKeyByValue } = require("./validators-factory.util");
const { logWithTime } = require("./time-stamps.util");

const {
  UserTypes,
  AuthModes,
  DeviceTypes,
  AuditMode,
  FirstNameFieldSetting,
  ContactModes,
  AdminTypes,
  AdminRoleTypes,
  ClientRoleTypes,
  TotalTypes,
  OrganizationTypes,
  ClientConversionRequestTypes
} = require("@configs/enums.config");

const { 
  AdminCreationReasons, 
  ClientCreationReasons, 
  ConvertUserToClientReasons,
  BlockAdminReasons,
  UnblockAdminReasons,
  BlockUserReasons,
  UnblockUserReasons,
  BlockDeviceReasons,
  UnblockDeviceReasons,
  ViewActivityTrackerReasons,
  OrganizationCreationReasons,
  OrganizationUpdateReasons,
  OrganizationDeletionReasons,
  OrganizationDisablitionReasons,
  OrganizationEnableReasons,
  OrganizationalUserCreationReasons,
  OrganizationalUserUpdateReasons,
  OrganizationalUserDeletionReasons,
  OrganizationalUserDisablitionReasons,
  OrganizationalUserEnableReasons,
  ClientConversionRequestReasons
 } = require("@configs/reasons.config");

/**
 * Factory to create enum helper with boolean returns
 * Returns true/false only - caller decides response handling
 * This allows collecting multiple validation errors
 * 
 * @param {Object} enumObj - The frozen enum object
 * @param {String} name - Enum name for logging context
 */

const createEnumHelper = (enumObj, name) => ({
  validate: (value) => {
    const result = isValidEnumValue(enumObj, value);
    logWithTime(`[${name}] validate("${value}") →`, result);
    return result;
  },
  reverseLookup: (value) => {
    const result = getEnumKeyByValue(enumObj, value);
    logWithTime(`[${name}] reverseLookup("${value}") →`, result);
    return result;
  },
  getValidValues: () => {
    return Object.values(enumObj);
  },
  getName: () => name
});

// Enum-specific helpers
const DeviceTypeHelper = createEnumHelper(DeviceTypes, "DeviceType");
const UserTypeHelper = createEnumHelper(UserTypes, "UserType");
const AuthModesHelper = createEnumHelper(AuthModes, "AuthModes");
const AuditModeHelper = createEnumHelper(AuditMode, "AuditMode");
const FirstNameFieldSettingHelper = createEnumHelper(FirstNameFieldSetting, "FirstNameFieldSetting");
const ContactModesHelper = createEnumHelper(ContactModes, "ContactModes");
const AdminTypesHelper = createEnumHelper(AdminTypes, "AdminTypes");
const AdminRoleTypesHelper = createEnumHelper(AdminRoleTypes, "AdminRoleTypes");
const ClientRoleTypesHelper = createEnumHelper(ClientRoleTypes, "ClientRoleTypes");
const AdminCreationReasonsHelper = createEnumHelper(AdminCreationReasons, "AdminCreationReasons");
const ClientCreationReasonsHelper = createEnumHelper(ClientCreationReasons, "ClientCreationReasons");
const ConvertUserToClientReasonsHelper = createEnumHelper(ConvertUserToClientReasons, "ConvertUserToClientReasons");
const BlockAdminReasonsHelper = createEnumHelper(BlockAdminReasons, "BlockAdminReasons");
const UnblockAdminReasonsHelper = createEnumHelper(UnblockAdminReasons, "UnblockAdminReasons");
const BlockUserReasonsHelper = createEnumHelper(BlockUserReasons, "BlockUserReasons");
const UnblockUserReasonsHelper = createEnumHelper(UnblockUserReasons, "UnblockUserReasons");
const BlockDeviceReasonsHelper = createEnumHelper(BlockDeviceReasons, "BlockDeviceReasons");
const UnblockDeviceReasonsHelper = createEnumHelper(UnblockDeviceReasons, "UnblockDeviceReasons");
const ViewActivityTrackerReasonsHelper = createEnumHelper(ViewActivityTrackerReasons, "ViewActivityTrackerReasons");
const TotalTypesHelper = createEnumHelper(TotalTypes, "TotalTypes");
const OrganizationTypesHelper = createEnumHelper(OrganizationTypes, "OrganizationTypes");
const ClientConversionRequestTypesHelper = createEnumHelper(ClientConversionRequestTypes, "ClientConversionRequestTypes");
const OrganizationCreationReasonsHelper = createEnumHelper(OrganizationCreationReasons, "OrganizationCreationReasons");
const OrganizationUpdateReasonsHelper = createEnumHelper(OrganizationUpdateReasons, "OrganizationUpdateReasons");
const OrganizationDeletionReasonsHelper = createEnumHelper(OrganizationDeletionReasons, "OrganizationDeletionReasons");
const OrganizationDisablitionReasonsHelper = createEnumHelper(OrganizationDisablitionReasons, "OrganizationDisablitionReasons");
const OrganizationEnableReasonsHelper = createEnumHelper(OrganizationEnableReasons, "OrganizationEnableReasons");
const OrganizationalUserCreationReasonsHelper = createEnumHelper(OrganizationalUserCreationReasons, "OrganizationalUserCreationReasons");
const OrganizationalUserUpdateReasonsHelper = createEnumHelper(OrganizationalUserUpdateReasons, "OrganizationalUserUpdateReasons");
const OrganizationalUserDeletionReasonsHelper = createEnumHelper(OrganizationalUserDeletionReasons, "OrganizationalUserDeletionReasons");
const OrganizationalUserDisablitionReasonsHelper = createEnumHelper(OrganizationalUserDisablitionReasons, "OrganizationalUserDisablitionReasons");
const OrganizationalUserEnableReasonsHelper = createEnumHelper(OrganizationalUserEnableReasons, "OrganizationalUserEnableReasons");
const ClientConversionRequestReasonsHelper = createEnumHelper(ClientConversionRequestReasons, "ClientConversionRequestReasons");

module.exports = {
    DeviceTypeHelper,
    UserTypeHelper,
    AuthModesHelper,
    AuditModeHelper,
    FirstNameFieldSettingHelper,
    ContactModesHelper,
    AdminTypesHelper,
    AdminRoleTypesHelper,
    ClientRoleTypesHelper,
    AdminCreationReasonsHelper,
    ConvertUserToClientReasonsHelper,
    ClientCreationReasonsHelper,
    BlockAdminReasonsHelper,
    UnblockAdminReasonsHelper,
    BlockUserReasonsHelper,
    UnblockUserReasonsHelper,
    BlockDeviceReasonsHelper,
    UnblockDeviceReasonsHelper,
    ViewActivityTrackerReasonsHelper,
    TotalTypesHelper,
    OrganizationTypesHelper,
    ClientConversionRequestTypesHelper,
    OrganizationCreationReasonsHelper,
    OrganizationUpdateReasonsHelper,
    OrganizationDeletionReasonsHelper,
    OrganizationDisablitionReasonsHelper,
    OrganizationEnableReasonsHelper,
    OrganizationalUserCreationReasonsHelper,
    OrganizationalUserUpdateReasonsHelper,
    OrganizationalUserDeletionReasonsHelper,
    OrganizationalUserDisablitionReasonsHelper,
    OrganizationalUserEnableReasonsHelper,
    ClientConversionRequestReasonsHelper
};