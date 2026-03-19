const { createOrganizationController } = require('./create-organization.controller');
const { deleteOrganizationController } = require('./delete-organization.controller');
const { disableOrganizationController } = require('./disable-organization.controller');
const { enableOrganizationController } = require('./enable-organization.controller');
const { getOrganizationController } = require("./get-organization.controller");
const { updateOrganizationController } = require("./update-organization.controller")
const { listOrganizationController } = require("./list-organization.controller")

const organizationControllers = {
    createOrganizationController,
    deleteOrganizationController,
    disableOrganizationController,
    enableOrganizationController,
    getOrganizationController,
    updateOrganizationController,
    listOrganizationController
}

module.exports = {
    organizationControllers
}
