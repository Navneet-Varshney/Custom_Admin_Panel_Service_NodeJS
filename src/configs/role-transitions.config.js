const { AdminTypes } = require("./enums.config");

module.exports = {
    ROLE_TRANSITIONS: {
        USER: { 
            CLIENT: [AdminTypes.SUPER_ADMIN, AdminTypes.ORG_ADMIN, AdminTypes.OPERATIONS_ADMIN],
            ADMIN: [AdminTypes.SUPER_ADMIN]
        },

        CLIENT: {
            USER: [AdminTypes.SUPER_ADMIN, AdminTypes.ORG_ADMIN],
            ADMIN: [AdminTypes.SUPER_ADMIN]
        },

        ADMIN: {
            CLIENT: [AdminTypes.SUPER_ADMIN],
            USER: [AdminTypes.SUPER_ADMIN]
        }
    }
};