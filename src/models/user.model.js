const mongoose = require("mongoose");
const { firstNameLength, notesFieldLength } = require("@configs/fields-length.config");
const { FirstNameFieldSetting, UserTypes, ClientStatus } = require("@configs/enums.config");
const { BlockUserReasons, UnblockUserReasons, ClientRevertReasons, ClientCreationReasons, ConvertUserToClientReasons } = require("@configs/reasons.config");
const { firstNameRegex, customIdRegex } = require("@configs/regex.config");
const { FIRST_NAME_SETTING } = require("@configs/security.config");
const { DB_COLLECTIONS } = require("@/configs/db-collections.config");

/* User Schema */
const userSchema = new mongoose.Schema({
    userId: {
        type: String,
        unique: true,
        immutable: true,
        validate: {
            validator: function(v) {
                // All IDs now use USR prefix - unified pattern
                return customIdRegex.test(v);
            },
            message: 'userId must match USR format (USR0000000)'
        },
        index: true
    },
    firstName: {
        type: String,
        trim: true,
        minlength: firstNameLength.min,
        maxlength: firstNameLength.max,
        match: firstNameRegex
    },
    userType: {
        type: String,
        enum: Object.values(UserTypes),
        default: UserTypes.USER,
        index: true
    },
    clientStatus: {
        type: String,
        enum: Object.values(ClientStatus),
        default: null,
        index: true
    },
    convertedToClientBy: {
        type: String,
        default: null,
        match: customIdRegex
    },
    convertedToClientAt: {
        type: Date,
        default: null
    },
    clientCreationReason: {
        type: String,
        enum: [...Object.values(ClientCreationReasons), ...Object.values(ConvertUserToClientReasons)],
        default: null
    },
    clientRevertReason: {
        type: String,
        enum: Object.values(ClientRevertReasons),
        default: null
    },
    clientRevertedBy: {
        type: String,
        default: null,
        match: customIdRegex
    },
    clientRevertedAt: {
        type: Date,
        default: null
    },
    isBlocked: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
    blockReason: { type: String, enum: Object.values(BlockUserReasons), default: null },
    blockedBy: { type: String, default: null, match: customIdRegex },
    blockCount: { type: Number, default: 0 },
    unblockReason: { type: String, enum: Object.values(UnblockUserReasons), default: null },
    unblockedBy: { type: String, default: null, match: customIdRegex },
    blockedAt: { type: Date, default: null },
    unblockedAt: { type: Date, default: null }
}, { timestamps: true, versionKey: false });

/* 🔐 Conditional Validator */
// FIX 1: Remove 'next' from the arguments
userSchema.pre("validate", function () {

    // 1. FirstName Field Validation
    if (FIRST_NAME_SETTING === FirstNameFieldSetting.DISABLED && this.firstName != null) {
        this.invalidate("firstName", "First Name field is disabled and must not be provided.");
    }
    else if (FIRST_NAME_SETTING === FirstNameFieldSetting.MANDATORY) {
        if (!this.firstName || (typeof this.firstName === 'string' && this.firstName.trim().length === 0)) {
            this.invalidate("firstName", "First Name is required as per configuration.");
        }
    }

    // 2. Block/Unblock Validation
    if (this.isBlocked) {
        if (!this.blockReason || !this.blockedBy) {
            this.invalidate("blockReason", "Blocked users must have blockReason and blockedBy.");
        }
    } else {
        if (this.unblockReason && !this.unblockedBy) {
            this.invalidate("unblockedBy", "Unblocked users must have unblockedBy when unblockReason is set.");
        }
    }

    // 3. Client Status Validation
    if (this.userType === UserTypes.CLIENT) {
        if (!this.clientStatus) {
            this.invalidate("clientStatus", "Client users must have a clientStatus.");
        }
        if (!this.convertedToClientBy || !this.convertedToClientAt) {
            this.invalidate("convertedToClientBy", "Client users must have convertedToClientBy and convertedToClientAt.");
        }
        if (!this.clientCreationReason) {
            this.invalidate("clientCreationReason", "Client users must have a clientCreationReason.");
        }
    } else {
        if (this.clientStatus) {
            this.invalidate("clientStatus", "Only CLIENT userType can have clientStatus.");
        }
    }

    if (this.isBlocked && !this.blockedAt) {
        this.blockedAt = new Date();
    }

    if (!this.isBlocked && this.unblockReason && !this.unblockedAt) {
        this.unblockedAt = new Date();
    }

    if (this.clientRevertReason && !this.convertedToClientAt) {
        this.invalidate("clientRevertReason", "Cannot revert a user who was never converted to client.");
    }

    if (this.userType !== UserTypes.CLIENT) {
        this.clientStatus = null;
    }

    // FIX 2: Remove next() call
});

// FIX 3: Remove 'next' argument and next() call here too
userSchema.pre("save", function () {
    if (this.isModified("isBlocked")) {
        if (this.isBlocked) {
            this.blockCount += 1;
            this.blockedAt = new Date();
        } else {
            this.unblockedAt = new Date();
        }
    }
});

// Creating a Collection named Users that will Include User Documents / Records
// module.exports convert the whole file into a Module
module.exports = {
    UserModel: mongoose.model(DB_COLLECTIONS.USERS, userSchema)
};
// By Default Mongoose Convert User into Plural Form i.e Users