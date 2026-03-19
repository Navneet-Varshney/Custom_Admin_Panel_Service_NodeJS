const mongoose = require("mongoose");

const { customIdRegex, localNumberRegex, countryCodeRegex, emailRegex, urlRegex } = require("@configs/regex.config");
const { DB_COLLECTIONS } = require("@/configs/db-collections.config");
const { countryCodeLength, localNumberLength, orgNameLength, descriptionLength, urlLength } = require("@/configs/fields-length.config");
const { OrganizationTypes } = require("@/configs/enums.config");


const organizationSchema = new mongoose.Schema({

    organizationName: {
        type: String,
        required: true,
        trim: true,
        minlength: orgNameLength.min,
        maxlength: orgNameLength.max
    },

    orgType: {
        type: String,
        enum: Object.values(OrganizationTypes),
        default: OrganizationTypes.OTHER
    },

    website: {
        type: String,
        trim: true,
        minlength: urlLength.min,
        maxlength: urlLength.max,
        match: urlRegex
    },

    logoUrl: {
        type: String,
        trim: true,
        minlength: urlLength.min,
        maxlength: urlLength.max,
        match: urlRegex
    },

    contactEmail: {
        type: String,
        trim: true,
        lowercase: true,
        match: emailRegex
    },

    contactLocalNumber: {
        type: String,
        trim: true,
        minlength: localNumberLength.min,
        maxlength: localNumberLength.max,
        match: localNumberRegex
    },

    contactCountryCode: {
        type: String,
        trim: true,
        minlength: countryCodeLength.min,
        maxlength: countryCodeLength.max,
        match: countryCodeRegex
    },

    description: {
        type: String,
        trim: true,
        minlength: descriptionLength.min,
        maxlength: descriptionLength.max
    },

    address: {
        city: { type: String, trim: true },
        country: { type: String, trim: true },
        zipCode: { type: String, trim: true }
    },

    taxId: {
        type: String,
        trim: true
    },

    /* ---------------- Status ---------------- */

    isActive: {
        type: Boolean,
        default: true
    },

    deletedAt: {
        type: Date,
        default: null
    },

    deletedBy: {
        type: String,
        match: customIdRegex,
        default: null
    },

    /* ---------------- Admin Info ---------------- */

    createdBy: {
        type: String,
        required: true,
        match: customIdRegex
    },

    updatedBy: {
        type: String,
        match: customIdRegex,
        default: null
    }

}, { timestamps: true, versionKey: false });

/* ---------------- Index ---------------- */

organizationSchema.index({ organizationName: 1 });

/* ---------------- Custom Validations ---------------- */

organizationSchema.pre("validate", async function () {

    // deletedAt and deletedBy must exist together
    if ((this.deletedAt && !this.deletedBy) || (!this.deletedAt && this.deletedBy)) {
        throw new Error("deletedAt and deletedBy must be provided together.");
    }

    // contactLocalNumber and contactCountryCode must exist together
    if (
        (this.contactLocalNumber && !this.contactCountryCode) ||
        (!this.contactLocalNumber && this.contactCountryCode)
    ) {
        throw new Error("contactLocalNumber and contactCountryCode must be provided together.");
    }

});

module.exports = {
    OrganizationModel: mongoose.model(
        DB_COLLECTIONS.ORGANIZATIONS,
        organizationSchema
    )
};