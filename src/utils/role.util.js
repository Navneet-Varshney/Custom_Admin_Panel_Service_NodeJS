const { RoleHierarchy } = require("@configs/enums.config");

/**
 * Checks if the given role has required permission
 * Used across microservices for RBAC validation.
 *
 * @param {string} role - Actual role of user (from token).
 * @param {string|string[]} allowedRoles - Single role or array of allowed roles.
 * @returns {boolean}
 */

function checkRole(role, allowedRoles) {
  if (!role || !allowedRoles) return false;

  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  return roles.map(r => r.toUpperCase()).includes(role.toUpperCase());
}

/**
 * Checks if an actor role can perform operations on a target role
 * based on hierarchy values. Actor can ONLY act on roles with STRICTLY
 * LOWER hierarchy values (same level or higher is denied).
 *
 * @param {string} actorRole - Role of the admin performing the action
 * @param {string} targetRole - Role of the admin being acted upon
 * @returns {boolean} - true if actor hierarchy > target hierarchy
 *
 * @example
 * canActOnRole('super_admin', 'mid_admin') // true (3 > 2)
 * canActOnRole('mid_admin', 'admin') // true (2 > 1)
 * canActOnRole('mid_admin', 'mid_admin') // false (2 = 2, same level denied)
 * canActOnRole('admin', 'super_admin') // false (1 < 3, upward denied)
 */
function canActOnRole(actorRole, targetRole) {
  if (!actorRole || !targetRole) return false;

  const actorHierarchy = RoleHierarchy[actorRole];
  const targetHierarchy = RoleHierarchy[targetRole];

  // If either role is not in hierarchy mapping, deny by default
  if (actorHierarchy === undefined || targetHierarchy === undefined) {
    return false;
  }

  // Actor can only act on target if actor's hierarchy is STRICTLY GREATER
  // This automatically prevents same-level and upward operations
  return actorHierarchy > targetHierarchy;
}

module.exports = { checkRole, canActOnRole };