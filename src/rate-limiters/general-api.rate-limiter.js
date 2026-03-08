// middlewares/rate-limiters/apiRateLimiters.js
const { createRateLimiter } = require("./create.rate-limiter");
const { perUserAndDevice } = require("@configs/rate-limit.config");

module.exports = {
    createAdminRateLimiter: createRateLimiter(perUserAndDevice.createAdmin),
    createClientRateLimiter: createRateLimiter(perUserAndDevice.createClient),
    convertUserToClientRateLimiter: createRateLimiter(perUserAndDevice.convertUserToClient)
}