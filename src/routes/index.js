const { INTERNAL_BASE, ADMIN_BASE, ORG_BASE, USER_BASE, DEVICE_BASE, ACTIVITY_TRACKER_BASE } = require("@/configs/uri.config");
const { internalRouter } = require("./internal.routes");
const { adminRouter } = require("./admin.routes");
const { organizationRouter } = require("./organization.routes");
const { userRouter } = require("./user.routes");
const { deviceRouter } = require("./device.routes");
const { activityTrackerRouter } = require("./activity-tracker.routes");

module.exports = (app) => {
  // Internal service-to-service routes (protected by service token)
  app.use(INTERNAL_BASE, internalRouter);
  // Admin routes (protected by JWT token)
  app.use(ADMIN_BASE, adminRouter);
  app.use(ORG_BASE, organizationRouter);
  // User routes (protected by JWT token)
  app.use(USER_BASE, userRouter);
  // Device routes (protected by JWT token)
  app.use(DEVICE_BASE, deviceRouter);
  // Activity Tracker routes (protected by JWT token)
  app.use(ACTIVITY_TRACKER_BASE, activityTrackerRouter);
  // Add other routes here as needed
  // app.use("/api/admins", adminRoutes);
  // app.use("/api/auth", authRoutes);
};