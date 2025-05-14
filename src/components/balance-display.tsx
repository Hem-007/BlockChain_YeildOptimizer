
"use client";

import { useWeb3 } from "@/contexts/web3-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, PieChart, TrendingUp, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import React, { useState, useEffect } from "react";

interface BalanceItemProps {
  icon: React.ElementType;
  label: string;
  value: string;
  unit?: string;
  isLoading?: boolean;
}

const BalanceItem: React.FC<BalanceItemProps> = ({ icon: Icon, label, value, unit, isLoading }) => (
  <div className="flex items-center justify-between py-3 border-b border-border last:border-b-0">
    <div className="flex items-center gap-3">
      <Icon className="h-6 w-6 text-primary" />
      <span className="text-muted-foreground">{label}</span>
    </div>
    {isLoading ? (
      <Skeleton className="h-6 w-24" />
    ) : (
      <span className="font-semibold text-lg">
        {value} {unit}
      </span>
    )}
  </div>
);


export function BalanceDisplay() {
  const {
    isConnected,
    hbtBalance,
    vaultShares,
    vaultShareValue,
    fakeTokenBalance,
    fakeVaultShares,
    fakeVaultShareValue,
    isSimulationMode,
    toggleSimulationMode,
    account
  } = useWeb3();
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Simulate loading delay or use useEffect with actual data fetching status
  useEffect(() => {
    if (isConnected) {
      // This is just a placeholder. In a real app, `isLoadingData` would be true
      // while `getHBTBalance` and `getVaultData` are running.
      // Since those update context state, this component will re-render.
      // We can assume data is loaded once `account` is present and not actively fetching.
      // For demo, short timeout.
      const timer = setTimeout(() => setIsLoadingData(false), 1000);
      return () => clearTimeout(timer);
    } else {
      setIsLoadingData(false);
    }
  }, [isConnected, account]); // Added account to dependencies for re-check if account changes while connected

  if (!isConnected) {
    return (
      <Card className="w-full max-w-lg shadow-lg">
        <CardHeader>
          <CardTitle>Your Portfolio</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">Please connect your wallet to view your portfolio details.</p>
        </CardContent>
      </Card>
    );
  }

  const handleToggleMode = () => {
    toggleSimulationMode();
  };

  return (
    <Card className="w-full max-w-lg shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Your YieldHarbor Portfolio</CardTitle>
        <button
          onClick={handleToggleMode}
          className={`px-3 py-1 text-xs rounded-full font-medium ${
            isSimulationMode
              ? "bg-amber-100 text-amber-800 hover:bg-amber-200"
              : "bg-slate-100 text-slate-800 hover:bg-slate-200"
          }`}
        >
          {isSimulationMode ? "Test Mode" : "Real Mode"}
        </button>
      </CardHeader>
      <CardContent className="space-y-4">
        {isSimulationMode && (
          <div className="bg-amber-50 border border-amber-200 rounded-md p-2 text-xs text-amber-800">
            You are viewing your simulated test token portfolio. These tokens have no real value.
          </div>
        )}

        <div className="space-y-2">
          <h3 className="text-sm font-medium mb-2">
            {isSimulationMode ? "Test Token Portfolio" : "Real Token Portfolio"}
          </h3>
          <BalanceItem
            icon={Wallet}
            label={isSimulationMode ? "Test Token Balance" : "HBT Token Balance"}
            value={parseFloat(isSimulationMode ? fakeTokenBalance : hbtBalance).toFixed(4)}
            unit={isSimulationMode ? "Tokens" : "HBT"}
            isLoading={isLoadingData && !(isSimulationMode ? fakeTokenBalance : hbtBalance)}
          />
          <BalanceItem
            icon={PieChart}
            label="Vault Shares"
            value={parseFloat(isSimulationMode ? fakeVaultShares : vaultShares).toFixed(4)}
            unit="Shares"
            isLoading={isLoadingData && !(isSimulationMode ? fakeVaultShares : vaultShares)}
          />
          <BalanceItem
            icon={TrendingUp}
            label="Value of Shares"
            value={parseFloat(isSimulationMode ? fakeVaultShareValue : vaultShareValue).toFixed(4)}
            unit={isSimulationMode ? "Tokens" : "HBT"}
            isLoading={isLoadingData && !(isSimulationMode ? fakeVaultShareValue : vaultShareValue)}
          />
        </div>

        {isSimulationMode && parseFloat(fakeVaultShares) > 0 && (
          <div className="text-xs text-green-600 mt-1">
            Your simulated shares are earning yield based on strategy APY and time since deposit.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

