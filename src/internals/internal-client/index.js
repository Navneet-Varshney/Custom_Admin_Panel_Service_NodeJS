/**
 * Internal Client Exports
 * 
 * @author Admin Panel Service Team
 * @date 2026-03-04
 */

const guard = require('../microservice.guard');
if (!guard) {
    module.exports = null;
    return;
}

const authClient = require('./custom-auth-service.client');
const softwareManagementClient = require('./software-management.client');

module.exports = {
    authClient,
    softwareManagementClient
};