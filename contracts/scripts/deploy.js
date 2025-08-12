const hre = require("hardhat");

async function main() {
  // Get the contract factory
  const SimpleNFTMarketplace = await hre.ethers.getContractFactory("SimpleNFTMarketplace");

  // Deploy the contract
  const nftMarketplace = await SimpleNFTMarketplace.deploy();

  // Wait for the contract to be deployed
  await nftMarketplace.waitForDeployment();

  // Get deployed address
  const contractAddress = await nftMarketplace.getAddress();

  console.log("SimpleNFTMarketplace deployed to:", contractAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
