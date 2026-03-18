const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Deploying Army Ants contracts to Holesky testnet...");
  
  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying contracts with account:", deployer.address);
  
  const balance = await deployer.getBalance();
  console.log("💰 Account balance:", ethers.utils.formatEther(balance), "HOL");

  // Deploy Coins contract
  console.log("\n📀 Deploying Coins contract...");
  const Coins = await ethers.getContractFactory("Coins");
  const coins = await Coins.deploy();
  await coins.deployed();
  console.log("✅ Coins deployed to:", coins.address);

  // Deploy Ants contract  
  console.log("\n🐜 Deploying Ants contract...");
  const Ants = await ethers.getContractFactory("Ants");
  const ants = await Ants.deploy();
  await ants.deployed();
  console.log("✅ Ants deployed to:", ants.address);

  // Deploy test token (if needed)
  console.log("\n🪙 Deploying Test Token...");
  const TestBitDao = await ethers.getContractFactory("TestBitDao");
  const testToken = await TestBitDao.deploy();
  await testToken.deployed();
  console.log("✅ TestBitDao deployed to:", testToken.address);

  // Output deployment summary
  console.log("\n📋 Deployment Summary for Holesky:");
  console.log("================================");
  console.log(`Coins (og):     ${coins.address}`);
  console.log(`Ants (og):      ${ants.address}`);
  console.log(`TestBitDao:     ${testToken.address}`);
  console.log(`Network:        Holesky (17000)`);
  console.log(`Deployer:       ${deployer.address}`);
  
  // Update frontend constants reminder
  console.log("\n⚠️  IMPORTANT: Update the following files with new addresses:");
  console.log("- frontend/src/utils/json-constants/networkInfo.js");
  console.log("- shared/constants/networks.js");
  
  // Verification commands
  console.log("\n🔍 To verify contracts on Etherscan, run:");
  console.log(`npx hardhat verify --network holesky ${coins.address}`);
  console.log(`npx hardhat verify --network holesky ${ants.address}`);
  console.log(`npx hardhat verify --network holesky ${testToken.address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });