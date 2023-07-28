const Coins = artifacts.require("Coins");
const Ants = artifacts.require("Ants");
const TestBitDao = artifacts.require("TestBitDao");

module.exports = async function(deployer) {
  // await deployer.deploy(Coins);
  // const coinInstance = await Coins.deployed();
  // await deployer.deploy(Ants, coinInstance.address);
  await deployer.deploy(TestBitDao);
};
