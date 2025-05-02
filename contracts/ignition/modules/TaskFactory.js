const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("TaskFactoryModule", (m) => {
  // Deploy the TaskFactory contract
  const taskFactory = m.contract("TaskFactory");

  return { taskFactory };
});