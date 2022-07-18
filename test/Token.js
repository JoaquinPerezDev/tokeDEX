const { expect } = require("chai");
const { ethers } = require("hardhat");

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), "ether");
};
describe("Token contract", () => {
  let token, 
      accounts, 
      deployer

  beforeEach(async () => {
    // Code goes here...
    const Token = await ethers.getContractFactory("Token");
    token = await Token.deploy("Riderian", "RIDE", "1000000");
    accounts = await ethers.getSigners();
    deployer = accounts[0];
  });

  describe("Deployment", () => {
    const name = "Riderian";
    const symbol = "RIDE";
    const decimals = "18";
    const totalSupply = tokens("1000000");


    it("Has correct name", async () => {
      //Check that name is correct
      expect(await token.name()).to.equal(name);
    });
    it("Has correct symbol", async () => {
      //Check that name is correct
      expect(await token.symbol()).to.equal(symbol);
    });
    it("Has correct decimals", async () => {
      //Check that name is correct
      expect(await token.decimals()).to.equal(decimals);
    });
    it("Has correct total supply", async () => {
      //Check that name is correct
      expect(await token.totalSupply()).to.equal(totalSupply);
    });
    it("assigns total supply to deployer", async () => {
      //Check that name is correct
      expect(await token.balanceOf(deployer.address)).to.equal(totalSupply);
    });
  });
});
