// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const { ethers } = require("hardhat");
const config = require("../src/config.json");

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), "ether");
};

const wait = (seconds) => {
  const milliseconds = seconds * 1000;
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
};

async function main() {
  //Fetch accounts from wallet - these are unlocked
  const accounts = await ethers.getSigners();
  //Fetch network
  const { chainId } = await ethers.provider.getNetwork();
  console.log("Using chainId:", chainId);

  //Fetch deployed tokens
  const shr = await ethers.getContractAt("Token", config[chainId].shr.address);
  console.log(`Shard Token fetched: ${shr.address}`);

  const mETH = await ethers.getContractAt(
    "Token",
    config[chainId].mETH.address
  );
  console.log(`mETH Token fetched: ${mETH.address}`);

  const mDAI = await ethers.getContractAt(
    "Token",
    config[chainId].mDAI.address
  );
  console.log(`mDAI Token fetched: ${mDAI.address}`);

  //Fetch deployed exchange
  const exchange = await ethers.getContractAt(
    "Exchange",
    config[chainId].exchange.address
  );
  console.log(`Exchange fetched: ${exchange.address}`);

  //Give tokens to account[1]
  const sender = accounts[0];
  const receiver = accounts[1];
  let amount = tokens(10000);

  //User1 transfers 10k mETH
  let transaction, result;

  transaction = await mETH.connect(sender).transfer(receiver.address, amount);
  console.log(
    `Transferred ${amount} tokens from ${sender.address} to ${receiver.address}\n`
  );
  //Set up exchange users
  const user1 = accounts[0];
  const user2 = accounts[1];
  amount = tokens(10000);

  //User1 approves 10k Shard Tokens
  transaction = await shr.connect(user1).approve(exchange.address, amount);
  await transaction.wait();
  console.log(`Approved ${amount} tokens from ${user1.address}`);

  //User1 deposits 10k Shard Tokens
  transaction = await exchange.connect(user1).depositToken(shr.address, amount);
  await transaction.wait();
  console.log(`Deposited ${amount} of Shard tokens from ${user1.address}\n`);

  //User2 approves mETH
  transaction = await mETH.connect(user2).approve(exchange.address, amount);
  await transaction.wait();
  console.log(`Approved ${amount} mETH tokens from ${user2.address}\n`);

  //User2 deposits mETH
  transaction = await exchange
    .connect(user2)
    .depositToken(mETH.address, amount);
  await transaction.wait();
  console.log(`Deposited ${amount} of mETH tokens from ${user2.address}\n`);

  //Seed new orders
  let orderId;
  transaction = await exchange
    .connect(user1)
    .makeOrder(mETH.address, tokens(100), shr.address, tokens(5));
  result = await transaction.wait();
  console.log(`Made order from ${user1.address}`);

  //Seed a cancelled orders
  orderId = result.events[0].args.id;
  transaction = await exchange.connect(user1).cancelOrder(orderId);
  result = await transaction.wait();
  console.log(`Cancelled order from ${user1.address}\n`);

  //Wait 1 second
  await wait(1);

  //Seed filled orders
  //User1 makes order
  transaction = await exchange
    .connect(user1)
    .makeOrder(mETH.address, tokens(100), shr.address, tokens(10));
  result = await transaction.wait();
  console.log(`Made order from ${user1.address}`);

  //User2 fills order
  orderId = result.events[0].args.id;
  transaction = await exchange.connect(user2).fillOrder(orderId);
  result = await transaction.wait();
  console.log(`Filled order from ${user2.address}\n`);

  //Wait 1 second
  await wait(1);

  //User1 makes another order
  transaction = await exchange
    .connect(user1)
    .makeOrder(mETH.address, tokens(50), shr.address, tokens(15));
  result = await transaction.wait();
  console.log(`Made order from ${user1.address}`);

  //User2 fills order
  orderId = result.events[0].args.id;
  transaction = await exchange.connect(user2).fillOrder(orderId);
  result = await transaction.wait();
  console.log(`Filled order from ${user2.address}\n`);

  //Wait 1 second
  await wait(1);

  //Seed open orders

  //User1 makes 10 orders

  for (let i = 1; i <= 10; i++) {
    transaction = await exchange
      .connect(user1)
      .makeOrder(mETH.address, tokens(10 * i), shr.address, tokens(10));
    result = await transaction.wait();
    console.log(`Made order from ${user1.address}`);

    await wait(1);
  }

  //User2 makes 10 orders
  for (let i = 1; i <= 10; i++) {
    transaction = await exchange
      .connect(user2)
      .makeOrder(shr.address, tokens(10), mETH.address, tokens(10 * i));
    result = await transaction.wait();
    console.log(`Make order from ${user2.address}`);

    await wait(1);
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
