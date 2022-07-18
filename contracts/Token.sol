// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

// Import this file to use console.log
import "hardhat/console.sol";

contract Token {
    string public name;
    string public symbol;
    // Add Decimals
    uint256 public decimals = 18;
    // Add Total supply
    uint256 public totalSupply;
    // Track balances
    mapping(address => uint256) public balanceOf;

    // Send tokens

    constructor(
        string memory _name,
        string memory _symbol,
        uint256 _totalSupply
    ) {
        name = _name;
        symbol = _symbol;
        totalSupply = _totalSupply * (10**decimals);
        balanceOf[msg.sender] = totalSupply;
    }
}
