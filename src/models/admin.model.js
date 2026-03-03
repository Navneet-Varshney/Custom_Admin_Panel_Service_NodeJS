const mongoose = require("mongoose");
const { firstNameLength } = require("@configs/fields-length.config");
const { AdminTypes, FirstNameFieldSetting } = require("@configs/enums.config");
const { ActivationReasons, DeactivationReasons, UnsuspensionReasons, SuspensionReasons, BlockAdminReasons, UnblockAdminReasons } = require("@/configs/reasons.config");
const { firstNameRegex, adminIdRegex } = require("@configs/regex.config");
const { FIRST_NAME_SETTING } = require("@configs/security.config");
const { DB_COLLECTIONS } = require("@/configs/db-collections.config");

/* Admin Schema */
const adminSchema = new mongoose.Schema({

    adminId: {
        type: String,
        unique: true,
        immutable: true,
        match: adminIdRegex,
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

    isActive: {
        type: Boolean,
        default: true
    },

    activatedBy: {
        type: String,
        match: adminIdRegex,
        default: null
    },

    deactivatedBy: {
        type: String,
        match: adminIdRegex,
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
        match: adminIdRegex,
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
        match: adminIdRegex,
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
        match: adminIdRegex,
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
        match: adminIdRegex,
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
        match: adminIdRegex,
        default: null
    },

    createdBy: {
        type: String,
        default: null,
        match: adminIdRegex
    },

    updatedBy: {
        type: String,
        match: adminIdRegex,
        default: null
    }

}, { timestamps: true, versionKey: false });

/* 🔐 Centralized Validation Hook */

adminSchema.pre("validate", function (next) {

    if (!this.isNew && this.isModified("isActive") && this.isActive) {
        if (!this.activatedBy || !this.lastActivatedReason) {
            return next(
                new Error(
                    "Activation must include activatedBy and lastActivatedReason."
                )
            );
        }
    }

    if (!this.isSuspended && this.isModified("isSuspended")) {
        if (!this.unsuspendedBy || !this.lastUnsuspensionReason) {
            return next(
                new Error("Unsuspension must include unsuspendedBy and lastUnsuspensionReason.")
            );
        }
    }

    if (!this.isBlocked && this.isModified("isBlocked")) {
        if (!this.unblockedBy || !this.lastUnblockReason) {
            return next(
                new Error("Unblock must include unblockedBy and lastUnblockReason.")
            );
        }
    }

    if (!this.isActive  && this.isModified("isActive")) {
        if (!this.deactivatedBy || !this.lastDeactivatedReason) {
            return next(
                new Error("Deactivated admins must include deactivatedBy and lastDeactivatedReason.")
            );
        }
    }

    if (this.isSuspended && this.isBlocked) {
        return next(
            new Error("Admin cannot be both suspended and blocked simultaneously.")
        );
    }

    if (this.isSuspended) {
        if (!this.lastSuspensionReason || !this.suspendedBy) {
            return next(
                new Error("Suspended admins must have lastSuspensionReason and suspendedBy.")
            );
        }
    }

    if (this.isBlocked) {
        if (!this.lastBlockReason || !this.blockedBy) {
            return next(
                new Error("Blocked admins must have lastBlockReason and blockedBy.")
            );
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
            return next(
                new Error(`supervisorId is required for ${this.adminType} admins.`)
            );
        }
    }

    /* ---------- createdBy Validation ---------- */

    if (this.adminType === AdminTypes.SUPER_ADMIN) {
        if (this.createdBy !== null && this.createdBy !== "SYSTEM") {
            return next(
                new Error("SUPER_ADMIN must have createdBy as null or 'SYSTEM'.")
            );
        }
    } else {
        if (!this.createdBy) {
            return next(
                new Error(`${this.adminType} must have a valid createdBy adminId.`)
            );
        }
    }

    next();
});

/* ---------- Suspension / Block Counters ---------- */

adminSchema.pre("save", function (next) {

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

    next();
});

module.exports = {
    AdminModel: mongoose.model(DB_COLLECTIONS.ADMINS, adminSchema)
};