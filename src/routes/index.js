const internalRoutes = require("./internal.routes");

module.exports = (app) => {
  // Internal service-to-service routes (protected by service token)
  app.use("/internal", internalRoutes);

  // Add other routes here as needed
  // app.use("/api/admins", adminRoutes);
  // app.use("/api/auth", authRoutes);
};