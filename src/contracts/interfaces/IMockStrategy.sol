// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @dev Interface for a mock strategy.
 * In a real system, this would be a more complex interface or standard.
 */
interface IMockStrategy {
    /**
     * @notice Called by the Vault to deposit assets into this strategy.
     * The strategy should ensure it's approved to pull `amount` of `asset()` from the Vault.
     * @param amount The amount of `asset()` to deposit.
     */
    function depositToStrategy(uint256 amount) external;

    /**
     * @notice Called by the Vault to withdraw assets from this strategy.
     * The strategy should transfer `amount` of `asset()` back to the Vault.
     * @param amount The amount of `asset()` to withdraw.
     */
    function withdrawFromStrategy(uint256 amount) external;

    /**
     * @notice Returns the amount of `asset()` this strategy currently holds on behalf of the Vault.
     * @return The balance of `asset()` managed by this strategy for the Vault.
     */
    function balanceOfVault() external view returns (uint256);

    /**
     * @notice Returns the Annual Percentage Yield (APY) of this strategy.
     * For mock strategies, this could be a settable value.
     * Typically returned as basis points (e.g., 500 for 5.00%).
     * @return The APY of the strategy.
     */
    function getAPY() external view returns (uint256);

    /**
     * @notice Returns the name of the strategy.
     * @return The strategy's name.
     */
    function name() external view returns (string);

    /**
     * @notice Returns the address of the ERC20 token this strategy operates on.
     * Should match the Vault's asset.
     * @return The address of the asset token.
     */
    function asset() external view returns (address);

    // Events that might be useful for this mock strategy
    event StrategyDeposited(address indexed fromVault, uint256 amount);
    event StrategyWithdrew(address indexed toVault, uint256 amount);
    event APYUpdated(uint256 newAPY);
    event BalanceUpdatedForYield(uint256 newBalance);
}
