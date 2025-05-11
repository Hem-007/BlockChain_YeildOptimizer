// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IMockStrategy {
    function name() external view returns (string memory);
    function asset() external view returns (address); // Renamed from token() for clarity
    function getAPY() external view returns (uint256); // e.g., 500 for 5.00%
    function balanceOfVault() external view returns (uint256); // Current value of assets this strategy holds for the vault
    
    // Functions callable by the Vault (likely Ownable or restricted access)
    function depositToStrategy(uint256 amount) external; // Called by Vault to send assets
    function withdrawFromStrategy(uint256 amount) external; // Called by Vault to recall assets

    // Function for owner/admin to simulate yield accumulation
    function updateBalanceWithSimulatedYield(uint256 newBalance) external;
}
