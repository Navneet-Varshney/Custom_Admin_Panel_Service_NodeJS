const { createAdmin } = require("./create-admin.controller");
const { createClient } = require("./create-user.controller");
const { convertUserToClient } = require("./convert-user-to-client.controller");

const adminControllers = {
    createAdmin,
    createClient,
    convertUserToClient
}

module.exports = {
    adminControllers
}