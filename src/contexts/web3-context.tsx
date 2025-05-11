
"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'import type {ethers} from "ethers"';
import { BrowserProvider, Contract, formatUnits, parseUnits } from 'ethers';
import { useToast } from "@/hooks/use-toast";
import { HBT_TOKEN_ADDRESS, YIELD_HARBOR_VAULT_ADDRESS, HBT_TOKEN_ABI, YIELD_HARBOR_VAULT_ABI, SEPOLIA_CHAIN_ID } from '@/lib/constants';

interface Web3ContextType {
  provider: BrowserProvider | null;
  signer: ethers.Signer | null;
  account: string | null;
  chainId: bigint | null;
  hbtBalance: string;
  vaultShares: string;
  vaultShareValue: string;
  tvl: string;
  isConnected: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  getHBTBalance: () => Promise<void>;
  getVaultData: () => Promise<void>;
  depositToVault: (amount: string) => Promise<boolean>;
  withdrawFromVault: (shares: string) => Promise<boolean>;
  approveHBT: (amount: string) => Promise<boolean>;
  getAllowance: () => Promise<string>;
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

export const Web3Provider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<bigint | null>(null);
  const [hbtBalance, setHbtBalance] = useState<string>("0");
  const [vaultShares, setVaultShares] = useState<string>("0");
  const [vaultShareValue, setVaultShareValue] = useState<string>("0");
  const [tvl, setTvl] = useState<string>("0");

  const { toast } = useToast();

  const SEPOLIA_CHAIN_ID_HEX = `0x${SEPOLIA_CHAIN_ID.toString(16)}`;

  const handleAccountsChanged = useCallback((accounts: string[]) => {
    if (accounts.length === 0) {
      disconnectWallet();
    } else {
      setAccount(accounts[0]);
    }
  }, []);

  const handleChainChanged = useCallback((newChainId: string) => {
    const numChainId = BigInt(newChainId);
    setChainId(numChainId);
    if (numChainId !== SEPOLIA_CHAIN_ID) {
      toast({
        title: "Wrong Network",
        description: `Please switch to Sepolia testnet. Detected chain ID: ${newChainId}`,
        variant: "destructive",
      });
      disconnectWallet(); // Or prompt to switch
    }
  }, [toast]);

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
            description: "Please switch to Sepolia testnet.",
            variant: "destructive",
          });
          // Attempt to switch network
          try {
            await window.ethereum.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: SEPOLIA_CHAIN_ID_HEX }],
            });
          } catch (switchError: any) {
            // This error code indicates that the chain has not been added to MetaMask.
            if (switchError.code === 4902) {
              toast({
                title: "Network Not Added",
                description: "Sepolia testnet is not added to your MetaMask. Please add it manually.",
                variant: "destructive",
              });
            } else {
               toast({ title: "Network Switch Failed", description: switchError.message, variant: "destructive"});
            }
            return;
          }
        }
        
        localStorage.setItem("isWalletConnected", "true");
        toast({ title: "Wallet Connected", description: `Connected to ${currentAccount.substring(0,6)}...${currentAccount.substring(currentAccount.length-4)}`});
      }
    } catch (error: any) {
      toast({ title: "Connection Failed", description: error.message, variant: "destructive" });
    }
  }, [toast, SEPOLIA_CHAIN_ID_HEX]);

  const disconnectWallet = useCallback(() => {
    setProvider(null);
    setSigner(null);
    setAccount(null);
    setChainId(null);
    setHbtBalance("0");
    setVaultShares("0");
    setVaultShareValue("0");
    localStorage.removeItem("isWalletConnected");
    toast({ title: "Wallet Disconnected" });
  }, [toast]);

  useEffect(() => {
    if (localStorage.getItem("isWalletConnected") === "true") {
      connectWallet();
    }
  }, [connectWallet]);

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", handleAccountsChanged);
      window.ethereum.on("chainChanged", handleChainChanged);

      return () => {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
        window.ethereum.removeListener("chainChanged", handleChainChanged);
      };
    }
  }, [handleAccountsChanged, handleChainChanged]);

  const getHBTBalance = useCallback(async () => {
    if (!signer || !account || !provider) return;
    try {
      const tokenContract = new Contract(HBT_TOKEN_ADDRESS, HBT_TOKEN_ABI, signer);
      const balance = await tokenContract.balanceOf(account);
      setHbtBalance(formatUnits(balance, 18)); // Assuming 18 decimals
    } catch (error: any) {
      toast({ title: "Error fetching HBT balance", description: error.message, variant: "destructive" });
      setHbtBalance("0");
    }
  }, [signer, account, provider, toast]);

  const getVaultData = useCallback(async () => {
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
      toast({ title: "Error fetching vault data", description: error.message, variant: "destructive" });
      setVaultShares("0");
      setVaultShareValue("0");
      setTvl("0");
    }
  }, [signer, account, provider, toast]);

  useEffect(() => {
    if (isConnected) {
      getHBTBalance();
      getVaultData();
    }
  }, [isConnected, getHBTBalance, getVaultData, account, chainId]);


  const approveHBT = async (amount: string): Promise<boolean> => {
    if (!signer) {
      toast({ title: "Error", description: "Wallet not connected.", variant: "destructive" });
      return false;
    }
    try {
      const tokenContract = new Contract(HBT_TOKEN_ADDRESS, HBT_TOKEN_ABI, signer);
      const amountToApprove = parseUnits(amount, 18); // Assuming 18 decimals
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
    if (!signer) {
      toast({ title: "Error", description: "Wallet not connected.", variant: "destructive" });
      return false;
    }
    try {
      const vaultContract = new Contract(YIELD_HARBOR_VAULT_ADDRESS, YIELD_HARBOR_VAULT_ABI, signer);
      const amountToDeposit = parseUnits(amount, 18); // Assuming 18 decimals
      
      // Check allowance
      const allowanceString = await getAllowance();
      const allowance = parseUnits(allowanceString, 18);
      if (allowance < amountToDeposit) {
        const approved = await approveHBT(amount);
        if (!approved) return false;
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
    if (!signer) {
      toast({ title: "Error", description: "Wallet not connected.", variant: "destructive" });
      return false;
    }
    try {
      const vaultContract = new Contract(YIELD_HARBOR_VAULT_ADDRESS, YIELD_HARBOR_VAULT_ABI, signer);
      const sharesToWithdraw = parseUnits(shares, 18); // Assuming shares also have 18 decimals conceptually
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
  
  const isConnected = !!provider && !!signer && !!account && chainId === SEPOLIA_CHAIN_ID;

  return (
    <Web3Context.Provider value={{ 
        provider, 
        signer, 
        account, 
        chainId, 
        hbtBalance,
        vaultShares,
        vaultShareValue,
        tvl,
        isConnected,
        connectWallet, 
        disconnectWallet,
        getHBTBalance,
        getVaultData,
        depositToVault,
        withdrawFromVault,
        approveHBT,
        getAllowance
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
    ethereum: any; // Define a more specific type if available
  }
}
