const Coins = artifacts.require("Coins");
const Ants = artifacts.require("Ants")

module.exports = async function(deployer) {
  await deployer.deploy(Coins);
  const coinInstance = await Coins.deployed();
  await deployer.deploy(Ants, coinInstance.address);
};
