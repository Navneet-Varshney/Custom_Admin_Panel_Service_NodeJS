const { listOrgUsersController } = require('./list-org-users.controller');
const { deleteOrgUserController } = require('./delete-org-user.controller');
const { disableOrgUserController } = require('./disable-org-user.controller');
const { enableOrgUserController } = require('./enable-org-user.controller');
const { createOrgUserController } = require("./create-org-user.controller");
const { updateOrgUserController } = require("./update-org-user.controller")
const { getOrgUserController } = require("./get-org-user.controller")

const orgUserControllers = {
    listOrgUsersController,
    deleteOrgUserController,
    disableOrgUserController,
    enableOrgUserController,
    createOrgUserController,
    updateOrgUserController,
    getOrgUserController
}

module.exports = {
    orgUserControllers
}
