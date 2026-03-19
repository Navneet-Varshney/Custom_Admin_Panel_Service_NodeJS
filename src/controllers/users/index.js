const { blockUser } = require("./block-user.controller");
const { unblockUser } = require("./unblock-user.controller");

const userControllers = {
  blockUser,
  unblockUser
};

module.exports = {
  ...userControllers,
  userControllers
};
