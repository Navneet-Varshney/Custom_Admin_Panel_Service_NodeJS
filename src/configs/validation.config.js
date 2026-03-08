const {
    strongPasswordRegex,
    phoneNumberRegex,
    emailRegex,
    customIdRegex
} = require("./regex.config");

const {
    passwordLength,
    phoneNumberLength,
    emailLength,
    customIdLength
} = require("./fields-length.config");

const {
    AdminTypesHelper,
    AdminRoleTypesHelper,
    ClientRoleTypesHelper,
    AdminCreationReasonsHelper,
    ClientCreationReasonsHelper,
    ConvertUserToClientReasonsHelper
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
    },
    convertReason: {
        enum: ConvertUserToClientReasonsHelper
    },
    userId: {
        length: customIdLength,
        regex: customIdRegex
    }
};

module.exports = {
    validationRules
};