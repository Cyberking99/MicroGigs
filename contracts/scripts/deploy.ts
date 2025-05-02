import { ethers } from 'hardhat';

async function main() {
  const taskFactory = await ethers.deployContract('TaskFactory');

  await taskFactory.waitForDeployment();

  console.log('TaskFactory Contract Deployed at ' + taskFactory.target);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});