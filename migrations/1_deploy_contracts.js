const DenyList = artifacts.require("DenyList");
const Coins = artifacts.require("Coins");
const Ants = artifacts.require("Ants");
// const TestBitDao = artifacts.require("TestBitDao");

// !!! OPTIONALLY HARD-CODE COIN ADDRESS !!!
// const COIN_ADDRESS = null

module.exports = async function(deployer) {
  await deployer.deploy(DenyList);
  const denyInstance = await DenyList.deployed();
  await deployer.deploy(Coins, denyInstance.address);
  const coinInstance = await Coins.deployed();
  await deployer.deploy(Ants, denyInstance.address, coinInstance.address);

  // !!! OPTIONALLY HARD-CODE COIN ADDRESS !!!
  // await deployer.deploy(Ants, denyInstance.address, COIN_ADDRESS);
  
  // await deployer.deploy(TestBitDao);
};
