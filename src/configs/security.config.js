const { getMyEnv, getMyEnvAsBool, getMyEnvAsNumber, getMyEnvAsArray } = require("@/utils/env.util");

module.exports = {
  SALT: getMyEnvAsNumber('SALT', 10),
  authMode: getMyEnv('AUTH_MODE', 'EMAIL'),
  auditMode: getMyEnv('AUDIT_MODE', 'CHANGED_ONLY'),
  verificationMode: getMyEnv('VERIFICATION_MODE', 'optional'),
  ACTIVITY_TRACKING_ENABLED: getMyEnvAsBool('ACTIVITY_TRACKING_ENABLED', true),
  otp: {
    length: 6,                // digits in OTP
    maxAttempts: 5,
    digits: "0123456789"      // OTP characters allowed
  },
  hashing: {
    algorithm: "sha256",
    encoding: "hex",
    saltLength: 16
  },
  passwordSecurity: {
    MAX_ATTEMPTS: 5,           // 5 baar galat password allow hai
    LOCKOUT_TIME_MINUTES: 15   // Uske baad 15 minute ka ban
  },
  WHITELISTED_DEVICE_UUIDS: getMyEnvAsArray('WHITELISTED_DEVICE_UUIDS'),
  FIRST_NAME_SETTING: getMyEnv('FIRST_NAME_SETTING', 'mandatory'),
  link: {
    length: 32,
    algorithm: "sha256",
    encoding: "hex",
    secret: getMyEnv('VERIFICATION_LINK_SECRET', 'default-secret-change-in-production')
  },
  ADMIN_SUSPENSION_ALLOWED: getMyEnvAsBool('ADMIN_SUSPENSION_ALLOWED', true),
  ADMIN_BLOCKING_ALLOWED: getMyEnvAsBool('ADMIN_BLOCKING_ALLOWED', true),
  ADVANCED_LOGGING_ENABLED: getMyEnvAsBool('ADVANCED_LOGGING_ENABLED', false),
  
  // Service-to-Service Authentication
  SERVICE_TOKEN_SECRET: getMyEnv('SERVICE_TOKEN_SECRET', 'change-this-secret-in-production-and-keep-same-across-services'),
  SERVICE_TOKEN_EXPIRY: getMyEnv('SERVICE_TOKEN_EXPIRY', '60m'),
  ALLOWED_SERVICE_NAMES: getMyEnvAsArray('ALLOWED_SERVICE_NAMES', [])
};