/**
 * TEST PARAMETERS FOR ORGANIZATION AND ORGANIZATION-USER ENDPOINTS
 * Direct parameters for testing - copy and use in API requests
 */

// ==================== ORGANIZATION ENDPOINTS ====================

// 1. CREATE ORGANIZATION
const createOrganizationParams = {
  organizationName: "Tech Innovations Inc",
  orgType: "NGO", // or other types from OrganizationTypes enum
  website: "https://www.techinnovations.com",
  logoUrl: "https://www.techinnovations.com/logo.png",
  contactEmail: "contact@techinnovations.com",
  contactCountryCode: "+1",
  contactLocalNumber: "2125551234",
  address: {
    city: "New York",
    country: "USA",
    zipCode: "10001"
  },
  description: "A leading technology innovation company focused on sustainable solutions",
  creationReason: "new_organization" // From OrganizationCreationReasons
};

// 2. UPDATE ORGANIZATION
const updateOrganizationParams = {
  organizationName: "Tech Innovations Global",
  orgType: "partnership",
  website: "https://www.techinnov-global.com",
  logoUrl: "https://www.techinnov-global.com/logo.png",
  contactEmail: "contact@techinnov-global.com",
  contactCountryCode: "+1",
  contactLocalNumber: "2125555678",
  address: {
    city: "San Francisco",
    country: "USA",
    zipCode: "94102"
  },
  description: "Expanded global technology innovation company",
  updationReason: "rebranding" // From OrganizationUpdateReasons
};

// 3. GET ORGANIZATION (No body needed, just organizationId in URL)
// GET /organizations/:organizationId

// 4. DELETE ORGANIZATION
const deleteOrganizationParams = {
  deletionReason: "reorganization" // From OrganizationDeletionReasons
};

// 5. LIST ORGANIZATIONS (No body needed)
// GET /organizations

// ==================== ORGANIZATION-USER ENDPOINTS ====================

// 1. CREATE ORGANIZATION-USER
const createOrgUserParams = {
  userId: "user_123_abc", // User ID from auth service
  organizationId: "org_456_def", // Organization ID from create/get organization
  role: "manager", // Organization-specific role
  creationReason: "new_organization_user" // From OrganizationalUserCreationReasons
};

// 2. UPDATE ORGANIZATION-USER
const updateOrgUserParams = {
  role: "admin", // New role
  updationReason: "role_change" // From OrganizationalUserUpdateReasons
};

// 3. GET ORGANIZATION-USER (No body needed, just orgUserId in URL)
// GET /organization-users/:orgUserId

// 4. DELETE ORGANIZATION-USER
const deleteOrgUserParams = {
  deletionReason: "user_left_organization" // From OrganizationalUserDeletionReasons
};

// 5. LIST ORGANIZATION-USERS
// GET /organizations/:organizationId/users

// ==================== COMPLETE REQUEST EXAMPLES ====================

/**
 * CREATE ORGANIZATION - Full Request Body
 * Method: POST
 * URL: /organizations
 */
const createOrgRequest = {
  organizationName: "Global Tech Solutions",
  orgType: "partnership",
  website: "https://www.globaltechsolutions.com",
  logoUrl: "https://www.globaltechsolutions.com/assets/logo.png",
  contactEmail: "admin@globaltechsolutions.com",
  contactCountryCode: "+44",
  contactLocalNumber: "2012345678",
  address: {
    city: "London",
    country: "UK",
    zipCode: "SW1A 1AA"
  },
  description: "Global leader in technology solutions and consulting",
  creationReason: "new_organization"
};

/**
 * UPDATE ORGANIZATION - Full Request Body
 * Method: PUT
 * URL: /organizations/:organizationId
 */
const updateOrgRequest = {
  organizationName: "Global Tech Solutions Ltd",
  orgType: "corporation",
  description: "Global leader in enterprise technology solutions",
  contactEmail: "contact@globaltechsolutions.com",
  website: "https://globaltechsolutions.co.uk",
  logoUrl: "https://globaltechsolutions.co.uk/logo.png",
  contactCountryCode: "+44",
  contactLocalNumber: "2012345678",
  address: {
    city: "London",
    country: "UK",
    zipCode: "SW1A 1AA"
  },
  updationReason: "contact_info_update"
};

/**
 * CREATE ORGANIZATION-USER - Full Request Body
 * Method: POST
 * URL: /organization-users
 */
const createOrgUserRequest = {
  userId: "user_789_xyz",
  organizationId: "659f1a2b3c4d5e6f7g8h9i0j",
  role: "team_lead",
  creationReason: "admin_request"
};

/**
 * UPDATE ORGANIZATION-USER - Full Request Body
 * Method: PUT
 * URL: /organization-users/:orgUserId
 */
const updateOrgUserRequest = {
  role: "director",
  updateReason: "promotion"
};

/**
 * DELETE ORGANIZATION - Full Request Body
 * Method: DELETE
 * URL: /organizations/:organizationId
 */
const deleteOrgRequest = {
  deletionReason: "business_closure"
};

/**
 * DELETE ORGANIZATION-USER - Full Request Body
 * Method: DELETE
 * URL: /organization-users/:orgUserId
 */
const deleteOrgUserRequest = {
  deletionReason: "termination"
};

// ==================== TEST DATA WITH VARIATIONS ====================

/**
 * Minimal CREATE ORGANIZATION (only required fields)
 */
const minimalCreateOrgRequest = {
  organizationName: "Startup Corp",
  creationReason: "new_organization"
};

/**
 * Minimal CREATE ORGANIZATION-USER
 */
const minimalCreateOrgUserRequest = {
  userId: "user_001",
  organizationId: "org_001",
  role: "member",
  creationReason: "admin_request"
};

/**
 * UPDATE with minimal changes
 */
const minimalUpdateOrgRequest = {
  organizationName: "Startup Corporation",
  updateReason: "error_correction"
};

/**
 * Reasons for ORGANIZATION - All possible values
 */
const allOrganizationReasons = {
  creation: ["new_organization", "merger", "acquisition", "reorganization", "admin_request", "other"],
  update: ["rebranding", "contact_info_update", "role_change", "error_correction", "admin_request", "compliance_update"],
  deletion: ["business_closure", "deactivation_request", "legal_issue", "admin_decision", "other"]
};

/**
 * Reasons for ORGANIZATION-USER - All possible values
 */
const allOrgUserReasons = {
  creation: ["admin_request", "direct_hire", "transfer", "special_assignment", "other"],
  update: ["promotion", "role_change", "department_transfer", "admin_request", "other"],
  deletion: ["resignation", "termination", "transfer", "reorganization", "other"]
};

module.exports = {
  // Param objects
  createOrganizationParams,
  updateOrganizationParams,
  deleteOrganizationParams,
  createOrgUserParams,
  updateOrgUserParams,
  deleteOrgUserParams,
  
  // Full request bodies
  createOrgRequest,
  updateOrgRequest,
  createOrgUserRequest,
  updateOrgUserRequest,
  deleteOrgRequest,
  deleteOrgUserRequest,
  
  // Minimal requests
  minimalCreateOrgRequest,
  minimalCreateOrgUserRequest,
  minimalUpdateOrgRequest,
  
  // All reasons
  allOrganizationReasons,
  allOrgUserReasons
};
