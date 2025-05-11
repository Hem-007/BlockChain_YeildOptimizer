
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

// Interface for a Strategy contract
interface IStrategy {
    function token() external view returns (address); // The token this strategy works with
    function getAPY() external view returns (uint256); // Annual Percentage Yield, e.g., 500 for 5.00%
    function depositToStrategy(uint256 amount) external; // Called by Vault to deposit funds
    function withdrawFromStrategy(uint256 amount) external; // Called by Vault to withdraw funds
    function balanceOfVault() external view returns (uint256); // How much the Vault has deposited
    function name() external view returns (string); // Name of the strategy
}

/**
 * @title YieldHarborVault
 * @dev A DeFi vault that aggregates yield from various (simulated) sources.
 * Users deposit an ERC20 token (HBT) and receive shares representing their portion of the vault.
 * The vault simulates allocating funds to the highest-yielding strategy.
 */
contract YieldHarborVault is Ownable, ReentrancyGuard {
    IERC20 public immutable asset; // The HBT token used for deposits/withdrawals

    mapping(address => uint256) public shares; // User's shares in the vault
    uint256 public totalShares; // Total shares issued by the vault

    IStrategy[] public strategies; // Array of available strategy contracts
    address public currentStrategy; // The strategy currently being used (simulated allocation)
    mapping(address => uint256) public strategyAllocations; // Amount of 'asset' allocated to each strategy by this vault

    uint256 private constant PRICE_PRECISION = 1e18; // For pricePerShare calculations

    event Deposited(address indexed user, uint256 assetAmount, uint256 sharesIssued);
    event Withdrawn(address indexed user, uint256 assetAmount, uint256 sharesBurned);
    event StrategyAdded(address indexed strategyAddress);
    event StrategyAllocated(address indexed strategyAddress, uint256 amountAllocated);
    event FundsMoved(address indexed fromStrategy, address indexed toStrategy, uint256 amountMoved);

    modifier onlyEOA() {
        require(tx.origin == msg.sender, "Vault: Caller cannot be a contract");
        _;
    }

    constructor(address _assetAddress, address initialOwner) Ownable(initialOwner) {
        require(_assetAddress != address(0), "Vault: Asset address cannot be zero");
        asset = IERC20(_assetAddress);
    }

    /**
     * @dev Adds a new strategy contract to the list of available strategies.
     * Only callable by the owner.
     * @param _strategyAddress The address of the strategy contract.
     */
    function addStrategy(address _strategyAddress) public onlyOwner {
        require(_strategyAddress != address(0), "Vault: Strategy address cannot be zero");
        // Optional: Check if strategy.token() matches vault.asset() if strategies are asset-specific
        // require(IStrategy(_strategyAddress).token() == address(asset), "Vault: Strategy token mismatch");
        
        // Prevent duplicate strategies
        for (uint i = 0; i < strategies.length; i++) {
            require(address(strategies[i]) != _strategyAddress, "Vault: Strategy already added");
        }
        strategies.push(IStrategy(_strategyAddress));
        emit StrategyAdded(_strategyAddress);
    }

    /**
     * @dev Calculates the total value of assets managed by the vault.
     * This includes assets held directly by the vault and assets deployed in strategies.
     */
    function totalAssets() public view returns (uint256) {
        uint256 vaultBalance = asset.balanceOf(address(this));
        uint256 assetsInStrategies = 0;
        // In a real scenario, balanceOfVault() would return the current value.
        // For this simulation, strategyAllocations holds the principal deposited.
        // Actual yield would increase this. We'll assume strategyAllocations reflects current value.
        for (uint i = 0; i < strategies.length; i++) {
            assetsInStrategies += strategyAllocations[address(strategies[i])];
        }
        return vaultBalance + assetsInStrategies;
    }

    /**
     * @dev Calculates the price of one share in terms of the asset token.
     * Price per share = Total Assets / Total Shares.
     */
    function pricePerShare() public view returns (uint256) {
        if (totalShares == 0) {
            return PRICE_PRECISION; // Initial price if no shares yet (1 asset unit per share)
        }
        return (totalAssets() * PRICE_PRECISION) / totalShares;
    }

    /**
     * @dev Deposits assets into the vault and mints shares for the user.
     * @param _amount The amount of asset tokens to deposit.
     */
    function deposit(uint256 _amount) public nonReentrant onlyEOA {
        require(_amount > 0, "Vault: Deposit amount must be positive");

        uint256 currentPricePerShare = pricePerShare();
        uint256 sharesToIssue = (_amount * PRICE_PRECISION) / currentPricePerShare;
        require(sharesToIssue > 0, "Vault: Shares to issue must be positive");

        totalShares += sharesToIssue;
        shares[msg.sender] += sharesToIssue;

        bool success = asset.transferFrom(msg.sender, address(this), _amount);
        require(success, "Vault: Asset transfer failed");

        emit Deposited(msg.sender, _amount, sharesToIssue);

        // Conceptually, new funds could trigger reallocation, or be added to current strategy.
        // For simplicity, new funds are held by vault or manually allocated.
    }

    /**
     * @dev Withdraws assets from the vault by burning user's shares.
     * @param _sharesAmount The amount of shares to burn.
     */
    function withdraw(uint256 _sharesAmount) public nonReentrant onlyEOA {
        require(_sharesAmount > 0, "Vault: Shares to withdraw must be positive");
        require(shares[msg.sender] >= _sharesAmount, "Vault: Insufficient shares");

        uint256 currentPricePerShare = pricePerShare();
        uint256 assetAmountToReturn = (_sharesAmount * currentPricePerShare) / PRICE_PRECISION;
        require(assetAmountToReturn > 0, "Vault: Asset amount to return must be positive");

        shares[msg.sender] -= _sharesAmount;
        totalShares -= _sharesAmount;

        // Check if vault has enough balance, if not, "withdraw" from current strategy (conceptually)
        if (asset.balanceOf(address(this)) < assetAmountToReturn) {
            uint256 neededFromStrategy = assetAmountToReturn - asset.balanceOf(address(this));
            if (currentStrategy != address(0) && strategyAllocations[currentStrategy] >= neededFromStrategy) {
                // Simulate withdrawing from strategy to cover withdrawal
                // IStrategy(currentStrategy).withdrawFromStrategy(neededFromStrategy); // This would be a real call
                strategyAllocations[currentStrategy] -= neededFromStrategy; 
                // Assume tokens are now in vault. In reality, strategy would transfer back.
                 emit FundsMoved(currentStrategy, address(this), neededFromStrategy);
            } else {
                // This case means vault is underfunded even after pulling from strategy.
                // This shouldn't happen in a well-managed vault; implies loss or lockup.
                // For simulation, we might revert or partially fulfill. Reverting is safer.
                revert("Vault: Insufficient liquidity to withdraw, try later or smaller amount.");
            }
        }
        
        bool success = asset.transfer(msg.sender, assetAmountToReturn);
        require(success, "Vault: Asset transfer failed");

        emit Withdrawn(msg.sender, assetAmountToReturn, _sharesAmount);
    }

    /**
     * @dev Returns the value of a user's shares in terms of the asset token.
     * @param _account The user's account address.
     */
    function balanceOf(address _account) public view returns (uint256) {
        uint256 userShares = shares[_account];
        if (userShares == 0) return 0;
        return (userShares * pricePerShare()) / PRICE_PRECISION;
    }
    
    /**
     * @dev Simulates allocating funds to the strategy with the highest APY.
     * Only callable by the owner. In a real scenario, this might be automated.
     * This is a conceptual allocation.
     */
    function allocateToBestStrategy() public onlyOwner {
        require(strategies.length > 0, "Vault: No strategies added");

        address bestStrategyAddress = address(0);
        uint256 highestApy = 0;

        for (uint i = 0; i < strategies.length; i++) {
            IStrategy strategy = strategies[i];
            uint256 currentApy = strategy.getAPY();
            if (currentApy > highestApy) {
                highestApy = currentApy;
                bestStrategyAddress = address(strategy);
            }
        }

        require(bestStrategyAddress != address(0), "Vault: Could not determine best strategy");

        uint256 availableToAllocate = asset.balanceOf(address(this));
        
        // If funds are in a previous strategy, "withdraw" them first.
        if (currentStrategy != address(0) && currentStrategy != bestStrategyAddress && strategyAllocations[currentStrategy] > 0) {
            uint256 amountFromOldStrategy = strategyAllocations[currentStrategy];
            // IStrategy(currentStrategy).withdrawFromStrategy(amountFromOldStrategy); // Real call
            strategyAllocations[currentStrategy] = 0;
            availableToAllocate += amountFromOldStrategy; // Conceptually moved back to vault
            emit FundsMoved(currentStrategy, address(this), amountFromOldStrategy);
        }
        
        if (availableToAllocate > 0 && bestStrategyAddress != currentStrategy) {
            // IStrategy(bestStrategyAddress).depositToStrategy(availableToAllocate); // Real call
            strategyAllocations[bestStrategyAddress] += availableToAllocate;
            currentStrategy = bestStrategyAddress;
            emit StrategyAllocated(bestStrategyAddress, availableToAllocate);
             emit FundsMoved(address(this), bestStrategyAddress, availableToAllocate);
        } else if (availableToAllocate > 0 && bestStrategyAddress == currentStrategy) {
            // If best strategy is already current, deposit new funds into it
            // IStrategy(bestStrategyAddress).depositToStrategy(availableToAllocate); // Real call
            strategyAllocations[bestStrategyAddress] += availableToAllocate;
            emit StrategyAllocated(bestStrategyAddress, availableToAllocate);
            emit FundsMoved(address(this), bestStrategyAddress, availableToAllocate);
        }
    }

    function getStrategiesCount() public view returns (uint256) {
        return strategies.length;
    }

    // Fallback function to receive ETH (if vault logic were to handle ETH directly)
    // receive() external payable {}

    // It's good practice to allow owner to withdraw stuck ERC20 tokens (not the main asset)
    function withdrawStuckTokens(address _tokenAddress, uint256 _amount) public onlyOwner {
        require(_tokenAddress != address(asset), "Vault: Cannot withdraw main asset with this function");
        IERC20(_tokenAddress).transfer(owner(), _amount);
    }
}

/**
 * Minimal interfaces for OpenZeppelin contracts.
 */
// interface IERC20 {
//     function totalSupply() external view returns (uint256);
//     function balanceOf(address account) external view returns (uint256);
//     function transfer(address recipient, uint256 amount) external returns (bool);
//     function allowance(address owner, address spender) external view returns (uint256);
//     function approve(address spender, uint256 amount) external returns (bool);
//     function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
//     event Transfer(address indexed from, address indexed to, uint256 value);
//     event Approval(address indexed owner, address indexed spender, uint256 value);
// }

// abstract contract Ownable { ... } // Simplified
// abstract contract ReentrancyGuard { ... } // Simplified
