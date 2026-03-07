const {
    strongPasswordRegex,
    phoneNumberRegex,
    emailRegex
} = require("./regex.config");

const {
    passwordLength,
    phoneNumberLength,
    emailLength
} = require("./fields-length.config");

const {
    AdminTypesHelper,
    AdminRoleTypesHelper,
    ClientRoleTypesHelper,
    AdminCreationReasonsHelper,
    ClientCreationReasonsHelper
} = require("@utils/enum-validators.util");

const validationRules = {
    password: {
        regex: strongPasswordRegex,
        length: passwordLength
    },
    phone: {
        length: phoneNumberLength,
        regex: phoneNumberRegex
    },
    email: {
        length: emailLength,
        regex: emailRegex
    },
    adminType: {
        enum: AdminTypesHelper
    },
    adminRole: {
        enum: AdminRoleTypesHelper
    },
    clientRole: {
        enum: ClientRoleTypesHelper
    },
    adminCreationReason: {
        enum: AdminCreationReasonsHelper
    },
    clientCreationReason: {
        enum: ClientCreationReasonsHelper
    }
};

module.exports = {
    validationRules
};