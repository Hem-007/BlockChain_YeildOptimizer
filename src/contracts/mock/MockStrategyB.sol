// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC20} from "../interfaces/IERC20.sol";
import {IMockStrategy} from "../interfaces/IMockStrategy.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title MockStrategyB
 * @author YieldHarbor Team
 * @notice Another mock yield strategy contract for demonstration.
 */
contract MockStrategyB is IMockStrategy, Ownable {
    using SafeERC20 for IERC20;

    IERC20 public immutable override asset;
    address public immutable override vault;

    string public override name;
    uint256 public currentAPY;
    uint256 public balanceHeldForVault;

    constructor(
        address _asset,
        address _vault,
        uint256 _initialApy,
        string memory _name,
        address _initialOwner
    ) Ownable(_initialOwner) {
        require(_asset != address(0), "MockStrategyB: Asset address cannot be zero");
        require(_vault != address(0), "MockStrategyB: Vault address cannot be zero");
        asset = IERC20(_asset);
        vault = _vault;
        currentAPY = _initialApy;
        name = _name;
    }

    function depositToStrategy(uint256 _amount) external override {
        require(msg.sender == vault, "MockStrategyB: Caller must be the vault");
        require(_amount > 0, "MockStrategyB: Deposit amount must be > 0");
        
        asset.safeTransferFrom(msg.sender, address(this), _amount); // msg.sender is the vault
        balanceHeldForVault += _amount;
        
        emit StrategyDeposited(vault, _amount);
    }

    function withdrawFromStrategy(uint256 _amount) external override {
        require(msg.sender == vault, "MockStrategyB: Caller must be the vault");
        require(_amount > 0, "MockStrategyB: Withdraw amount must be > 0");
        require(balanceHeldForVault >= _amount, "MockStrategyB: Insufficient balance for withdrawal");
        
        balanceHeldForVault -= _amount;
        asset.safeTransfer(vault, _amount);

        emit StrategyWithdrew(vault, _amount);
    }

    function balanceOfVault() external view override returns (uint256) {
        return balanceHeldForVault;
    }

    function getAPY() external view override returns (uint256) {
        return currentAPY;
    }

    function setAPY(uint256 _newAPY) external onlyOwner {
        currentAPY = _newAPY;
        emit APYUpdated(_newAPY);
    }
    
    function updateBalanceWithSimulatedYield(uint256 _newBalance) external onlyOwner {
        balanceHeldForVault = _newBalance;
        emit BalanceUpdatedForYield(_newBalance);
    }
}
