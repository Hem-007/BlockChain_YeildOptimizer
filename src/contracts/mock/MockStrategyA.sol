// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC20} from "../interfaces/IERC20.sol";
import {IMockStrategy} from "../interfaces/IMockStrategy.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title MockStrategyA
 * @author YieldHarbor Team
 * @notice A mock yield strategy contract for demonstration purposes.
 * It simulates holding assets and generating yield.
 */
contract MockStrategyA is IMockStrategy, Ownable {
    using SafeERC20 for IERC20;

    IERC20 public immutable override asset;
    address public immutable override vault; // Address of the YieldHarborVault

    string public override name;
    uint256 public currentAPY; // e.g., 500 for 5.00%
    uint256 public balanceHeldForVault; // Assets this strategy holds for the vault

    /**
     * @param _asset The address of the ERC20 token this strategy manages (e.g., HBT).
     * @param _vault The address of the YieldHarborVault contract.
     * @param _initialApy The initial APY for this strategy (e.g., 525 for 5.25%).
     * @param _name The name of this strategy (e.g., "Alpha Staking Strategy").
     * @param _initialOwner The owner of this strategy contract.
     */
    constructor(
        address _asset,
        address _vault,
        uint256 _initialApy,
        string memory _name,
        address _initialOwner
    ) Ownable(_initialOwner) {
        require(_asset != address(0), "MockStrategyA: Asset address cannot be zero");
        require(_vault != address(0), "MockStrategyA: Vault address cannot be zero");
        asset = IERC20(_asset);
        vault = _vault;
        currentAPY = _initialApy;
        name = _name;
    }

    /**
     * @notice Called by the Vault to deposit assets into this strategy.
     * The Vault must have approved this strategy to pull `_amount` of `asset`.
     * @param _amount The amount of asset tokens to deposit from the Vault.
     */
    function depositToStrategy(uint256 _amount) external override {
        require(msg.sender == vault, "MockStrategyA: Caller must be the vault");
        require(_amount > 0, "MockStrategyA: Deposit amount must be > 0");
        
        // Strategy pulls funds from the vault. Vault must have called approve() on asset for this contract.
        asset.safeTransferFrom(msg.sender, address(this), _amount); // msg.sender is the vault
        balanceHeldForVault += _amount;
        
        emit StrategyDeposited(vault, _amount);
    }

    /**
     * @notice Called by the Vault to withdraw assets from this strategy.
     * Transfers `_amount` of asset tokens back to the Vault.
     * @param _amount The amount of asset tokens to withdraw to the Vault.
     */
    function withdrawFromStrategy(uint256 _amount) external override {
        require(msg.sender == vault, "MockStrategyA: Caller must be the vault");
        require(_amount > 0, "MockStrategyA: Withdraw amount must be > 0");
        require(balanceHeldForVault >= _amount, "MockStrategyA: Insufficient balance for withdrawal");
        
        balanceHeldForVault -= _amount;
        asset.safeTransfer(vault, _amount); // Transfer assets back to the vault

        emit StrategyWithdrew(vault, _amount);
    }

    /**
     * @notice Returns the amount of assets this strategy currently holds on behalf of the Vault.
     */
    function balanceOfVault() external view override returns (uint256) {
        return balanceHeldForVault;
    }

    /**
     * @notice Returns the current APY of this strategy.
     */
    function getAPY() external view override returns (uint256) {
        return currentAPY;
    }

    /**
     * @notice Allows the owner to update the APY for simulation purposes.
     * @param _newAPY The new APY (e.g., 600 for 6.00%).
     */
    function setAPY(uint256 _newAPY) external onlyOwner {
        currentAPY = _newAPY;
        emit APYUpdated(_newAPY);
    }

    /**
     * @notice Allows the owner to simulate yield by directly setting the balance.
     * This is a mock function. In a real strategy, yield would accrue naturally or via external calls.
     * The Vault would then call `reportStrategyPerformance` on itself after this balance update
     * has been reflected in the strategy.
     * @param _newBalance The new total balance held by the strategy for the vault.
     */
    function updateBalanceWithSimulatedYield(uint256 _newBalance) external onlyOwner {
        balanceHeldForVault = _newBalance;
        emit BalanceUpdatedForYield(_newBalance);
    }
}
