const { ethers } = require("hardhat");

async function main() {
  console.log(`Preparing deployment...\n`);
  //Fetch contracts to deploy
  const Token = await ethers.getContractFactory("Token");
  const Exchange = await ethers.getContractFactory("Exchange");

  //Fetch accounts
  const accounts = await ethers.getSigners();

  console.log(
    `Accounts fetched: \n${accounts[0].address}\n${accounts[1].address}\n`
  );

  //Deploy token smart contract for every token we want to generate.
  const shr = await Token.deploy("Shard", "shr", "1000000");
  await shr.deployed();
  console.log(`Shard token deployed to: ${shr.address}`);

  const mETH = await Token.deploy("mETH", "mETH", "1000000");
  await mETH.deployed();
  console.log(`mETH token deployed to: ${mETH.address}`);

  const mDAI = await Token.deploy("mDAI", "mDAI", "1000000");
  await mDAI.deployed();
  console.log(`mDAI token deployed to: ${mDAI.address}`);

  const exchange = await Exchange.deploy(accounts[1].address, 10);
  await exchange.deployed();
  console.log(`Exchange deployed to: ${exchange.address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => (process.exitCode = 0))
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
