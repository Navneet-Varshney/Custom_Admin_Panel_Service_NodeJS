const { ActivityTrackerModel } = require("./activity-tracker.model");
const { AdminModel } = require("./admin.model");
const { ServiceTrackerModel } = require("./service-tracker.model");
const { DeviceModel } = require("./device.model")

const models = {
    ActivityTrackerModel,
    AdminModel,
    ServiceTrackerModel,
    DeviceModel
}

module.exports = {
    ...models
}