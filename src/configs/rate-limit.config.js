// configs/rate-limit.config.js

module.exports = {
  perDevice: {
    malformedRequest: {
      maxRequests: 20,
      windowMs: 60 * 1000, // 1 minute
      prefix: "malformed_request",
      reason: "Malformed request",
      message: "Too many malformed requests. Fix your payload and try again later."
    },

    unknownRoute: {
      maxRequests: 10,
      windowMs: 60 * 1000, // 1 minute
      prefix: "unknown_route",
      reason: "Unknown route access",
      message: "Too many invalid or unauthorized requests."
    }

  },

  perUserAndDevice: {
      createAdmin: {
        maxRequests: 50,
        windowMs: 60 * 60 * 1000, // 1 hour
        prefix: "create_admin",
        reason: "Excessive admin creation attempts",
        message: "You have exceeded the maximum number of admin creation attempts. Please try again later."
      },
      createClient: {
        maxRequests: 100,
        windowMs: 60 * 60 * 1000, // 1 hour
        prefix: "create_client",
        reason: "Excessive client creation attempts",
        message: "You have exceeded the maximum number of client creation attempts. Please try again later."
      },
      convertUserToClient: {
        maxRequests: 50,
        windowMs: 60 * 60 * 1000, // 1 hour
        prefix: "convert_user_to_client",
        reason: "Excessive user conversion attempts",
        message: "You have exceeded the maximum number of user conversion attempts. Please try again later."
      }
  }
};