// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./interfaces/IERC20.sol";
import "./interfaces/IMockStrategy.sol"; // Assuming an interface for mock strategies

/**
 * @title YieldHarborVault
 * @dev A DeFi vault that accepts deposits of a specific ERC20 token (asset),
 * issues shares (also ERC20) to depositors, and (conceptually) allocates
 * assets to yield-generating strategies.
 */
contract YieldHarborVault is ERC20, Ownable, ReentrancyGuard {
    IERC20 public immutable asset; // The underlying ERC20 token this vault manages

    // Strategy Management
    address[] public strategyAddresses;
    mapping(address => uint256) public strategyAllocations; // Tracks principal allocated to each strategy
    address public currentStrategy; // For simplicity, assumes one active strategy or a portfolio manager contract

    /**
     * @dev Emitted when a user deposits assets into the vault.
     * @param user The address of the depositor.
     * @param assetsDeposited The amount of underlying assets deposited.
     * @param sharesIssued The amount of vault shares issued to the depositor.
     */
    event Deposited(address indexed user, uint256 assetsDeposited, uint256 sharesIssued);

    /**
     * @dev Emitted when a user withdraws assets from the vault.
     * @param user The address of the withdrawer.
     * @param assetsWithdrawn The amount of underlying assets withdrawn.
     * @param sharesBurned The amount of vault shares burned.
     */
    event Withdrawn(address indexed user, uint256 assetsWithdrawn, uint256 sharesBurned);

    /**
     * @dev Emitted when assets are allocated to a strategy.
     * @param strategy The address of the strategy.
     * @param amount The amount of assets allocated.
     */
    event StrategyAllocated(address indexed strategy, uint256 amount);

    /**
     * @dev Emitted when assets are moved from a strategy.
     * @param strategy The address of the strategy.
     * @param amount The amount of assets moved.
     */
    event StrategyDeallocated(address indexed strategy, uint256 amount);


    /**
     * @dev Constructor for the YieldHarborVault.
     * @param _assetAddress The address of the ERC20 token this vault will accept.
     * @param _vaultName The name for the vault's shares token (e.g., "YieldHarbor HBT Shares").
     * @param _vaultSymbol The symbol for the vault's shares token (e.g., "yhHBT").
     * @param _initialOwner The address that will initially own this contract.
     */
    constructor(
        address _assetAddress,
        string memory _vaultName,
        string memory _vaultSymbol,
        address _initialOwner
    ) ERC20(_vaultName, _vaultSymbol) Ownable(_initialOwner) {
        require(_assetAddress != address(0), "Vault: Asset address cannot be zero");
        asset = IERC20(_assetAddress);
        // Vault share decimals will match the underlying asset's decimals
        // This is automatically handled by ERC20.sol if `_decimals()` is not overridden.
        // For explicit control, you might call `_setupDecimals(IERC20(_assetAddress).decimals());`
        // but OpenZeppelin's ERC20 defaults to 18 decimals. If asset has different, override _decimals().
    }

    /**
     * @dev Returns the decimals of the vault's share token. Overrides ERC20's default.
     * It's set to match the underlying asset's decimals for easier calculations.
     */
    function _decimals() internal view virtual override returns (uint8) {
        return IERC20(address(asset)).decimals();
    }

    /**
     * @dev Calculates the total amount of underlying assets managed by the vault.
     * This includes assets idle in the vault and assets deployed to strategies (including simulated yield).
     */
    function totalAssets() public view returns (uint256) {
        uint256 _total = asset.balanceOf(address(this)); // Assets idle in vault
        for (uint256 i = 0; i < strategyAddresses.length; i++) {
            IMockStrategy strategy = IMockStrategy(strategyAddresses[i]);
            // Assumes strategy.balanceOfVault() returns current value including yield
            _total += strategy.balanceOfVault();
        }
        return _total;
    }

    /**
     * @dev Calculates the current price per share in terms of the underlying asset.
     * pricePerShare = totalAssets / totalSupplyOfShares
     */
    function pricePerShare() public view returns (uint256) {
        uint256 _totalSupply = totalSupply(); // Total shares issued by the vault
        uint256 _totalAssets = totalAssets();

        if (_totalSupply == 0 || _totalAssets == 0) {
            // If no shares or no assets, 1 share = 1 unit of asset (scaled by decimals)
            return (10**uint256(decimals()));
        }
        // pricePerShare is scaled by 10**decimals to maintain precision
        return (_totalAssets * (10**uint256(decimals()))) / _totalSupply;
    }

    /**
     * @dev Converts a desired amount of underlying assets to the equivalent amount of vault shares.
     * @param _assetsAmount The amount of underlying assets.
     * @return The equivalent amount of vault shares.
     */
    function convertToShares(uint256 _assetsAmount) public view returns (uint256) {
        if (_assetsAmount == 0) return 0;
        uint256 _pricePerShare = pricePerShare();
        // shares = assets * (10**decimals) / pricePerShare
        // This formula maintains precision as pricePerShare is already scaled.
        return (_assetsAmount * (10**uint256(decimals()))) / _pricePerShare;
    }

    /**
     * @dev Converts an amount of vault shares to the equivalent amount of underlying assets.
     * @param _sharesAmount The amount of vault shares.
     * @return The equivalent amount of underlying assets.
     */
    function convertToAssets(uint256 _sharesAmount) public view returns (uint256) {
        if (_sharesAmount == 0) return 0;
        uint256 _pricePerShare = pricePerShare();
        // assets = shares * pricePerShare / (10**decimals)
        return (_sharesAmount * _pricePerShare) / (10**uint256(decimals()));
    }

    /**
     * @dev Deposits `_amount` of the underlying asset into the vault.
     * The caller must have previously approved the vault to spend at least `_amount` of the asset.
     * Mints vault shares to the depositor (`msg.sender`).
     * @param _amount The amount of underlying asset to deposit.
     */
    function deposit(uint256 _amount) public nonReentrant {
        require(_amount > 0, "Vault: Deposit amount must be > 0");

        uint256 sharesToMint = convertToShares(_amount);
        require(sharesToMint > 0, "Vault: Shares to mint must be > 0");

        // Pull assets from depositor's wallet
        bool success = asset.transferFrom(msg.sender, address(this), _amount);
        require(success, "Vault: Asset transferFrom failed");

        // Mint vault shares to the depositor
        _mint(msg.sender, sharesToMint);

        emit Deposited(msg.sender, _amount, sharesToMint);

        // Optional: Auto-allocate deposited funds to a strategy
        // if (currentStrategy != address(0)) {
        //     _allocateToStrategy(currentStrategy, _amount);
        // }
    }

    /**
     * @dev Withdraws assets from the vault by redeeming `_sharesAmount` of vault shares.
     * Burns the specified amount of shares from `msg.sender`.
     * Transfers the corresponding amount of underlying asset back to `msg.sender`.
     * @param _sharesAmount The amount of vault shares to redeem.
     */
    function withdraw(uint256 _sharesAmount) public nonReentrant {
        require(_sharesAmount > 0, "Vault: Shares amount must be > 0");
        require(balanceOf(msg.sender) >= _sharesAmount, "Vault: Insufficient shares");

        uint256 assetsToWithdraw = convertToAssets(_sharesAmount);
        require(assetsToWithdraw > 0, "Vault: Assets to withdraw must be > 0");
        
        // Ensure vault has enough assets (considering assets might be in strategies)
        // This might involve recalling assets from strategies if idle balance is insufficient.
        // For simplicity in this version, we assume sufficient liquid assets or that
        // a separate mechanism handles recalling from strategies.
        // A robust implementation would check `asset.balanceOf(address(this))` and recall if needed.
        // require(asset.balanceOf(address(this)) >= assetsToWithdraw, "Vault: Insufficient liquid assets for withdrawal");


        // Burn shares from the withdrawer
        _burn(msg.sender, _sharesAmount);

        // Transfer assets back to the withdrawer
        bool success = asset.transfer(msg.sender, assetsToWithdraw);
        require(success, "Vault: Asset transfer failed");

        emit Withdrawn(msg.sender, assetsToWithdraw, _sharesAmount);
    }
    
    /**
     * @dev Returns the value of `account`'s shares in terms of the underlying asset.
     * This is different from `balanceOf` (which returns shares).
     * This function is not part of standard ERC20/ERC4626 but can be useful.
     * For ERC4626 compliance, this would be `previewRedeem(balanceOf(account))`.
     */
    function valueOfShares(address account) external view returns (uint256) {
        return convertToAssets(balanceOf(account));
    }


    // --- Strategy Management Functions (Owner-only) ---

    /**
     * @dev Adds a new strategy contract to the vault.
     * @param _strategyAddress The address of the strategy contract.
     */
    function addStrategy(address _strategyAddress) external onlyOwner {
        require(_strategyAddress != address(0), "Vault: Strategy address cannot be zero");
        // Ensure strategy is not already added
        for (uint i = 0; i < strategyAddresses.length; i++) {
            require(strategyAddresses[i] != _strategyAddress, "Vault: Strategy already added");
        }
        strategyAddresses.push(_strategyAddress);
        // Initialize allocation for this strategy to 0
        strategyAllocations[_strategyAddress] = 0; 
    }

    /**
     * @dev (Simulated) Allocates assets to the "best" strategy.
     * In a real scenario, this would involve complex logic to determine the best strategy.
     * Here, it might just pick one or be manually triggered.
     * This function is a placeholder for more complex strategy management logic.
     */
    function allocateToBestStrategy() external onlyOwner {
        // Placeholder: Example logic to allocate all idle assets to the first strategy
        // A real implementation would query APYs, risk scores, etc.
        if (strategyAddresses.length == 0) return; // No strategies to allocate to

        address bestStrategy = strategyAddresses[0]; // Simplified: pick first strategy
        uint256 idleAssets = asset.balanceOf(address(this));

        if (idleAssets > 0) {
            _allocateToStrategy(bestStrategy, idleAssets);
        }
        currentStrategy = bestStrategy; // Update current strategy (simplistic)
    }

    /**
     * @dev Internal function to allocate assets to a specific strategy.
     * @param _strategyAddress The address of the strategy.
     * @param _amount The amount of assets to allocate.
     */
    function _allocateToStrategy(address _strategyAddress, uint256 _amount) internal {
        require(strategyAllocations[_strategyAddress] != 0 || _isStrategyAdded(_strategyAddress), "Vault: Strategy not added or unknown");
        require(_amount > 0, "Vault: Allocation amount must be > 0");
        require(asset.balanceOf(address(this)) >= _amount, "Vault: Insufficient idle assets");

        asset.approve(_strategyAddress, _amount);
        IMockStrategy(_strategyAddress).depositToStrategy(_amount); // Strategy pulls funds

        strategyAllocations[_strategyAddress] += _amount;
        emit StrategyAllocated(_strategyAddress, _amount);
    }

    /**
     * @dev Internal function to deallocate assets from a specific strategy.
     * @param _strategyAddress The address of the strategy.
     * @param _amount The amount of assets to deallocate.
     */
    function _deallocateFromStrategy(address _strategyAddress, uint256 _amount) internal {
        require(_isStrategyAdded(_strategyAddress), "Vault: Strategy not added");
        require(_amount > 0, "Vault: Deallocation amount must be > 0");
        require(strategyAllocations[_strategyAddress] >= _amount, "Vault: Not enough allocated to strategy");

        IMockStrategy(_strategyAddress).withdrawFromStrategy(_amount); // Strategy returns funds

        strategyAllocations[_strategyAddress] -= _amount;
        emit StrategyDeallocated(_strategyAddress, _amount);
    }

    /**
     * @dev Helper to check if a strategy is added.
     */
    function _isStrategyAdded(address _strategyAddress) internal view returns (bool) {
        for (uint i = 0; i < strategyAddresses.length; i++) {
            if (strategyAddresses[i] == _strategyAddress) {
                return true;
            }
        }
        return false;
    }
    
    /**
     * @dev Gets the number of strategies added to the vault.
     */
    function getStrategiesCount() external view returns (uint256) {
        return strategyAddresses.length;
    }

    /**
     * @dev Allows owner to update the current strategy (for simple single-strategy focus).
     */
    function setCurrentStrategy(address _strategyAddress) external onlyOwner {
        require(_isStrategyAdded(_strategyAddress), "Vault: Strategy not added");
        currentStrategy = _strategyAddress;
    }
    
    /**
     * @dev Allows owner to manually report profit from a strategy to simulate yield.
     * This would increase the strategy's reported balance, thus increasing vault's totalAssets.
     * @param _strategyAddress The address of the strategy.
     * @param _newBalanceFromTheStrategy The new total balance reported by the strategy (principal + yield).
     */
    function reportStrategyPerformance(address _strategyAddress, uint256 _newBalanceFromTheStrategy) external onlyOwner {
        require(_isStrategyAdded(_strategyAddress), "Vault: Strategy not added");
        // This is a conceptual function. The IMockStrategy interface would need a way for the vault
        // to tell it to update its balance, or the strategy itself has an admin function.
        // For this example, we'll assume the strategy can be updated.
        IMockStrategy(_strategyAddress).updateBalanceWithSimulatedYield(_newBalanceFromTheStrategy);
        // Note: strategyAllocations map might track principal, while totalAssets() sums up
        // strategy.balanceOfVault() which includes yield. No direct update to strategyAllocations here
        // unless it's meant to track current value.
    }

    // ERC20 functions like name(), symbol(), totalSupply(), balanceOf(address) for shares are inherited.
    // transfer(), approve(), transferFrom() for shares are also inherited.
}

