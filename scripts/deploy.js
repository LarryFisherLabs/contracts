// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function main() {
  denyList = await hre.ethers.deployContract("DenyList");
  await denyList.waitForDeployment();
  console.log(`Deployed to ${denyList.target}`);

  // sepolia
  // const denyAddy = "0x3233713EaC18845dCFdDcB3807AFa4c0BAb4937B";
  const denyAddy = denyList.target;
  const coins = await hre.ethers.deployContract("Coins", [denyAddy]);
  await coins.waitForDeployment();
  console.log(`Deployed to ${coins.target}`);

  const coinAddy = coins.target;
  const ants = await hre.ethers.deployContract("Ants", [coinAddy, denyAddy]);
  await ants.waitForDeployment();
  console.log(`Deployed to ${ants.target}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
