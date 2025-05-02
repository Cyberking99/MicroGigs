const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("TaskEscrowModule", (m) => {
  // Parameters for TaskEscrow deployment
  const taskPoster = m.getParameter("taskPoster", "0x0000000000000000000000000000000000000000");
  const reward = m.getParameter("reward", 0);
  const descriptionHash = m.getParameter("descriptionHash", "0x");
  const deadline = m.getParameter("deadline", 0);

  // Deploy the TaskEscrow contract with constructor arguments
  const taskEscrow = m.contract("TaskEscrow", [taskPoster, reward, descriptionHash, deadline], {
    value: reward, // Send the reward amount as part of the deployment
  });

  return { taskEscrow };
});