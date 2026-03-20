const mongoose = require("mongoose");
const { firstNameLength } = require("@configs/fields-length.config");
const { AdminTypes, FirstNameFieldSetting } = require("@configs/enums.config");
const { ActivationReasons, DeactivationReasons, UnsuspensionReasons, SuspensionReasons, BlockAdminReasons, UnblockAdminReasons } = require("@/configs/reasons.config");
const { firstNameRegex, customIdRegex } = require("@configs/regex.config");
const { FIRST_NAME_SETTING } = require("@configs/security.config");
const { DB_COLLECTIONS } = require("@/configs/db-collections.config");

/* Admin Schema */
const adminSchema = new mongoose.Schema({

    adminId: {
        type: String,
        unique: true,
        immutable: true,
        match: customIdRegex,
        index: true
    },

    firstName: {
        type: String,
        trim: true,
        minlength: firstNameLength.min,
        maxlength: firstNameLength.max,
        match: firstNameRegex
    },

    /* ---------------- Activation Lifecycle ---------------- */

    isDeleted: {
        type: Boolean,
        default: false
    },

    isActive: {
        type: Boolean,
        default: true
    },

    activatedBy: {
        type: String,
        match: customIdRegex,
        default: null
    },

    deactivatedBy: {
        type: String,
        match: customIdRegex,
        default: null
    },

    lastActivatedReason: {
        type: String,
        default: null,
        enum: Object.values(ActivationReasons)
    },

    lastDeactivatedReason: {
        type: String,
        default: null,
        enum: Object.values(DeactivationReasons)
    },

    /* ---------------- Suspension Lifecycle ---------------- */

    isSuspended: {
        type: Boolean,
        default: false
    },

    suspendedAt: {
        type: Date,
        default: null
    },

    suspendedBy: {
        type: String,
        match: customIdRegex,
        default: null
    },

    lastSuspensionReason: {
        type: String,
        default: null,
        enum: Object.values(SuspensionReasons)
    },

    unsuspendedAt: {
        type: Date,
        default: null
    },

    unsuspendedBy: {
        type: String,
        match: customIdRegex,
        default: null
    },

    lastUnsuspensionReason: {
        type: String,
        default: null,
        enum: Object.values(UnsuspensionReasons)
    },

    suspensionCount: {
        type: Number,
        default: 0
    },

    /* ---------------- Block Lifecycle ---------------- */

    isBlocked: {
        type: Boolean,
        default: false
    },

    blockedAt: {
        type: Date,
        default: null
    },

    blockedBy: {
        type: String,
        match: customIdRegex,
        default: null
    },

    lastBlockReason: {
        type: String,
        enum: Object.values(BlockAdminReasons),
        default: null
    },

    blockCount: {
        type: Number,
        default: 0
    },

    unblockedAt: {
        type: Date,
        default: null
    },

    unblockedBy: {
        type: String,
        match: customIdRegex,
        default: null
    },

    lastUnblockReason: {
        type: String,
        default: null,
        enum: Object.values(UnblockAdminReasons)
    },

    /* ---------------- Governance Hierarchy ---------------- */

    adminType: {
        type: String,
        enum: Object.values(AdminTypes),
        default: AdminTypes.INTERNAL_ADMIN
    },

    supervisorId: {
        type: String,
        match: customIdRegex,
        default: null
    },

    createdBy: {
        type: String,
        default: null,
        match: customIdRegex
    },

    updatedBy: {
        type: String,
        match: customIdRegex,
        default: null
    }

}, { timestamps: true, versionKey: false });

/* 🔐 Centralized Validation Hook */

adminSchema.pre("validate", function () {

    if (!this.isNew && this.isModified("isActive") && this.isActive) {
        if (!this.activatedBy || !this.lastActivatedReason) {
            throw new Error(
                "Activation must include activatedBy and lastActivatedReason."
            );
        }
    }

    if (!this.isSuspended && this.isModified("isSuspended")) {
        if (!this.unsuspendedBy || !this.lastUnsuspensionReason) {
            throw new Error("Unsuspension must include unsuspendedBy and lastUnsuspensionReason.");
        }
    }

    if (!this.isBlocked && this.isModified("isBlocked")) {
        if (!this.unblockedBy || !this.lastUnblockReason) {
            throw new Error("Unblock must include unblockedBy and lastUnblockReason.");
        }
    }

    if (!this.isActive  && this.isModified("isActive")) {
        if (!this.deactivatedBy || !this.lastDeactivatedReason) {
            throw new Error("Deactivated admins must include deactivatedBy and lastDeactivatedReason.");
        }
    }

    if (this.isSuspended && this.isBlocked) {
        throw new Error("Admin cannot be both suspended and blocked simultaneously.");
    }

    if (this.isSuspended) {
        if (!this.lastSuspensionReason || !this.suspendedBy) {
            throw new Error("Suspended admins must have lastSuspensionReason and suspendedBy.");
        }
    }

    if (this.isBlocked) {
        if (!this.lastBlockReason || !this.blockedBy) {
            throw new Error("Blocked admins must have lastBlockReason and blockedBy.");
        }
    }

    /* ---------- FirstName Validation ---------- */

    if (
        FIRST_NAME_SETTING === FirstNameFieldSetting.DISABLED &&
        this.firstName != null
    ) {
        this.invalidate(
            "firstName",
            "First Name field is disabled and must not be provided."
        );
    }

    else if (FIRST_NAME_SETTING === FirstNameFieldSetting.MANDATORY) {
        if (!this.firstName || this.firstName.trim().length === 0) {
            this.invalidate(
                "firstName",
                "First Name is required as per configuration."
            );
        }
    }

    /* ---------- Supervisor Validation ---------- */

    if (this.adminType !== AdminTypes.SUPER_ADMIN) {
        if (!this.supervisorId) {
            throw new Error(`supervisorId is required for ${this.adminType} admins.`);
        }
    }

    /* ---------- createdBy Validation ---------- */

    if (this.adminType === AdminTypes.SUPER_ADMIN) {
        if (this.createdBy !== null && this.createdBy !== "SYSTEM") {
            throw new Error("SUPER_ADMIN must have createdBy as null or 'SYSTEM'.");
        }
    } else {
        if (!this.createdBy) {
            throw new Error(`${this.adminType} must have a valid createdBy adminId.`);
        }
    }
});

/* ---------- Suspension / Block Counters ---------- */

adminSchema.pre("save", function () {

    if (this.isModified("isSuspended") && this.isSuspended) {
        this.suspensionCount += 1;
        this.suspendedAt = new Date();
    }

    if (this.isModified("isBlocked") && this.isBlocked) {
        this.blockCount += 1;
        this.blockedAt = new Date();
    }

    if (this.isModified("isBlocked") && !this.isBlocked) {
        this.unblockedAt = new Date();
    }

    if (
        this.isModified("isSuspended") &&
        !this.isSuspended &&
        !this.unsuspendedAt
    ) {
        this.unsuspendedAt = new Date();
    }

    if (
        this.isModified("isBlocked") &&
        !this.isBlocked &&
        !this.unblockedAt
    ) {
        this.unblockedAt = new Date();
    }
});

module.exports = {
    AdminModel: mongoose.model(DB_COLLECTIONS.ADMINS, adminSchema)
};