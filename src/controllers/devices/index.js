const { blockDevice } = require("./block-device.controller");
const { unblockDevice } = require("./unblock-device.controller");

const deviceControllers = {
  blockDevice,
  unblockDevice
};

module.exports = {
  ...deviceControllers,
  deviceControllers
};
