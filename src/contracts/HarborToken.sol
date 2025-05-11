// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title HarborToken (HBT)
 * @author YieldHarbor Team
 * @notice This is an ERC20 token used within the YieldHarbor platform.
 * It includes an Ownable `mint` function to create new tokens.
 */
contract HarborToken is ERC20, Ownable {
    /**
     * @notice Constructor for the HarborToken.
     * @param initialOwner The address that will initially own the contract and be able to mint.
     */
    constructor(address initialOwner) ERC20("Harbor Token", "HBT") Ownable(initialOwner) {
        // Mint an initial supply to the owner, e.g., 1,000,000 tokens
        // Adjust the amount as needed. Amount is in wei (1 token = 1 * 10^decimals).
        _mint(initialOwner, 1000000 * (10**decimals()));
    }

    /**
     * @notice Creates `amount` new tokens and assigns them to `account`.
     * Only callable by the owner.
     * @param account The address that will receive the new tokens.
     * @param amount The amount of tokens to mint (in wei).
     */
    function mint(address account, uint256 amount) public onlyOwner {
        _mint(account, amount);
    }
}
