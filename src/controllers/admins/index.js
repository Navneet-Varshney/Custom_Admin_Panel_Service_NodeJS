const { createAdmin } = require("./create-admin.controller");
const { createClient } = require("./create-client.controller");
const { convertUserToClient } = require("./convert-user-to-client.controller");
const { blockAdmin } = require("./block-admin.controller");
const { unblockAdmin } = require("./unblock-admin.controller");

const adminControllers = {
    createAdmin,
    createClient,
    convertUserToClient,
    blockAdmin,
    unblockAdmin
}

module.exports = {
    adminControllers
}