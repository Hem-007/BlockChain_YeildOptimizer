
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// Using the IStrategy interface defined in YieldHarborVault.sol for consistency
interface IStrategy {
    function token() external view returns (address);
    function getAPY() external view returns (uint256);
    function depositToStrategy(uint256 amount) external;
    function withdrawFromStrategy(uint256 amount) external;
    function balanceOfVault() external view returns (uint256);
    function name() external view returns (string);
}

/**
 * @title MockStrategyA
 * @dev A mock strategy contract simulating a yield source.
 * The APY can be set by the owner for simulation.
 */
contract MockStrategyA is IStrategy, Ownable {
    IERC20 public immutable underlyingToken; // The token this strategy works with (e.g., HBT)
    address public vaultAddress; // The address of the YieldHarborVault

    uint256 public currentAPY; // Annual Percentage Yield, e.g., 500 for 5.00%
    uint256 public totalDepositedByVault; // Total amount deposited by the vault into this strategy
    string public strategyName;

    modifier onlyVault() {
        require(msg.sender == vaultAddress, "Strategy: Caller is not the vault");
        _;
    }

    constructor(
        address _underlyingTokenAddress, 
        address _vaultAddress, 
        uint256 _initialAPY,
        string memory _name,
        address initialOwner
    ) Ownable(initialOwner) {
        require(_underlyingTokenAddress != address(0), "Strategy: Token address cannot be zero");
        require(_vaultAddress != address(0), "Strategy: Vault address cannot be zero");
        underlyingToken = IERC20(_underlyingTokenAddress);
        vaultAddress = _vaultAddress;
        currentAPY = _initialAPY;
        strategyName = _name;
    }

    function name() external view override returns (string memory) {
        return strategyName;
    }
    
    function token() external view override returns (address) {
        return address(underlyingToken);
    }

    function getAPY() external view override returns (uint256) {
        return currentAPY;
    }

    /**
     * @dev Allows the owner to set the mock APY for simulation.
     * @param _newAPY The new APY value (e.g., 600 for 6.00%).
     */
    function setAPY(uint256 _newAPY) public onlyOwner {
        currentAPY = _newAPY;
    }
    
    /**
     * @dev Called by the Vault to deposit funds into this strategy.
     * Simulates receiving tokens from the vault.
     * @param amount The amount of tokens to deposit.
     */
    function depositToStrategy(uint256 amount) external override onlyVault {
        require(amount > 0, "Strategy: Deposit amount must be positive");
        // In a real strategy, tokens would be transferred from the vault to this strategy.
        // bool success = underlyingToken.transferFrom(vaultAddress, address(this), amount);
        // require(success, "Strategy: Token transfer from vault failed");
        // For simulation, we just track the amount. Assume transfer is handled by Vault logic.
        totalDepositedByVault += amount;
    }

    /**
     * @dev Called by the Vault to withdraw funds from this strategy.
     * Simulates transferring tokens back to the vault.
     * @param amount The amount of tokens to withdraw.
     */
    function withdrawFromStrategy(uint256 amount) external override onlyVault {
        require(amount > 0, "Strategy: Withdraw amount must be positive");
        require(totalDepositedByVault >= amount, "Strategy: Insufficient funds for withdrawal");
        // In a real strategy, tokens would be transferred from this strategy to the vault.
        // bool success = underlyingToken.transfer(vaultAddress, amount);
        // require(success, "Strategy: Token transfer to vault failed");
        // For simulation, we just track the amount.
        totalDepositedByVault -= amount;
    }

    /**
     * @dev Returns the current balance of assets deposited by the vault into this strategy.
     * In a real strategy, this would reflect principal + accrued yield.
     * For simulation, it's the principal amount tracked.
     */
    function balanceOfVault() external view override returns (uint256) {
        // This simulation simply returns the principal. A real strategy would calculate value.
        return totalDepositedByVault;
    }

    // Function to allow owner to withdraw any stuck tokens (not the underlyingToken managed by vault)
    function withdrawStuckTokens(address _tokenAddress, uint256 _amount) public onlyOwner {
        require(_tokenAddress != address(underlyingToken), "Strategy: Cannot withdraw underlying token");
        IERC20(_tokenAddress).transfer(owner(), _amount);
    }
}
