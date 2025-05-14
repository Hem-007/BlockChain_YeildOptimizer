
# YieldHarbor - Cross-Chain Yield Optimizer (Conceptual)

YieldHarbor is a Next.js decentralized application (DApp) that demonstrates a conceptual Cross-Chain Yield Optimizer. It allows users to interact with a simulated DeFi Vault on the Sepolia testnet, which aggregates yield from various mock strategy sources.

## Concept

The core idea is to simulate a DeFi Vault that can:
- Accept user deposits/withdrawals of an ERC20 token (Harbor Token - HBT).
- Track user shares within the Vault.
- Simulate querying different yield strategies (conceptually representing off-chain or Layer 2 locations).
- Allocate funds to the highest-yielding strategy (simulated).
- Calculate and display accrued yield (conceptually).

This project focuses on the frontend user experience and the conceptual smart contract interactions, rather than actual cross-chain transactions.

## Features

- **Vault Contract**: A central smart contract on Sepolia for deposits, withdrawals, and share tracking.
- **Mock Strategy Contracts**: Simple Solidity contracts simulating different yield sources with varying APYs.
- **ERC20 Token (HBT)**: A custom ERC20 token used within the platform.
- **Web Interface (Next.js & ShadCN UI)**:
    - **Dashboard**: Overview of vault statistics and user balances.
    - **Deposit Page**: Deposit HBT tokens into the vault.
    - **Withdraw Page**: Withdraw HBT tokens from the vault by redeeming shares.
    - **Strategies Page**: View available (mock) strategies, their APYs, and the vault's conceptual allocation.
    - **Portfolio Page**: Display detailed user balances, including HBT, vault shares, and share value.
- **Wallet Connection**: Connects to Metamask, specifically for the Sepolia testnet.
- **Professional UI/UX**: Designed with a calm color palette (Soft Teal, Light Gray, Warm Amber) and clean, readable typography.

## Tech Stack

- **Frontend**: Next.js (App Router), React, TypeScript, Tailwind CSS, ShadCN UI
- **Wallet Interaction**: Ethers.js
- **Smart Contracts**: Solidity
    - ERC20 Token (`HarborToken.sol`)
    - Vault (`YieldHarborVault.sol`)
    - Mock Strategies (`StrategyA.sol`, `StrategyB.sol`)
- **Blockchain**: Ethereum Sepolia Testnet
- **Development Tools (for Smart Contracts - not included in this Next.js setup)**: Hardhat or Truffle (user's choice)

## Getting Started

### Prerequisites

- Node.js (v18 or later recommended)
- npm or yarn
- Metamask browser extension

### 1. Clone the Repository

```bash
git clone <repository-url>
cd yieldharbor
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Set Up Environment Variables (Optional)

If contract addresses are managed via environment variables (currently they are in `src/lib/constants.ts`), create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_HBT_TOKEN_ADDRESS=0xYourHarborTokenAddressOnSepolia
NEXT_PUBLIC_YIELD_HARBOR_VAULT_ADDRESS=0xYourYieldHarborVaultAddressOnSepolia
# Add other contract addresses as needed
```
**Note**: For this project, contract addresses are hardcoded in `src/lib/constants.ts`. You'll need to update these with your deployed contract addresses.

### 4. Running the Frontend Application

```bash
npm run dev
# or
yarn dev
```
Open [http://localhost:3000](http://localhost:3000) (or the specified port, likely 9002 as per package.json script) in your browser.

## Smart Contract Deployment (Conceptual Guide)

The Solidity smart contracts are located in the `src/contracts/` directory. To deploy them, you'll need a Solidity development environment like Hardhat or Truffle.

### General Steps (using Hardhat as an example):

1.  **Set up a Hardhat Project**:
    If you don't have one, `npx hardhat` in a separate directory. Copy the `.sol` files from `src/contracts/` into your Hardhat project's `contracts` folder. You'll also need OpenZeppelin contracts: `npm install @openzeppelin/contracts`.

2.  **Write Deployment Scripts**:
    Create deployment scripts in Hardhat's `scripts/` directory.
    Example for `HarborToken.sol`:
    ```javascript
    // scripts/deployHarborToken.js
    async function main() {
      const [deployer] = await ethers.getSigners();
      console.log("Deploying HarborToken with the account:", deployer.address);
      const HarborToken = await ethers.getContractFactory("HarborToken");
      const harborToken = await HarborToken.deploy(deployer.address); // Pass initial owner
      await harborToken.deployed();
      console.log("HarborToken deployed to:", harborToken.address);
    }
    main().catch(console.error);
    ```
    You'll need similar scripts for `YieldHarborVault.sol` (passing the HBT token address) and the `MockStrategy` contracts (passing HBT address, Vault address, initial APY, name, and owner).

3.  **Configure Hardhat for Sepolia**:
    Update `hardhat.config.js` with Sepolia network details and your deployer account (e.g., using a private key securely managed via environment variables and a `.env` file for Hardhat).
    ```javascript
    // hardhat.config.js
    require("@nomiclabs/hardhat-waffle");
    require("dotenv").config(); // For environment variables

    module.exports = {
      solidity: "0.8.20",
      networks: {
        sepolia: {
          url: `https://sepolia.infura.io/v3/${process.env.INFURA_PROJECT_ID}`, // Or Alchemy, etc.
          accounts: [`0x${process.env.SEPOLIA_PRIVATE_KEY}`],
        },
      },
    };
    ```

4.  **Deploy**:
    ```bash
    npx hardhat run scripts/deployHarborToken.js --network sepolia
    npx hardhat run scripts/deployYieldHarborVault.js --network sepolia
    # ... and so on for strategies
    ```

5.  **Update Frontend Constants**:
    After deployment, copy the deployed contract addresses and update them in `src/lib/constants.ts` in the Next.js project. You may also need to copy parts of the ABI if they change significantly from the minimal versions provided.

### Interacting with Deployed Contracts:

- **Get Sepolia ETH**: You'll need Sepolia ETH for gas fees. Use a Sepolia faucet (e.g., [sepoliafaucet.com](https://sepoliafaucet.com/), [infura.io/faucet/sepolia](https://infura.io/faucet/sepolia)).
- **Mint HBT Tokens**: The `HarborToken` owner (deployer) can mint HBT tokens and distribute them to test accounts. You can do this via Hardhat tasks or by interacting with the contract on Etherscan.
- **Configure Vault**: The vault owner (deployer) needs to:
    - Add strategy contract addresses to the vault using `addStrategy()`.
    - Optionally, call `allocateToBestStrategy()` to initialize allocation.

## Using YieldHarbor

1.  **Connect Metamask**:
    - Ensure Metamask is installed and set to the **Sepolia Testnet**.
    - Click "Connect Wallet" on the YieldHarbor interface.

2.  **Acquire HBT Tokens**:
    - For testing, you'll need HBT tokens. The deployer of `HarborToken.sol` should mint and send these to your test account.

3.  **Explore Features**:
    - **Dashboard**: View overall stats.
    - **Deposit**: Approve the vault to spend your HBT, then deposit HBT to receive vault shares.
    - **Withdraw**: Redeem your vault shares to get back HBT.
    - **Strategies**: See the (mock) strategies and their (simulated) APYs. The vault owner can trigger a simulated reallocation.
    - **Portfolio**: Check your HBT balance, vault shares, and the current value of your shares.

## Important Notes

- **Conceptual/Simulated**: This project simulates cross-chain interactions and yield generation. No actual cross-chain transactions occur. All operations are on the Sepolia testnet.
- **Testnet Only**: All tokens and values are for testing and demonstration on Sepolia and have **no real-world financial value**.
- **Security**: Smart contracts are provided as examples and have not undergone a formal security audit. Do not use similar unaudited code in a mainnet environment with real funds.

## Project Structure Highlights

- `src/app/`: Next.js App Router pages.
    - `(main)/`: Route group for main application pages with shared layout.
    - `page.tsx`: Landing page.
- `src/components/`: Reusable React components.
    - `layout/`: Sidebar, Header components.
    - `ui/`: ShadCN UI components.
    - `wallet-connector.tsx`: Metamask connection logic.
    - Other feature-specific components (`deposit-form.tsx`, etc.).
- `src/contexts/`: React Context for global state (e.g., `web3-context.tsx`).
- `src/lib/`: Utility functions, constants (contract addresses, ABIs).
- `src/contracts/`: Solidity smart contract files.

## Customization and Further Development

- Implement actual data fetching for strategies instead of mock data.
- Enhance the `allocateToBestStrategy` logic with more sophisticated (simulated) metrics.
- Add more detailed transaction history.
- Integrate a block explorer link for transactions.
- Expand on the conceptual cross-chain messaging patterns.
- Implement more complex yield-bearing strategies (conceptually).
```

This README provides a comprehensive guide for users to understand, set up, and run the YieldHarbor application.
#   B l o c k C h a i n _ Y e i l d O p t i m i z e r  
 