// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/IERC20.sol";

/**
 * @title HarborToken (HBT)
 * @dev This is a standard ERC20 token that will be used for deposits in the YieldHarborVault.
 * The owner (deployer) can mint tokens to distribute for testing.
 */
contract HarborToken is ERC20, Ownable {
    /**
     * @dev Constructor that sets the token name and symbol.
     * The initial supply is 0. Owner needs to mint tokens.
     * @param _initialOwner The address that will initially own this contract.
     */
    constructor(address _initialOwner) ERC20("Harbor Token", "HBT") Ownable(_initialOwner) {
        // Decimals are 18 by default in OpenZeppelin's ERC20 contract.
    }

    /**
     * @dev Creates `amount` tokens and assigns them to `account`, increasing
     * the total supply.
     *
     * Requirements:
     *
     * - `account` cannot be the zero address.
     * - The caller must be the owner of the contract.
     * @param account The address that will receive the minted tokens.
     * @param amount The amount of tokens to mint.
     */
    function mint(address account, uint256 amount) public onlyOwner {
        require(account != address(0), "ERC20: mint to the zero address");
        _mint(account, amount);
    }

    // The functions below are inherited from OpenZeppelin's ERC20 and Ownable contracts:
    // - name()
    // - symbol()
    // - decimals()
    // - totalSupply()
    // - balanceOf(address account)
    // - transfer(address recipient, uint256 amount)
    // - allowance(address owner, address spender)
    // - approve(address spender, uint256 amount)
    // - transferFrom(address sender, address recipient, uint256 amount)
    // - increaseAllowance(address spender, uint256 addedValue)
    // - decreaseAllowance(address spender, uint256 subtractedValue)
    // - owner()
    // - renounceOwnership()
    // - transferOwnership(address newOwner)
}
