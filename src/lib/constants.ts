
// TODO: Replace with actual deployed contract addresses and full ABIs
export const SEPOLIA_CHAIN_ID = 11155111n; // Sepolia Testnet Chain ID

// Placeholder Addresses - Replace with your deployed contract addresses
// Using the zero address as a valid placeholder to prevent Ethers.js errors.
// Replace these with actual deployed contract addresses for functionality.
export const HBT_TOKEN_ADDRESS = "0x0000000000000000000000000000000000000000";
export const YIELD_HARBOR_VAULT_ADDRESS = "0x0000000000000000000000000000000000000000";
export const STRATEGY_A_ADDRESS = "0x0000000000000000000000000000000000000001"; // Different to avoid collision if used as map keys
export const STRATEGY_B_ADDRESS = "0x0000000000000000000000000000000000000002";

// Minimal ABIs for frontend interaction
export const HBT_TOKEN_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address account) view returns (uint256)",
  "function transfer(address recipient, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function transferFrom(address sender, address recipient, uint256 amount) returns (bool)",
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "event Approval(address indexed owner, address indexed spender, uint256 value)"
];

export const YIELD_HARBOR_VAULT_ABI = [
  "function asset() view returns (address)",
  "function totalAssets() view returns (uint256)",
  "function pricePerShare() view returns (uint256)",
  "function shares(address account) view returns (uint256)",
  "function balanceOf(address account) view returns (uint256)", // Value of shares for account
  "function deposit(uint256 amount)",
  "function withdraw(uint256 sharesAmount)",
  "function currentStrategy() view returns (address)",
  "function strategyAllocations(address strategy) view returns (uint256)",
  "function strategies(uint256 index) view returns (address)", // To get all strategies, loop or get count
  "function getStrategiesCount() view returns (uint256)",
  "function allocateToBestStrategy()", // For admin/owner
  "event Deposited(address indexed user, uint256 amount, uint256 sharesIssued)",
  "event Withdrawn(address indexed user, uint256 amount, uint256 sharesBurned)",
  "event StrategyAllocated(address indexed strategy, uint256 amount)"
];

export const MOCK_STRATEGY_ABI = [
  "function token() view returns (address)",
  "function getAPY() view returns (uint256)", // e.g., 500 for 5.00%
  "function balanceOfVault() view returns (uint256)", // How much the vault has deposited in this strategy
  "function name() view returns (string)" // Added for display
];

export interface StrategyInfo {
  address: string;
  name: string;
  apy: number; // Represent as percentage, e.g., 5.5 for 5.5%
  tvl: string; // Total value locked in this strategy by the vault
  tokenSymbol?: string;
}

// Mock data for strategies - in a real app, this would be fetched from contracts
export const MOCK_STRATEGIES_DATA: StrategyInfo[] = [
  { address: STRATEGY_A_ADDRESS, name: "AlphaStaker ETH", apy: 5.25, tvl: "150000", tokenSymbol: "stETH" },
  { address: STRATEGY_B_ADDRESS, name: "BetaLender USDC", apy: 3.75, tvl: "250000", tokenSymbol: "USDC" },
  { address: "0x0000000000000000000000000000000000000003", name: "GammaPool BTC", apy: 4.50, tvl: "100000", tokenSymbol: "WBTC" },
  { address: "0x0000000000000000000000000000000000000004", name: "DeltaYield USDT", apy: 6.10, tvl: "300000", tokenSymbol: "USDT"},
];

