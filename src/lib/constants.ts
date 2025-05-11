
// TODO: Replace with actual deployed contract addresses and full ABIs
export const SEPOLIA_CHAIN_ID = 11155111n; // Sepolia Testnet Chain ID

// Placeholder Addresses - Replace with your deployed contract addresses
export const HBT_TOKEN_ADDRESS = "0x0000000000000000000000000000000000000000"; // IMPORTANT: Replace this with actual deployed address
export const YIELD_HARBOR_VAULT_ADDRESS = "0x0000000000000000000000000000000000000000"; // IMPORTANT: Replace this with actual deployed address
export const STRATEGY_A_ADDRESS = "0x0000000000000000000000000000000000000000"; // IMPORTANT: Replace this with actual deployed address
export const STRATEGY_B_ADDRESS = "0x0000000000000000000000000000000000000000"; // IMPORTANT: Replace this with actual deployed address

// ABIs for frontend interaction
export const HBT_TOKEN_ABI = [
  // Standard ERC20 functions
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address account) view returns (uint256)",
  "function transfer(address recipient, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function transferFrom(address sender, address recipient, uint256 amount) returns (bool)",
  // Mint function (Ownable)
  "function mint(address account, uint256 amount)",
  // Standard ERC20 events
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "event Approval(address indexed owner, address indexed spender, uint256 value)"
];

export const YIELD_HARBOR_VAULT_ABI = [
  // Underlying asset info
  "function asset() view returns (address)",
  // Vault share ERC20 functions (inherited)
  "function name() view returns (string)", // Vault shares name
  "function symbol() view returns (string)", // Vault shares symbol
  "function decimals() view returns (uint8)", // Vault shares decimals (matches asset)
  "function totalSupply() view returns (uint256)", // Total vault shares
  "function balanceOf(address account) view returns (uint256)", // User's vault shares
  "function transfer(address recipient, uint256 amount) returns (bool)", // Transfer vault shares
  "function allowance(address owner, address spender) view returns (uint256)", // Allowance for vault shares
  "function approve(address spender, uint256 amount) returns (bool)", // Approve vault shares
  "function transferFrom(address sender, address recipient, uint256 amount) returns (bool)", // TransferFrom vault shares
  // Vault-specific functions
  "function totalAssets() view returns (uint256)",
  "function pricePerShare() view returns (uint256)",
  "function convertToShares(uint256 assetsAmount) view returns (uint256)",
  "function convertToAssets(uint256 sharesAmount) view returns (uint256)",
  "function deposit(uint256 amount, address receiver) payable", // Deposit underlying asset
  "function withdraw(uint256 sharesAmount, address receiver, address owner) payable", // Withdraw underlying asset by redeeming shares
  "function shares(address owner) view returns (uint256)", // User's vault shares (from YieldHarborVault directly)
  "function valueOfShares(address account) view returns (uint256)", // Value of user's shares in asset terms
  // Strategy Management
  "function strategies(uint256 index) view returns (address)", // Corrected: strategyAddresses -> strategies
  "function strategyAllocations(address strategy) view returns (uint256)",
  "function currentStrategy() view returns (address)",
  "function getStrategiesCount() view returns (uint256)",
  "function addStrategy(address strategyAddress)", // Ownable
  "function allocateToBestStrategy()", // Ownable
  "function setCurrentStrategy(address strategyAddress)", // Ownable
  "function reportStrategyPerformance(address strategyAddress, uint256 newBalanceFromTheStrategy)", // Ownable
  // Events
  "event Deposited(address indexed caller, address indexed owner, uint256 assets, uint256 shares)",
  "event Withdrawn(address indexed caller, address indexed receiver, address indexed owner, uint256 assets, uint256 shares)",
  "event StrategyAdded(address indexed strategyAddress)",
  "event StrategyAllocated(address indexed strategy, uint256 amount)",
  "event StrategyDeallocated(address indexed strategy, uint256 amount)",
  "event StrategyReported(address indexed strategy, uint256 gain, uint256 loss, uint256 currentBalance)"
];

export const MOCK_STRATEGY_ABI = [
  "function name() view returns (string)",
  "function asset() view returns (address)", // The token this strategy works with (e.g., HBT)
  "function vault() view returns (address)", // The YieldHarborVault address
  "function getAPY() view returns (uint256)", // Returns APY as basis points (e.g., 500 for 5.00%)
  "function balanceOfVault() view returns (uint256)", // Amount of 'asset' this strategy holds for the vault
  "function depositToStrategy(uint256 amount) external", // Called by Vault to deposit 'asset'
  "function withdrawFromStrategy(uint256 amount) external", // Called by Vault to withdraw 'asset'
  "function setAPY(uint256 newAPY) external", // Ownable: To simulate APY changes
  "function updateBalanceWithSimulatedYield(uint256 newBalance) external", // Ownable: For simulation
  // Events
  "event StrategyDeposited(address indexed fromVault, uint256 amount)",
  "event StrategyWithdrew(address indexed toVault, uint256 amount)",
  "event BalanceUpdatedForYield(uint256 newBalance)",
  "event APYUpdated(uint256 newAPY)"
];

export interface StrategyInfo {
  address: string;
  name: string;
  apy: number; 
  tvl: string; // Total value locked in this strategy (by the vault or overall, context-dependent)
  tokenSymbol?: string; // Symbol of the asset the strategy manages
}

// Mock data for strategies - for frontend display
export const MOCK_STRATEGIES_DATA: StrategyInfo[] = [
  { address: STRATEGY_A_ADDRESS, name: "AlphaStaker ETH", apy: 5.25, tvl: "150000", tokenSymbol: "stETH" },
  { address: STRATEGY_B_ADDRESS, name: "BetaLender USDC", apy: 3.75, tvl: "250000", tokenSymbol: "USDC" },
  { address: "0x0000000000000000000000000000000000000003", name: "GammaPool BTC", apy: 4.50, tvl: "100000", tokenSymbol: "WBTC" },
  { address: "0x0000000000000000000000000000000000000004", name: "DeltaYield USDT", apy: 6.10, tvl: "300000", tokenSymbol: "USDT"},
];
