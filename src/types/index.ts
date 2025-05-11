
export interface Strategy {
  id: string;
  name: string;
  apy: number; // Annual Percentage Yield, e.g., 5.25 for 5.25%
  tvl: string; // Total Value Locked in this strategy by the vault
  assetSymbol: string; // e.g., "stETH", "USDC"
  address: string; // Contract address of the strategy
  icon?: React.ElementType; // Optional: Lucide icon or custom SVG component
  description?: string;
}

export interface UserPortfolio {
  hbtBalance: string;
  vaultShares: string;
  vaultShareValueHBT: string; // Value of shares in HBT
  totalValueUSD?: string; // Optional: if price feeds were integrated
}

// You can add more specific types for contract interaction results, events, etc.
// Example:
// export interface DepositEvent {
//   user: string;
//   assetAmount: string;
//   sharesIssued: string;
//   timestamp: number;
// }
