
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
 * @title MockStrategyB
 * @dev Another mock strategy contract, similar to MockStrategyA.
 */
contract MockStrategyB is IStrategy, Ownable {
    IERC20 public immutable underlyingToken;
    address public vaultAddress;

    uint256 public currentAPY;
    uint256 public totalDepositedByVault;
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

    function setAPY(uint256 _newAPY) public onlyOwner {
        currentAPY = _newAPY;
    }
    
    function depositToStrategy(uint256 amount) external override onlyVault {
        require(amount > 0, "Strategy: Deposit amount must be positive");
        totalDepositedByVault += amount;
    }

    function withdrawFromStrategy(uint256 amount) external override onlyVault {
        require(amount > 0, "Strategy: Withdraw amount must be positive");
        require(totalDepositedByVault >= amount, "Strategy: Insufficient funds for withdrawal");
        totalDepositedByVault -= amount;
    }

    function balanceOfVault() external view override returns (uint256) {
        return totalDepositedByVault;
    }

    function withdrawStuckTokens(address _tokenAddress, uint256 _amount) public onlyOwner {
        require(_tokenAddress != address(underlyingToken), "Strategy: Cannot withdraw underlying token");
        IERC20(_tokenAddress).transfer(owner(), _amount);
    }
}
