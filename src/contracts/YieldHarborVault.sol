// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {IERC20} from "./interfaces/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {IMockStrategy} from "./interfaces/IMockStrategy.sol";

/**
 * @title YieldHarborVault
 * @author YieldHarbor Team
 * @notice This vault allows users to deposit an ERC20 token (asset) and receive shares
 * representing their portion of the vault's total assets. The vault aims to maximize
 * yield by allocating deposited assets to various (mock) strategies.
 * Shares are also ERC20 tokens.
 * This contract simulates yield generation; no actual cross-chain operations occur.
 */
contract YieldHarborVault is ERC20, Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    /**
     * @notice The underlying ERC20 token this vault accepts and manages.
     */
    IERC20 public immutable asset;

    /**
     * @notice Array of strategy contract addresses the vault can allocate funds to.
     */
    IMockStrategy[] public strategies;

    /**
     * @notice Mapping from strategy address to the amount of assets allocated to it.
     */
    mapping(address strategy => uint256 allocation) public strategyAllocations;

    /**
     * @notice The strategy currently targeted for primary allocations or yield harvesting.
     * This is a simplified model; a real vault might have more complex logic.
     */
    IMockStrategy public currentStrategy;

    // Events
    event Deposited(address indexed caller, address indexed receiver, uint256 assets, uint256 shares);
    event Withdrawn(address indexed caller, address indexed receiver, address indexed owner, uint256 assets, uint256 shares);
    event StrategyAdded(address indexed strategyAddress);
    event StrategyAllocated(address indexed strategy, uint256 amount);
    event StrategyDeallocated(address indexed strategy, uint256 amount);
    event CurrentStrategySet(address indexed strategyAddress);
    event StrategyReported(address indexed strategy, uint256 gain, uint256 loss, uint256 currentBalanceInStrategy);

    /**
     * @notice Constructor for the YieldHarborVault.
     * @param _asset The address of the ERC20 token to be used as the underlying asset.
     * @param _name The name for the vault's share token (e.g., "YieldHarbor HBT Shares").
     * @param _symbol The symbol for the vault's share token (e.g., "yhHBT").
     * @param _initialOwner The initial owner of the vault, typically the deployer.
     */
    constructor(
        address _asset,
        string memory _name,
        string memory _symbol,
        address _initialOwner
    ) ERC20(_name, _symbol) Ownable(_initialOwner) {
        require(_asset != address(0), "YieldHarborVault: Asset address cannot be zero");
        asset = IERC20(_asset);
    }

    /**
     * @notice Calculates the total amount of underlying assets managed by the vault.
     * This includes assets held directly by the vault and assets deployed in strategies.
     * @return The total value of assets in the vault.
     */
    function totalAssets() public view returns (uint256) {
        uint256 assetsInStrategies = 0;
        for (uint256 i = 0; i < strategies.length; i++) {
            assetsInStrategies += strategyAllocations[address(strategies[i])];
        }
        return asset.balanceOf(address(this)) + assetsInStrategies;
    }

    /**
     * @notice Calculates the current price per share.
     * Price is ((total underlying assets) * 10^share_decimals) / (total shares).
     * If total shares is 0, price is 1 unit of asset per share (1*10^share_decimals).
     * @return The price per share, scaled by 10^decimals().
     */
    function pricePerShare() public view returns (uint256) {
        uint256 _totalSupply = totalSupply(); // Total shares issued by the vault
        uint256 _totalAssets = totalAssets(); // Total underlying assets managed

        if (_totalSupply == 0) {
            // Default to 1:1 price if no shares minted, scaled by share token decimals
            return 10**decimals();
        }
        // price = (totalAssets * 10^shareDecimals) / totalSupplyOfShares
        return (_totalAssets * (10**decimals())) / _totalSupply;
    }

    /**
     * @notice Converts a given amount of assets into the equivalent number of shares.
     * @param _assetsAmount The amount of underlying assets.
     * @return The corresponding amount of shares.
     */
    function convertToShares(uint256 _assetsAmount) public view returns (uint256) {
        if (_assetsAmount == 0) return 0;
        // shares = (assetsAmount * 10^shareDecimals) / pricePerShare
        // Note: pricePerShare already incorporates 10^shareDecimals in its numerator
        return (_assetsAmount * (10**decimals())) / pricePerShare();
    }

    /**
     * @notice Converts a given amount of shares into the equivalent amount of assets.
     * @param _sharesAmount The amount of shares.
     * @return The corresponding amount of underlying assets.
     */
    function convertToAssets(uint256 _sharesAmount) public view returns (uint256) {
        if (_sharesAmount == 0) return 0;
        // assets = (sharesAmount * pricePerShare) / 10^shareDecimals
        return (_sharesAmount * pricePerShare()) / (10**decimals());
    }

    /**
     * @notice Deposits `_assetsAmount` of the underlying asset into the vault.
     * User (msg.sender) must have previously approved the vault to spend at least `_assetsAmount` of the asset.
     * Shares are minted to `_receiver`.
     * @param _assetsAmount The amount of asset tokens to deposit.
     * @param _receiver The address that will receive the vault shares.
     * @return shares The amount of shares minted to the `_receiver`.
     */
    function deposit(uint256 _assetsAmount, address _receiver)
        public
        nonReentrant
        returns (uint256 shares)
    {
        require(_assetsAmount > 0, "YieldHarborVault: Deposit amount must be > 0");
        require(_receiver != address(0), "YieldHarborVault: Receiver address cannot be zero");

        shares = convertToShares(_assetsAmount);
        require(shares > 0, "YieldHarborVault: Calculated shares must be > 0");

        // Pulls tokens from msg.sender to the vault.
        // msg.sender must have approved the vault contract for `_assetsAmount`.
        asset.safeTransferFrom(msg.sender, address(this), _assetsAmount);

        _mint(_receiver, shares);

        emit Deposited(msg.sender, _receiver, _assetsAmount, shares);

        // Conceptual: after deposit, attempt to allocate funds to the current strategy
        if (address(currentStrategy) != address(0) && asset.balanceOf(address(this)) > 0) {
             // Allocate only the newly deposited amount if it's available
            uint256 allocatableAmount = asset.balanceOf(address(this));
            if (allocatableAmount > _assetsAmount) { // If vault had prior balance
                allocatableAmount = _assetsAmount;
            }
            if(allocatableAmount > 0) {
                _allocateToStrategy(currentStrategy, allocatableAmount);
            }
        }
    }

    /**
     * @notice Withdraws assets from the vault by redeeming `_sharesAmount`.
     * The `_owner` must have sufficient shares. If `msg.sender` is not `_owner`,
     * `msg.sender` must have been approved by `_owner` to spend their shares.
     * Assets are sent to `_receiver`.
     * @param _sharesAmount The amount of shares to redeem.
     * @param _receiver The address that will receive the withdrawn assets.
     * @param _owner The address that owns the shares being redeemed.
     * @return assets The amount of assets withdrawn.
     */
    function withdraw(uint256 _sharesAmount, address _receiver, address _owner)
        public
        nonReentrant
        returns (uint256 assets)
    {
        require(_sharesAmount > 0, "YieldHarborVault: Shares amount must be > 0");
        require(_receiver != address(0), "YieldHarborVault: Receiver address cannot be zero");
        require(_owner != address(0), "YieldHarborVault: Owner address cannot be zero");

        assets = convertToAssets(_sharesAmount);
        require(assets > 0, "YieldHarborVault: Calculated assets must be > 0");

        if (msg.sender != _owner) {
            // If msg.sender is not the owner, they must have an allowance for the shares
            _spendAllowance(_owner, msg.sender, _sharesAmount);
        }

        _burn(_owner, _sharesAmount); // Burn shares from the owner

        // Ensure vault has enough assets. This might involve deallocating from strategies.
        // This is a simplified deallocation. A real vault would have more complex logic.
        if (asset.balanceOf(address(this)) < assets) {
            _deallocateFromStrategy(assets - asset.balanceOf(address(this)));
        }
        
        require(asset.balanceOf(address(this)) >= assets, "YieldHarborVault: Insufficient vault balance for withdrawal after deallocation attempt");
        asset.safeTransfer(_receiver, assets);

        emit Withdrawn(msg.sender, _receiver, _owner, assets, _sharesAmount);
    }

    // Strategy Management (Ownable)

    /**
     * @notice Adds a new strategy to the vault's list of manageable strategies.
     * Only callable by the owner.
     * @param _strategyAddress The address of the strategy contract.
     */
    function addStrategy(address _strategyAddress) external onlyOwner {
        require(_strategyAddress != address(0), "YieldHarborVault: Strategy address cannot be zero");
        // Optional: check if strategy already exists to prevent duplicates
        for (uint i = 0; i < strategies.length; i++){
            require(address(strategies[i]) != _strategyAddress, "YieldHarborVault: Strategy already added");
        }
        strategies.push(IMockStrategy(_strategyAddress));
        emit StrategyAdded(_strategyAddress);
    }

    /**
     * @notice Sets the current active strategy for allocations/harvesting.
     * Only callable by the owner.
     * @param _strategyAddress The address of the strategy to set as current.
     */
    function setCurrentStrategy(address _strategyAddress) external onlyOwner {
        require(_strategyAddress != address(0), "YieldHarborVault: Strategy address cannot be zero");
        bool strategyExists = false;
        for(uint i = 0; i < strategies.length; i++){
            if(address(strategies[i]) == _strategyAddress){
                strategyExists = true;
                break;
            }
        }
        require(strategyExists, "YieldHarborVault: Strategy not registered");
        currentStrategy = IMockStrategy(_strategyAddress);
        emit CurrentStrategySet(_strategyAddress);
    }
    
    /**
     * @notice Gets the number of strategies added to the vault.
     * @return The count of strategies.
     */
    function getStrategiesCount() external view returns (uint256) {
        return strategies.length;
    }

    /**
     * @notice Simulates allocating all available assets currently in the vault to the `currentStrategy`.
     * A real implementation would be more nuanced.
     * Only callable by the owner.
     */
    function allocateToBestStrategy() external onlyOwner { // Renamed for clarity, keeps existing frontend call
        require(address(currentStrategy) != address(0), "YieldHarborVault: No current strategy set");
        uint256 vaultBalance = asset.balanceOf(address(this));
        if (vaultBalance > 0) {
            _allocateToStrategy(currentStrategy, vaultBalance);
        }
    }

    /**
     * @dev Internal function to allocate assets to a specific strategy.
     * @param _strategy The strategy to allocate to.
     * @param _amount The amount of assets to allocate.
     */
    function _allocateToStrategy(IMockStrategy _strategy, uint256 _amount) internal {
        if (_amount == 0) return;
        uint256 actualVaultBalance = asset.balanceOf(address(this));
        require(actualVaultBalance >= _amount, "YieldHarborVault: Insufficient vault balance to allocate");
        
        asset.safeApprove(address(_strategy), _amount); 
        _strategy.depositToStrategy(_amount); 
        
        strategyAllocations[address(_strategy)] += _amount;
        emit StrategyAllocated(address(_strategy), _amount);
    }

    /**
     * @dev Internal function to deallocate assets from strategies to the vault.
     * Simplified: Pulls from `currentStrategy` or iterates if more complex logic were needed.
     * @param _amount The amount of assets to attempt to deallocate.
     */
    function _deallocateFromStrategy(uint256 _amountNeeded) internal {
        if (_amountNeeded == 0) return;
        
        // Try to pull from current strategy first
        if (address(currentStrategy) != address(0)) {
            uint256 allocationInCurrent = strategyAllocations[address(currentStrategy)];
            uint256 amountToWithdrawCurrent = _amountNeeded > allocationInCurrent ? allocationInCurrent : _amountNeeded;
            
            if (amountToWithdrawCurrent > 0) {
                currentStrategy.withdrawFromStrategy(amountToWithdrawCurrent);
                strategyAllocations[address(currentStrategy)] -= amountToWithdrawCurrent;
                emit StrategyDeallocated(address(currentStrategy), amountToWithdrawCurrent);
                _amountNeeded -= amountToWithdrawCurrent;
                if(_amountNeeded == 0) return;
            }
        }

        // If more is needed, iterate through other strategies (simple FIFO for this example)
        for (uint i = 0; i < strategies.length; i++) {
            if (_amountNeeded == 0) break;
            IMockStrategy s = strategies[i];
            if (address(s) == address(currentStrategy)) continue; // Skip current, already handled

            uint256 allocationInS = strategyAllocations[address(s)];
            if (allocationInS > 0) {
                uint256 amountToWithdrawS = _amountNeeded > allocationInS ? allocationInS : _amountNeeded;
                s.withdrawFromStrategy(amountToWithdrawS);
                strategyAllocations[address(s)] -= amountToWithdrawS;
                emit StrategyDeallocated(address(s), amountToWithdrawS);
                _amountNeeded -= amountToWithdrawS;
            }
        }
        // If _amountNeeded is still > 0, it means strategies couldn't cover, vault might be undercollateralized.
        // This requires careful design in a real system.
    }

    /**
     * @notice Called by a strategy (or owner) to report its performance.
     * This function updates the vault's record of assets held by that strategy.
     * This is crucial for simulating yield, as an increase in `_newBalanceFromTheStrategy`
     * effectively increases `totalAssets` of the vault, thereby increasing `pricePerShare`.
     * Only callable by the owner (or a whitelisted reporter/strategy).
     * @param _strategyAddress The address of the reporting strategy.
     * @param _newBalanceFromTheStrategy The new total balance of underlying asset reported by the strategy.
     */
    function reportStrategyPerformance(address _strategyAddress, uint256 _newBalanceFromTheStrategy) external onlyOwner {
        require(_strategyAddress != address(0), "YieldHarborVault: Strategy address cannot be zero");
        
        bool strategyFound = false;
        for (uint i = 0; i < strategies.length; i++) {
            if (address(strategies[i]) == _strategyAddress) {
                strategyFound = true;
                break;
            }
        }
        require(strategyFound, "YieldHarborVault: Strategy not registered with the vault");

        uint256 oldAllocation = strategyAllocations[_strategyAddress];
        uint256 gain = 0;
        uint256 loss = 0;

        if (_newBalanceFromTheStrategy >= oldAllocation) {
            gain = _newBalanceFromTheStrategy - oldAllocation;
        } else {
            loss = oldAllocation - _newBalanceFromTheStrategy;
        }
        
        strategyAllocations[_strategyAddress] = _newBalanceFromTheStrategy;
        emit StrategyReported(_strategyAddress, gain, loss, _newBalanceFromTheStrategy);
    }
}
