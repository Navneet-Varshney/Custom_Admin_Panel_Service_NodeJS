const { isValidRegex } = require("@utils/validators-factory.util");
const { userIdRegex, adminIdRegex } = require("@configs/regex.config");
const { adminIdPrefix, userIdPrefix } = require("@configs/prefix.config");

/**
 * Check if a given userId is an Admin ID
 * @param {string} userId - The userId to check
 * @returns {boolean} - True if userId is an admin ID, false otherwise
 */
const isAdminId = (userId) =>
    typeof userId === "string" &&
    isValidRegex(userId, adminIdRegex) &&
    userId.startsWith(adminIdPrefix);

/**
 * Check if a given userId is a User ID
 * @param {string} userId - The userId to check
 * @returns {boolean} - True if userId is a user ID, false otherwise
 */
const isUserId = (userId) =>
    typeof userId === "string" &&
    isValidRegex(userId, userIdRegex) &&
    userId.startsWith(userIdPrefix);

const isClientId = (userId) =>
    typeof userId === "string" &&
    isValidRegex(userId, userIdRegex) &&
    userId.startsWith(clientIdPrefix);

module.exports = {
    isAdminId,
    isUserId,
    isClientId
};
