const { expect } = require("chai");
const { ethers } = require("hardhat");

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), "ether");
};

describe("Exchange", () => {
  let deployer, feeAccount, exchange, accounts, token1, token2, user1, amount;

  const feePercent = 10;

  beforeEach(async () => {
    const Exchange = await ethers.getContractFactory("Exchange");
    const Token = await ethers.getContractFactory("Token");

    token1 = await Token.deploy("Riderian", "RIDE", "1000000");
    token2 = await Token.deploy("mock Dai", "mDAI", "1000000");

    accounts = await ethers.getSigners();
    deployer = accounts[0];
    feeAccount = accounts[1];
    user1 = accounts[2];

    let transaction = await token1
      .connect(deployer)
      .transfer(user1.address, tokens(100));
    await transaction.wait();

    exchange = await Exchange.deploy(feeAccount.address, feePercent);
  });

  describe("Deployment", () => {
    it("tracks the fee account", async () => {
      expect(await exchange.feeAccount()).to.equal(feeAccount.address);
    });
    it("tracks the fee percent", async () => {
      expect(await exchange.feePercent()).to.equal(feePercent);
    });
  });

  describe("Depositing tokens", () => {
    let transaction, result;
    let amount = tokens(10);

    describe("Success", async () => {
      beforeEach(async () => {
        //Approve tokens
        transaction = await token1
          .connect(user1)
          .approve(exchange.address, amount);
        result = await transaction.wait();
        //Deposit tokens
        transaction = await exchange
          .connect(user1)
          .depositToken(token1.address, amount);
        result = await transaction.wait();
      });

      it("Tracks the token deposit", async () => {
        expect(await token1.balanceOf(exchange.address)).to.equal(amount);
        expect(await exchange.tokens(token1.address, user1.address)).to.equal(
          amount
        );
        expect(
          await exchange.balanceOf(token1.address, user1.address)
        ).to.equal(amount);
      });
      it("Emits a deposit event", async () => {
        const event = result.events[1];
        expect(event.event).to.equal("Deposit");

        const args = event.args;
        expect(args.token).to.equal(token1.address);
        expect(args.user).to.equal(user1.address);
        expect(args.amount).to.equal(amount);
        expect(args.balance).to.equal(amount);
      });
    });

    describe("Failure", async () => {
      it("Fails when no tokens are approved", async () => {
        await expect(
          exchange.connect(user1).depositToken(token1.address, amount)
        ).to.be.reverted;
      });
    });
  });

  describe("Withdrawing tokens", () => {
    let transaction, result;
    let amount = tokens(10);

    describe("Success", async () => {
      beforeEach(async () => {
        //Approve tokens
        transaction = await token1
          .connect(user1)
          .approve(exchange.address, amount);
        result = await transaction.wait();
        //Deposit tokens
        transaction = await exchange
          .connect(user1)
          .depositToken(token1.address, amount);
        result = await transaction.wait();

        //Now withdraw tokens
        transaction = await exchange
          .connect(user1)
          .withdrawToken(token1.address, amount);
        result = await transaction.wait();
      });

      it("Withdraws the token funds", async () => {
        expect(await token1.balanceOf(exchange.address)).to.equal(0);
        expect(await exchange.tokens(token1.address, user1.address)).to.equal(
          0
        );
        expect(
          await exchange.balanceOf(token1.address, user1.address)
        ).to.equal(0);
      });
      it("Emits a withdraw event", async () => {
        const event = result.events[1];
        expect(event.event).to.equal("Withdraw");

        const args = event.args;
        expect(args.token).to.equal(token1.address);
        expect(args.user).to.equal(user1.address);
        expect(args.amount).to.equal(amount);
        expect(args.balance).to.equal(0);
      });
    });

    describe("Failure", async () => {
      it("Fails for insufficient balance", async () => {
        await expect(
          exchange.connect(user1).withdrawToken(token1.address, amount)
        ).to.be.reverted;
      });
    });
  });

  describe("Checking balances", () => {
    let transaction, result;
    let amount = tokens(1);

    beforeEach(async () => {
      //Approve tokens
      transaction = await token1
        .connect(user1)
        .approve(exchange.address, amount);
      result = await transaction.wait();
      //Deposit tokens
      transaction = await exchange
        .connect(user1)
        .depositToken(token1.address, amount);
      result = await transaction.wait();
    });
    it("Returns user balance", async () => {
      expect(await exchange.balanceOf(token1.address, user1.address)).to.equal(
        amount
      );
    });
  });
  describe("Making orders", () => {
    let transaction, result;
    let amount = tokens(1);
    describe("Success", async () => {
      beforeEach(async () => {
        //Approve tokens
        transaction = await token1
          .connect(user1)
          .approve(exchange.address, amount);
        result = await transaction.wait();
        //Deposit tokens
        transaction = await exchange
          .connect(user1)
          .depositToken(token1.address, amount);
        result = await transaction.wait();
        //Make order
        transaction = await exchange
          .connect(user1)
          .makeOrder(token2.address, amount, token1.address, amount);
        result = await transaction.wait();
      });

      it("Tracks the newly created order", async () => {
        expect(await exchange.orderCount()).to.equal(1);
      });
      it("Emits an order event", async () => {
        const event = result.events[0];
        expect(event.event).to.equal("Order");

        const args = event.args;
        expect(args.id).to.equal(1);
        expect(args.user).to.equal(user1.address);
        expect(args.tokenGet).to.equal(token2.address);
        expect(args.amountGet).to.equal(tokens(1));
        expect(args.tokenGive).to.equal(token1.address);
        expect(args.amountGive).to.equal(tokens(1));
        expect(args.timestamp).to.at.least(1);
      });
    });
    describe("Failure", async () => {
      it("Rejects with no balance", async () => {
        await expect(
          exchange
            .connect(user1)
            .makeOrder(token2.address, tokens(1), token1.address, tokens(1))
        ).to.be.reverted;
      });
    });
  });
});
