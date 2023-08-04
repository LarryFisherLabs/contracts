const Coins = artifacts.require("Coins");
const Ants = artifacts.require("Ants");
// const TestBitDao = artifacts.require("TestBitDao");

// !!! OPTIONALLY HARD-CODE COIN ADDRESS !!!
// const COIN_ADDRESS = null

module.exports = async function(deployer) {
  await deployer.deploy(Coins);
  const coinInstance = await Coins.deployed();
  await deployer.deploy(Ants, coinInstance.address);

  // !!! OPTIONALLY HARD-CODE COIN ADDRESS !!!
  // await deployer.deploy(Ants, COIN_ADDRESS);
  
  // await deployer.deploy(TestBitDao);
};
