const mongoose = require("mongoose");
const { customIdRegex } = require("@configs/regex.config");
const { DB_COLLECTIONS } = require("@/configs/db-collections.config");
const { orgRoleLength } = require("@/configs/fields-length.config");

const organizationUserSchema = new mongoose.Schema({

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: DB_COLLECTIONS.USERS
    },

    organizationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: DB_COLLECTIONS.ORGANIZATIONS,
        required: true
    },

    role: {
        type: String,
        trim: true,
        lowercase: true,
        minlength: orgRoleLength.min,
        maxlength: orgRoleLength.max
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

// Prevent duplicate user-org mapping
organizationUserSchema.index(
    { userId: 1, organizationId: 1 },
    {
        unique: true,
        partialFilterExpression: {
            deletedAt: null
        }
    }
);

/* ---------------- Custom Validations ---------------- */

organizationUserSchema.pre("validate", async function () {

    // deletedAt and deletedBy must exist together
    if ((this.deletedAt && !this.deletedBy) || (!this.deletedAt && this.deletedBy)) {
        throw new Error("deletedAt and deletedBy must be provided together.");
    }

});

module.exports = {
    OrganizationUserModel: mongoose.model(
        DB_COLLECTIONS.ORGANIZATION_USERS,
        organizationUserSchema
    )
};