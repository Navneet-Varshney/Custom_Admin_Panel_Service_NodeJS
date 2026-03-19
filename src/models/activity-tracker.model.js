const mongoose = require("mongoose");
const { ACTIVITY_TRACKER_EVENTS } = require("@configs/tracker.config");
const { DeviceTypes, AdminTypes } = require("@configs/enums.config");
const { customIdRegex, UUID_V4_REGEX } = require("@configs/regex.config");
const { DB_COLLECTIONS } = require("@/configs/db-collections.config");
const { descriptionLength } = require("@/configs/fields-length.config");

const activityTrackerSchema = new mongoose.Schema({
  adminId: {
    type: String,
    required: true,
    match: customIdRegex,
    index: true
  },

  eventType: {
    type: String,
    enum: Object.values(ACTIVITY_TRACKER_EVENTS),
    required: true
  },

  deviceUUID: {
    type: String,
    required: true,
    match: UUID_V4_REGEX
  },

  deviceName: {
    type: String,
    default: null
  },

  deviceType: {
    type: String,
    enum: Object.values(DeviceTypes),
    default: null
  },

  performedBy: {
    type: String,
    enum: Object.values(AdminTypes),
    default: AdminTypes.INTERNAL_ADMIN
  },

  description: {
    type: String,
    required: true
  },

  oldData: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },

  newData: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },

  adminActions: {
    type: new mongoose.Schema(
      {
        targetId: {
          type: mongoose.Schema.Types.ObjectId,
          default: null,
        },

        performedOn: {
          type: String,
          enum: Object.values(DB_COLLECTIONS),
          default: null,
        },

        reason: {
          type: String,
          default: null,
        },

        reasonDescription: {
          type: String,
          default: null,
          minlength: descriptionLength.min,
          maxlength: descriptionLength.max,
        },

        queryFilter: {
          type: mongoose.Schema.Types.Mixed,
          default: null,
          select: false
        },

        filter: {
          type: [String],
          validate: {
            validator: function (arr) {
              return arr.every((item) =>
                Object.values(ACTIVITY_TRACKER_EVENTS).includes(item)
              );
            },
            message:
              "Filter must contain valid ACTIVITY_TRACKER_EVENTS",
          },
          default: undefined,
        },
      },
      { _id: false }
    ),
    default: null,
  },
  requestId: {
    type: String,
    required: true,
    match: UUID_V4_REGEX,
    index: true
  }
}, {
  timestamps: true,
  versionKey: false
});

module.exports = {
  ActivityTrackerModel: mongoose.model(DB_COLLECTIONS.ACTIVITY_TRACKERS, activityTrackerSchema)
};