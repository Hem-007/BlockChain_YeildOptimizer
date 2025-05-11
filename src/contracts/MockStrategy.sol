// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./interfaces/IERC20.sol";
import "./interfaces/IMockStrategy.sol";
import "@openzeppelin/contracts/access/Ownable.sol"; // To restrict who can update yield

/**
 * @title MockStrategy
 * @dev A mock strategy contract to simulate a yield source.
 * The vault will deposit/withdraw assets from this strategy.
 * Yield is simulated by allowing the owner to update the balance.
 */
contract MockStrategy is IMockStrategy, Ownable {
    IERC20 public immutable override asset; // The asset this strategy works with
    string public override name;
    uint256 public currentAPY; // e.g., 500 for 5.00%

    uint256 private _balance; // Internal tracking of assets held, including simulated yield

    address public vaultAddress; // The address of the YieldHarborVault

    event StrategyDeposited(address indexed fromVault, uint256 amount);
    event StrategyWithdrew(address indexed toVault, uint256 amount);
    event BalanceUpdatedForYield(uint256 newBalance);
    event APYUpdated(uint256 newAPY);

    /**
     * @param _assetAddress The address of the ERC20 token this strategy handles.
     * @param _vaultAddress The address of the main YieldHarborVault.
     * @param _name The name of this strategy.
     * @param _initialAPY The initial APY for this strategy (e.g., 500 for 5.00%).
     * @param _initialOwner The owner of this strategy contract.
     */
    constructor(
        address _assetAddress,
        address _vaultAddress,
        string memory _name,
        uint256 _initialAPY,
        address _initialOwner
    ) Ownable(_initialOwner) {
        require(_assetAddress != address(0), "MockStrategy: Asset address cannot be zero");
        require(_vaultAddress != address(0), "MockStrategy: Vault address cannot be zero");
        
        asset = IERC20(_assetAddress);
        vaultAddress = _vaultAddress;
        name = _name;
        currentAPY = _initialAPY;
    }

    /**
     * @dev Returns the asset token this strategy is based on.
     * IMockStrategy interface requires this.
     */
    // function asset() external view override returns (address) {
    //     return address(assetToken);
    // }
    // No longer needed as asset is public immutable.

    /**
     * @dev Returns the current APY of the strategy.
     */
    function getAPY() external view override returns (uint256) {
        return currentAPY;
    }

    /**
     * @dev Returns the current balance of assets this strategy holds (including simulated yield).
     * This is what the vault will query to understand the value of its investment here.
     */
    function balanceOfVault() external view override returns (uint256) {
        return _balance;
    }

    /**
     * @dev Called by the Vault to deposit assets into this strategy.
     * Requires `msg.sender` to be the `vaultAddress`.
     * @param _amount The amount of assets to deposit.
     */
    function depositToStrategy(uint256 _amount) external override {
        require(msg.sender == vaultAddress, "MockStrategy: Caller is not the vault");
        require(_amount > 0, "MockStrategy: Deposit amount must be > 0");
        
        // Strategy pulls assets from the Vault
        uint256 beforeBalance = asset.balanceOf(address(this));
        bool success = asset.transferFrom(msg.sender, address(this), _amount);
        require(success, "MockStrategy: Asset transferFrom failed");
        uint256 receivedAmount = asset.balanceOf(address(this)) - beforeBalance; // Verify actual amount received

        _balance += receivedAmount;
        emit StrategyDeposited(msg.sender, receivedAmount);
    }

    /**
     * @dev Called by the Vault to withdraw assets from this strategy.
     * Requires `msg.sender` to be the `vaultAddress`.
     * @param _amount The amount of assets to withdraw.
     */
    function withdrawFromStrategy(uint256 _amount) external override {
        require(msg.sender == vaultAddress, "MockStrategy: Caller is not the vault");
        require(_amount > 0, "MockStrategy: Withdraw amount must be > 0");
        require(_balance >= _amount, "MockStrategy: Insufficient balance for withdrawal");

        _balance -= _amount;
        
        // Transfer assets back to the Vault
        bool success = asset.transfer(msg.sender, _amount);
        require(success, "MockStrategy: Asset transfer failed");

        emit StrategyWithdrew(msg.sender, _amount);
    }

    /**
     * @dev Allows the owner (admin) to update the APY.
     * @param _newAPY The new APY (e.g., 600 for 6.00%).
     */
    function setAPY(uint256 _newAPY) external onlyOwner {
        currentAPY = _newAPY;
        emit APYUpdated(_newAPY);
    }

    /**
     * @dev Allows the owner (admin) to update the balance to simulate yield accrual.
     * @param newBalance The new total balance this strategy reports.
     */
    function updateBalanceWithSimulatedYield(uint256 newBalance) external override onlyOwner {
        _balance = newBalance;
        emit BalanceUpdatedForYield(newBalance);
    }
}
