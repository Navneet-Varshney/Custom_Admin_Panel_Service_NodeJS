const { INTERNAL_BASE, ADMIN_BASE } = require("@/configs/uri.config");
const { internalRouter } = require("./internal.routes");
const { adminRouter } = require("./admin.routes");

module.exports = (app) => {
  // Internal service-to-service routes (protected by service token)
  app.use(INTERNAL_BASE, internalRouter);
  // Admin routes (protected by JWT token)
  app.use(ADMIN_BASE, adminRouter);

  // Add other routes here as needed
  // app.use("/api/admins", adminRoutes);
  // app.use("/api/auth", authRoutes);
};