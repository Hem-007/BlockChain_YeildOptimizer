
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title HarborToken
 * @dev A simple ERC20 token for the YieldHarbor platform.
 * The owner can mint initial tokens.
 */
contract HarborToken is ERC20, Ownable {
    constructor(address initialOwner) ERC20("Harbor Token", "HBT") Ownable(initialOwner) {
        // Mint an initial supply to the contract deployer (owner) for distribution/testing
        // For example, 1 million tokens
        _mint(initialOwner, 1000000 * (10**decimals()));
    }

    /**
     * @dev Allows the owner to mint more tokens.
     * This is primarily for testing or controlled supply expansion.
     * In a real DeFi scenario, minting mechanics would be carefully designed.
     * @param to The address to mint tokens to.
     * @param amount The amount of tokens to mint.
     */
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
}

/**
 * @dev Minimal ERC20 interface for OpenZeppelin contracts.
 * We need to ensure this path is resolvable by the Solidity compiler.
 * For local development with Hardhat/Truffle, this would be `npm install @openzeppelin/contracts`.
 * In this generated structure, we assume these files are available.
 */
