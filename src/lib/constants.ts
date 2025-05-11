
// TODO: Replace with actual deployed contract addresses and full ABIs
export const SEPOLIA_CHAIN_ID = 11155111n; // Sepolia Testnet Chain ID

// Placeholder Addresses - Replace with your deployed contract addresses
// Example placeholder addresses if deploying locally with Hardhat:
export const HBT_TOKEN_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Default Hardhat account 0 deploys this
export const YIELD_HARBOR_VAULT_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"; // Default Hardhat account 0 deploys this next
export const STRATEGY_A_ADDRESS = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0"; // etc.
export const STRATEGY_B_ADDRESS = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9"; 

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
  "function name() view returns (string)", 
  "function symbol() view returns (string)", 
  "function decimals() view returns (uint8)", 
  "function totalSupply() view returns (uint256)", 
  "function balanceOf(address account) view returns (uint256)", 
  "function transfer(address recipient, uint256 amount) returns (bool)", 
  "function allowance(address owner, address spender) view returns (uint256)", 
  "function approve(address spender, uint256 amount) returns (bool)", 
  "function transferFrom(address sender, address recipient, uint256 amount) returns (bool)", 
  // Vault-specific functions
  "function totalAssets() view returns (uint256)",
  "function pricePerShare() view returns (uint256)",
  "function convertToShares(uint256 assetsAmount) view returns (uint256)",
  "function convertToAssets(uint256 sharesAmount) view returns (uint256)",
  "function deposit(uint256 amount, address receiver) returns (uint256 shares)", // payable removed
  "function withdraw(uint256 sharesAmount, address receiver, address owner) returns (uint256 assets)", // payable removed
  // Strategy Management
  "function strategies(uint256 index) view returns (address)", // Note: Solidity uses IMockStrategy[] now, ABI string stays generic address
  "function strategyAllocations(address strategy) view returns (uint256)",
  "function currentStrategy() view returns (address)", // Note: Solidity uses IMockStrategy now
  "function getStrategiesCount() view returns (uint256)",
  "function addStrategy(address strategyAddress)", 
  "function allocateToBestStrategy()", 
  "function setCurrentStrategy(address strategyAddress)", 
  "function reportStrategyPerformance(address strategyAddress, uint256 newBalanceFromTheStrategy)", 
  // Events
  "event Deposited(address indexed caller, address indexed receiver, uint256 assets, uint256 shares)",
  "event Withdrawn(address indexed caller, address indexed receiver, address indexed owner, uint256 assets, uint256 shares)",
  "event StrategyAdded(address indexed strategyAddress)",
  "event StrategyAllocated(address indexed strategy, uint256 amount)",
  "event StrategyDeallocated(address indexed strategy, uint256 amount)",
  "event CurrentStrategySet(address indexed strategyAddress)",
  "event StrategyReported(address indexed strategy, uint256 gain, uint256 loss, uint256 currentBalanceInStrategy)"
];

export const MOCK_STRATEGY_ABI = [
  "function name() view returns (string)",
  "function asset() view returns (address)", 
  "function vault() view returns (address)", 
  "function getAPY() view returns (uint256)", 
  "function balanceOfVault() view returns (uint256)", 
  "function depositToStrategy(uint256 amount) external", 
  "function withdrawFromStrategy(uint256 amount) external", 
  "function setAPY(uint256 newAPY) external", 
  "function updateBalanceWithSimulatedYield(uint256 newBalance) external", 
  // Events from IMockStrategy
  "event StrategyDeposited(address indexed fromVault, uint256 amount)",
  "event StrategyWithdrew(address indexed toVault, uint256 amount)",
  "event APYUpdated(uint256 newAPY)",
  "event BalanceUpdatedForYield(uint256 newBalance)"
];

export interface StrategyInfo {
  address: string;
  name: string;
  apy: number; 
  tvl: string; 
  tokenSymbol?: string; 
}

// Mock data for strategies - for frontend display
export const MOCK_STRATEGIES_DATA: StrategyInfo[] = [
  { address: STRATEGY_A_ADDRESS, name: "AlphaStaker ETH", apy: 5.25, tvl: "150000", tokenSymbol: "stETH" },
  { address: STRATEGY_B_ADDRESS, name: "BetaLender USDC", apy: 3.75, tvl: "250000", tokenSymbol: "USDC" },
  { address: "0x0000000000000000000000000000000000000003", name: "GammaPool BTC", apy: 4.50, tvl: "100000", tokenSymbol: "WBTC" },
  { address: "0x0000000000000000000000000000000000000004", name: "DeltaYield USDT", apy: 6.10, tvl: "300000", tokenSymbol: "USDT"},
];
