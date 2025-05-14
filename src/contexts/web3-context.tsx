"use client";

import type { Signer } from "ethers";
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode, useMemo } from 'react';
import { BrowserProvider, Contract, formatUnits, parseUnits } from 'ethers';
import { useToast } from "@/hooks/use-toast";
import { HBT_TOKEN_ADDRESS, YIELD_HARBOR_VAULT_ADDRESS, HBT_TOKEN_ABI, YIELD_HARBOR_VAULT_ABI, SEPOLIA_CHAIN_ID, MOCK_STRATEGIES_DATA } from '@/lib/constants';

interface Web3ContextType {
  provider: BrowserProvider | null;
  signer: Signer | null;
  account: string | null;
  chainId: bigint | null;
  hbtBalance: string;
  vaultShares: string;
  vaultShareValue: string;
  tvl: string;
  isConnected: boolean;
  // Fake token simulation properties
  fakeTokenBalance: string;
  fakeVaultShares: string;
  fakeVaultShareValue: string;
  isSimulationMode: boolean;
  // Standard functions
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  getHBTBalance: () => Promise<void>;
  getVaultData: () => Promise<void>;
  depositToVault: (amount: string) => Promise<boolean>;
  withdrawFromVault: (shares: string) => Promise<boolean>;
  approveHBT: (amount: string) => Promise<boolean>;
  getAllowance: () => Promise<string>;
  // Fake token simulation functions
  toggleSimulationMode: () => void;
  depositFakeTokens: (amount: string) => Promise<boolean>;
  withdrawFakeTokens: (shares: string) => Promise<boolean>;
  allocateFakeTokensToNewUser: () => void;
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

export const Web3Provider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Standard blockchain state
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [signer, setSigner] = useState<Signer | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<bigint | null>(null);
  const [hbtBalance, setHbtBalance] = useState<string>("0");
  const [vaultShares, setVaultShares] = useState<string>("0");
  const [vaultShareValue, setVaultShareValue] = useState<string>("0");
  const [tvl, setTvl] = useState<string>("0");

  // Fake token simulation state
  const [fakeTokenBalance, setFakeTokenBalance] = useState<string>("0");
  const [fakeVaultShares, setFakeVaultShares] = useState<string>("0");
  const [fakeVaultShareValue, setFakeVaultShareValue] = useState<string>("0");
  const [isSimulationMode, setIsSimulationMode] = useState<boolean>(true); // Default to simulation mode
  const [lastDepositTime, setLastDepositTime] = useState<number>(0);
  const [hasAllocatedTokens, setHasAllocatedTokens] = useState<boolean>(false);

  const { toast } = useToast();

  // Moved isConnected definition earlier and wrapped with useMemo
  const isConnected = useMemo(() => {
    return !!provider && !!signer && !!account && chainId === SEPOLIA_CHAIN_ID;
  }, [provider, signer, account, chainId]);

  const SEPOLIA_CHAIN_ID_HEX = `0x${SEPOLIA_CHAIN_ID.toString(16)}`;

  const disconnectWallet = useCallback(() => {
    setProvider(null);
    setSigner(null);
    setAccount(null);
    setChainId(null);
    setHbtBalance("0");
    setVaultShares("0");
    setVaultShareValue("0");
    // Reset fake token state too
    setFakeTokenBalance("0");
    setFakeVaultShares("0");
    setFakeVaultShareValue("0");
    setHasAllocatedTokens(false);
    if (typeof window !== 'undefined') {
      localStorage.removeItem("isWalletConnected");
    }
    toast({ title: "Wallet Disconnected" });
  }, [toast]);

  const handleAccountsChanged = useCallback((accounts: string[]) => {
    if (accounts.length === 0) {
      disconnectWallet();
    } else {
      setAccount(accounts[0]);
      // Re-fetch data for new account if connected state implies it
      // This will be handled by the useEffect watching `account` and `isConnected`
    }
  }, [disconnectWallet]);

  const handleChainChanged = useCallback((newChainId: string) => {
    const numChainId = BigInt(newChainId);
    setChainId(numChainId);
    if (numChainId !== SEPOLIA_CHAIN_ID) {
      toast({
        title: "Wrong Network",
        description: `Please switch to Sepolia testnet. Detected chain ID: ${newChainId}`,
        variant: "destructive",
      });
      // Do not disconnect here, allow isConnected to reflect false, UI can react.
      // If we want to force disconnect: disconnectWallet();
    }
    // Data fetching will be re-triggered by useEffect watching `chainId` and `isConnected`
  }, [toast, SEPOLIA_CHAIN_ID]);


  const connectWallet = useCallback(async () => {
    if (typeof window.ethereum === 'undefined') {
      toast({ title: "Error", description: "Metamask is not installed.", variant: "destructive" });
      return;
    }
    try {
      const browserProvider = new BrowserProvider(window.ethereum);
      const accounts = await browserProvider.send("eth_requestAccounts", []);

      if (accounts.length > 0) {
        const currentSigner = await browserProvider.getSigner();
        const currentAccount = accounts[0];
        const network = await browserProvider.getNetwork();

        setProvider(browserProvider);
        setSigner(currentSigner);
        setAccount(currentAccount);
        setChainId(network.chainId);

        if (network.chainId !== SEPOLIA_CHAIN_ID) {
          toast({
            title: "Wrong Network",
            description: "Please switch to Sepolia testnet. Attempting to switch...",
            variant: "destructive",
          });
          try {
            await window.ethereum.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: SEPOLIA_CHAIN_ID_HEX }],
            });
            // After successful switch, chainChanged event will fire and update chainId state
          } catch (switchError: any) {
            if (switchError.code === 4902) {
              toast({
                title: "Network Not Added",
                description: "Sepolia testnet is not added to your MetaMask. Please add it manually.",
                variant: "destructive",
              });
            } else {
               toast({ title: "Network Switch Failed", description: switchError.message, variant: "destructive"});
            }
            // Even if switch fails, keep the connection attempt's state updates
            // isConnected will be false, UI will guide user.
            return;
          }
        }

        if (typeof window !== 'undefined') {
          localStorage.setItem("isWalletConnected", "true");
        }
        // Toast for successful connection will be handled by useEffect watching isConnected
      }
    } catch (error: any) {
      toast({ title: "Connection Failed", description: error.message, variant: "destructive" });
    }
  }, [toast, SEPOLIA_CHAIN_ID_HEX, SEPOLIA_CHAIN_ID]);


  useEffect(() => {
    if (typeof window !== 'undefined' && localStorage.getItem("isWalletConnected") === "true" && !account) {
      // Only attempt auto-connect if not already connected/connecting
      connectWallet();
    }
  }, [connectWallet, account]);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.ethereum) {
      window.ethereum.on("accountsChanged", handleAccountsChanged);
      window.ethereum.on("chainChanged", handleChainChanged);

      return () => {
        if (window.ethereum.removeListener) {
          window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
          window.ethereum.removeListener("chainChanged", handleChainChanged);
        }
      };
    }
  }, [handleAccountsChanged, handleChainChanged]);

  const getHBTBalance = useCallback(async () => {
    // Skip real token balance check if in simulation mode
    if (isSimulationMode) {
      setHbtBalance("0");
      return;
    }

    if (!signer || !account || !provider) return;
    try {
      const tokenContract = new Contract(HBT_TOKEN_ADDRESS, HBT_TOKEN_ABI, signer);
      const balance = await tokenContract.balanceOf(account);
      setHbtBalance(formatUnits(balance, 18));
    } catch (error: any) {
      // Silently set balance to 0 without showing error toast
      console.log("Error fetching HBT balance:", error.message);
      setHbtBalance("0");
    }
  }, [signer, account, provider, toast, isSimulationMode]);

  const getVaultData = useCallback(async () => {
    // Skip real vault data check if in simulation mode
    if (isSimulationMode) {
      // Don't update real vault data in simulation mode
      return;
    }

    if (!signer || !account || !provider) return;
    try {
      const vaultContract = new Contract(YIELD_HARBOR_VAULT_ADDRESS, YIELD_HARBOR_VAULT_ABI, signer);
      const shares = await vaultContract.shares(account);
      const totalAssets = await vaultContract.totalAssets();
      const pricePerShare = await vaultContract.pricePerShare();

      setVaultShares(formatUnits(shares, 18));
      const userShareValue = (BigInt(shares) * BigInt(pricePerShare)) / BigInt(10)**BigInt(18);
      setVaultShareValue(formatUnits(userShareValue, 18));
      setTvl(formatUnits(totalAssets, 18));

    } catch (error: any) {
      // Silently set values to 0 without showing error toast
      console.log("Error fetching vault data:", error.message);
      setVaultShares("0");
      setVaultShareValue("0");
      setTvl("0");
    }
  }, [signer, account, provider, toast, isSimulationMode]);

  // Toggle between real blockchain and simulation mode
  const toggleSimulationMode = useCallback(() => {
    setIsSimulationMode(prev => !prev);
    toast({
      title: `Switched to ${!isSimulationMode ? "Simulation" : "Blockchain"} Mode`,
      description: !isSimulationMode
        ? "Using fake tokens for testing"
        : "Using real blockchain tokens"
    });
  }, [isSimulationMode, toast]);

  // Allocate fake tokens to new users
  const allocateFakeTokensToNewUser = useCallback(() => {
    if (!hasAllocatedTokens && account) {
      const initialTokens = "1000"; // Give 1000 fake tokens to start
      setFakeTokenBalance(initialTokens);
      setHasAllocatedTokens(true);

      // Save to localStorage to persist between sessions
      if (typeof window !== 'undefined' && account) {
        localStorage.setItem(`fakeTokens_${account}`, initialTokens);
        localStorage.setItem(`hasAllocated_${account}`, "true");
      }

      toast({
        title: "Fake Tokens Allocated",
        description: `${initialTokens} test tokens have been added to your account for testing.`
      });
    }
  }, [account, hasAllocatedTokens, toast]);

  // Calculate simulated yield based on time and strategy APY
  // With accelerated time: 1 second real time = 1 hour simulated time
  const calculateYield = useCallback((amount: string, depositTimeMs: number): string => {
    if (!depositTimeMs) return amount;

    // Get average APY from strategies
    const avgApy = MOCK_STRATEGIES_DATA.reduce((sum, strategy) => sum + strategy.apy, 0) / MOCK_STRATEGIES_DATA.length;

    // Calculate time difference in seconds
    const now = Date.now();
    const timeDiffSeconds = (now - depositTimeMs) / 1000;

    // Accelerate time: 1 second real time = 1 hour simulated time (3600 seconds)
    const acceleratedTimeDiffSeconds = timeDiffSeconds * 3600;

    // Convert APY to per-second rate (APY / seconds in a year)
    const secondRate = avgApy / 100 / (365 * 24 * 60 * 60);

    // Calculate yield: principal * (1 + rate)^time
    const principal = parseFloat(amount);
    const yieldAmount = principal * (1 + secondRate * acceleratedTimeDiffSeconds);

    return yieldAmount.toFixed(6);
  }, []);

  // Deposit fake tokens to the vault
  const depositFakeTokens = useCallback(async (amount: string): Promise<boolean> => {
    if (!account || parseFloat(amount) <= 0 || parseFloat(amount) > parseFloat(fakeTokenBalance)) {
      toast({
        title: "Deposit Failed",
        description: "Invalid amount or insufficient balance",
        variant: "destructive"
      });
      return false;
    }

    try {
      // Calculate new balances
      const newFakeTokenBalance = (parseFloat(fakeTokenBalance) - parseFloat(amount)).toString();
      const newFakeVaultShares = (parseFloat(fakeVaultShares) + parseFloat(amount)).toString();

      // Update state
      setFakeTokenBalance(newFakeTokenBalance);
      setFakeVaultShares(newFakeVaultShares);
      setFakeVaultShareValue(newFakeVaultShares); // Initially 1:1 ratio
      const depositTime = Date.now();
      setLastDepositTime(depositTime);

      // Save to localStorage
      if (typeof window !== 'undefined' && account) {
        localStorage.setItem(`fakeTokens_${account}`, newFakeTokenBalance);
        localStorage.setItem(`fakeShares_${account}`, newFakeVaultShares);
        localStorage.setItem(`lastDepositTime_${account}`, depositTime.toString());

        // Record transaction in history
        const storedTransactions = localStorage.getItem(`transactions_${account}`);
        const transactions = storedTransactions ? JSON.parse(storedTransactions) : [];

        // Find the highest APY strategy for primary allocation
        const sortedStrategies = [...MOCK_STRATEGIES_DATA].sort((a, b) => b.apy - a.apy);
        const primaryStrategy = sortedStrategies[0];

        // Create new transaction record
        const newTransaction = {
          id: "tx-" + Math.random().toString(36).substring(2, 10),
          type: "deposit",
          amount: amount,
          timestamp: depositTime,
          primaryStrategy: primaryStrategy.name,
          strategies: [
            { name: primaryStrategy.name, percentage: 60, apy: primaryStrategy.apy, isPrimary: true },
            { name: "BetaLender USDC", percentage: 20, apy: 3.75 },
            { name: "GammaPool BTC", percentage: 15, apy: 4.50 },
            { name: "DeltaYield USDT", percentage: 5, apy: 6.10 }
          ]
        };

        // Add to transaction history
        transactions.unshift(newTransaction);
        localStorage.setItem(`transactions_${account}`, JSON.stringify(transactions));
      }

      toast({
        title: "Simulated Deposit Successful",
        description: `${amount} tokens deposited to vault in simulation mode.`
      });
      return true;
    } catch (error: any) {
      toast({
        title: "Simulated Deposit Failed",
        description: error.message,
        variant: "destructive"
      });
      return false;
    }
  }, [account, fakeTokenBalance, fakeVaultShares, toast]);

  // Withdraw fake tokens from the vault with yield
  const withdrawFakeTokens = useCallback(async (shares: string): Promise<boolean> => {
    if (!account || parseFloat(shares) <= 0 || parseFloat(shares) > parseFloat(fakeVaultShares)) {
      toast({
        title: "Withdrawal Failed",
        description: "Invalid amount or insufficient shares",
        variant: "destructive"
      });
      return false;
    }

    try {
      // Calculate yield based on time since deposit
      const depositTime = lastDepositTime || (typeof window !== 'undefined' ?
        parseInt(localStorage.getItem(`lastDepositTime_${account}`) || "0") : 0);

      // Calculate amount to withdraw with yield
      const withdrawAmount = calculateYield(shares, depositTime);

      // Calculate yield earned
      const yieldEarned = (parseFloat(withdrawAmount) - parseFloat(shares)).toFixed(4);

      // Calculate new balances
      const newFakeVaultShares = (parseFloat(fakeVaultShares) - parseFloat(shares)).toString();
      const newFakeTokenBalance = (parseFloat(fakeTokenBalance) + parseFloat(withdrawAmount)).toString();

      // Update state
      setFakeVaultShares(newFakeVaultShares);
      setFakeTokenBalance(newFakeTokenBalance);

      // Recalculate share value if shares remain
      if (parseFloat(newFakeVaultShares) > 0) {
        setFakeVaultShareValue(newFakeVaultShares);
      } else {
        setFakeVaultShareValue("0");
        setLastDepositTime(0);
      }

      // Save to localStorage
      if (typeof window !== 'undefined' && account) {
        localStorage.setItem(`fakeTokens_${account}`, newFakeTokenBalance);
        localStorage.setItem(`fakeShares_${account}`, newFakeVaultShares);
        if (parseFloat(newFakeVaultShares) <= 0) {
          localStorage.removeItem(`lastDepositTime_${account}`);
        }

        // Record transaction in history
        const storedTransactions = localStorage.getItem(`transactions_${account}`);
        const transactions = storedTransactions ? JSON.parse(storedTransactions) : [];

        // Find the highest APY strategy for primary allocation
        const sortedStrategies = [...MOCK_STRATEGIES_DATA].sort((a, b) => b.apy - a.apy);
        const primaryStrategy = sortedStrategies[0];

        // Create new transaction record
        const newTransaction = {
          id: "tx-" + Math.random().toString(36).substring(2, 10),
          type: "withdraw",
          amount: shares,
          timestamp: Date.now(),
          primaryStrategy: primaryStrategy.name,
          strategies: [
            { name: primaryStrategy.name, percentage: 60, apy: primaryStrategy.apy, isPrimary: true },
            { name: "BetaLender USDC", percentage: 20, apy: 3.75 },
            { name: "GammaPool BTC", percentage: 15, apy: 4.50 },
            { name: "DeltaYield USDT", percentage: 5, apy: 6.10 }
          ],
          yieldEarned: yieldEarned
        };

        // Add to transaction history
        transactions.unshift(newTransaction);
        localStorage.setItem(`transactions_${account}`, JSON.stringify(transactions));
      }

      toast({
        title: "Simulated Withdrawal Successful",
        description: `${withdrawAmount} tokens (including yield) withdrawn from vault in simulation mode.`
      });
      return true;
    } catch (error: any) {
      toast({
        title: "Simulated Withdrawal Failed",
        description: error.message,
        variant: "destructive"
      });
      return false;
    }
  }, [account, fakeTokenBalance, fakeVaultShares, lastDepositTime, calculateYield, toast]);

  // Ensure we start in simulation mode
  useEffect(() => {
    // Always start in simulation mode
    if (!isSimulationMode) {
      setIsSimulationMode(true);
    }
  }, []);

  // Load fake token data from localStorage
  useEffect(() => {
    if (account && typeof window !== 'undefined') {
      const storedTokens = localStorage.getItem(`fakeTokens_${account}`);
      const storedShares = localStorage.getItem(`fakeShares_${account}`);
      const storedHasAllocated = localStorage.getItem(`hasAllocated_${account}`);
      const storedDepositTime = localStorage.getItem(`lastDepositTime_${account}`);

      if (storedTokens) setFakeTokenBalance(storedTokens);
      if (storedShares) {
        setFakeVaultShares(storedShares);
        setFakeVaultShareValue(storedShares); // Initially 1:1 ratio
      }
      if (storedHasAllocated) setHasAllocatedTokens(storedHasAllocated === "true");
      if (storedDepositTime) setLastDepositTime(parseInt(storedDepositTime));

      // If user hasn't been allocated tokens yet, do it now
      if (!storedHasAllocated || storedHasAllocated !== "true") {
        allocateFakeTokensToNewUser();
      }
    }
  }, [account, allocateFakeTokensToNewUser]);

  // Update fake vault share value periodically to simulate yield growth
  useEffect(() => {
    if (isConnected && parseFloat(fakeVaultShares) > 0) {
      const interval = setInterval(() => {
        const updatedShareValue = calculateYield(fakeVaultShares, lastDepositTime);
        setFakeVaultShareValue(updatedShareValue);
      }, 3000); // Update every 3 seconds (equivalent to 3 hours in accelerated time)

      return () => clearInterval(interval);
    }
  }, [isConnected, fakeVaultShares, lastDepositTime, calculateYield]);

  useEffect(() => {
    if (isConnected) {
      // Only show wallet connected toast if not in simulation mode
      if (!isSimulationMode) {
        toast({
          title: "Wallet Connected",
          description: `Connected to ${account?.substring(0,6)}...${account?.substring(account.length-4)} on Sepolia.`
        });
      }

      // These functions now check internally if they should run based on simulation mode
      getHBTBalance();
      getVaultData();

      // Check if we need to allocate fake tokens for new users
      if (!hasAllocatedTokens) {
        allocateFakeTokensToNewUser();
      }
    } else if (account && chainId !== SEPOLIA_CHAIN_ID) {
      // Handled by handleChainChanged or connectWallet logic
    } else if (!account && provider) {
      // This case means wallet was disconnected or accounts changed to none
      // toast({ title: "Wallet Disconnected" }); // disconnectWallet already toasts
    }
  }, [isConnected, getHBTBalance, getVaultData, account, chainId, provider, toast, SEPOLIA_CHAIN_ID, hasAllocatedTokens, allocateFakeTokensToNewUser, isSimulationMode]);


  const approveHBT = async (amount: string): Promise<boolean> => {
    if (!signer) {
      toast({ title: "Error", description: "Wallet not connected.", variant: "destructive" });
      return false;
    }
    try {
      const tokenContract = new Contract(HBT_TOKEN_ADDRESS, HBT_TOKEN_ABI, signer);
      const amountToApprove = parseUnits(amount, 18);
      const tx = await tokenContract.approve(YIELD_HARBOR_VAULT_ADDRESS, amountToApprove);
      await tx.wait();
      toast({ title: "Approval Successful", description: `${amount} HBT approved for vault.` });
      return true;
    } catch (error: any) {
      toast({ title: "Approval Failed", description: error.message, variant: "destructive" });
      return false;
    }
  };

  const getAllowance = async (): Promise<string> => {
    if (!signer || !account) return "0";
    try {
      const tokenContract = new Contract(HBT_TOKEN_ADDRESS, HBT_TOKEN_ABI, signer);
      const allowance = await tokenContract.allowance(account, YIELD_HARBOR_VAULT_ADDRESS);
      return formatUnits(allowance, 18);
    } catch (error: any) {
      toast({ title: "Error fetching allowance", description: error.message, variant: "destructive" });
      return "0";
    }
  };


  const depositToVault = async (amount: string): Promise<boolean> => {
    if (!isConnected || !signer) {
      toast({ title: "Error", description: "Wallet not connected or on wrong network.", variant: "destructive" });
      return false;
    }
    try {
      const vaultContract = new Contract(YIELD_HARBOR_VAULT_ADDRESS, YIELD_HARBOR_VAULT_ABI, signer);
      const amountToDeposit = parseUnits(amount, 18);

      const allowanceString = await getAllowance();
      const allowance = parseUnits(allowanceString, 18);
      if (allowance < amountToDeposit) {
        toast({ title: "Approval Required", description: `Please approve ${amount} HBT for the vault.`, variant: "default"});
        // Frontend form should handle calling approveHBT separately based on allowance check.
        // For direct call scenario, let's assume approval must be sufficient.
        // Or, trigger approval from here:
        // const approved = await approveHBT(amount);
        // if (!approved) return false;
        // For now, expect UI to ensure approval or return false
        return false; // Indicate approval needed if not sufficient
      }

      const tx = await vaultContract.deposit(amountToDeposit);
      await tx.wait();
      toast({ title: "Deposit Successful", description: `${amount} HBT deposited to vault.` });
      getHBTBalance();
      getVaultData();
      return true;
    } catch (error: any) {
      toast({ title: "Deposit Failed", description: error.message, variant: "destructive" });
      return false;
    }
  };

  const withdrawFromVault = async (shares: string): Promise<boolean> => {
    if (!isConnected || !signer) {
      toast({ title: "Error", description: "Wallet not connected or on wrong network.", variant: "destructive" });
      return false;
    }
    try {
      const vaultContract = new Contract(YIELD_HARBOR_VAULT_ADDRESS, YIELD_HARBOR_VAULT_ABI, signer);
      const sharesToWithdraw = parseUnits(shares, 18);
      const tx = await vaultContract.withdraw(sharesToWithdraw);
      await tx.wait();
      toast({ title: "Withdrawal Successful", description: `Withdrew assets for ${shares} shares.` });
      getHBTBalance();
      getVaultData();
      return true;
    } catch (error: any) {
      toast({ title: "Withdrawal Failed", description: error.message, variant: "destructive" });
      return false;
    }
  };

  return (
    <Web3Context.Provider value={{
        // Standard blockchain state
        provider,
        signer,
        account,
        chainId,
        hbtBalance,
        vaultShares,
        vaultShareValue,
        tvl,
        isConnected,
        // Fake token simulation state
        fakeTokenBalance,
        fakeVaultShares,
        fakeVaultShareValue,
        isSimulationMode,
        // Standard functions
        connectWallet,
        disconnectWallet,
        getHBTBalance,
        getVaultData,
        depositToVault,
        withdrawFromVault,
        approveHBT,
        getAllowance,
        // Fake token simulation functions
        toggleSimulationMode,
        depositFakeTokens,
        withdrawFakeTokens,
        allocateFakeTokensToNewUser
      }}>
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = (): Web3ContextType => {
  const context = useContext(Web3Context);
  if (context === undefined) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
};

declare global {
  interface Window {
    ethereum: any;
  }
}