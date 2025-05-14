"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useWeb3 } from "@/contexts/web3-context";
import { TrendingUp, ArrowUpRight, ArrowDownRight, Clock, DollarSign } from "lucide-react";
import { MOCK_STRATEGIES_DATA } from "@/lib/constants";

export function PortfolioPerformance() {
  const { 
    isConnected, 
    account, 
    isSimulationMode, 
    fakeTokenBalance, 
    fakeVaultShares, 
    fakeVaultShareValue 
  } = useWeb3();
  
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [performanceData, setPerformanceData] = useState<{
    totalDeposited: number;
    currentValue: number;
    totalYield: number;
    yieldPercentage: number;
    dailyYield: number[];
  }>({
    totalDeposited: 0,
    currentValue: 0,
    totalYield: 0,
    yieldPercentage: 0,
    dailyYield: [0, 0, 0, 0, 0, 0, 0]
  });
  
  // Load transaction history to calculate performance
  useEffect(() => {
    if (!account || !isConnected) return;
    
    // Get transaction history from localStorage
    const storedTransactions = localStorage.getItem(`transactions_${account}`);
    if (!storedTransactions) return;
    
    const transactions = JSON.parse(storedTransactions);
    
    // Calculate total deposited and withdrawn
    let totalDeposited = 0;
    let totalWithdrawn = 0;
    let totalYieldEarned = 0;
    
    transactions.forEach((tx: any) => {
      if (tx.type === "deposit") {
        totalDeposited += parseFloat(tx.amount);
      } else if (tx.type === "withdraw") {
        totalWithdrawn += parseFloat(tx.amount);
        if (tx.yieldEarned) {
          totalYieldEarned += parseFloat(tx.yieldEarned);
        }
      }
    });
    
    // Current value is the current shares value
    const currentValue = parseFloat(fakeVaultShareValue);
    
    // Calculate yield percentage
    const netDeposited = totalDeposited - totalWithdrawn;
    const yieldPercentage = netDeposited > 0 
      ? ((currentValue - netDeposited) / netDeposited) * 100 
      : 0;
    
    // Generate mock daily yield data
    const avgApy = MOCK_STRATEGIES_DATA.reduce((sum, s) => sum + s.apy, 0) / MOCK_STRATEGIES_DATA.length;
    const dailyYieldRate = avgApy / 365 / 100;
    
    const dailyYield = Array(7).fill(0).map((_, i) => {
      // Random fluctuation around the daily yield rate
      const fluctuation = (Math.random() * 0.5 + 0.75); // 0.75 to 1.25
      return dailyYieldRate * fluctuation * netDeposited;
    });
    
    setPerformanceData({
      totalDeposited,
      currentValue,
      totalYield: currentValue - netDeposited + totalYieldEarned,
      yieldPercentage,
      dailyYield
    });
  }, [account, isConnected, fakeVaultShareValue, fakeVaultShares]);
  
  // Simulate time passing for demo purposes
  useEffect(() => {
    if (!isSimulationMode) return;
    
    const timer = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);
    
    return () => clearInterval(timer);
  }, [isSimulationMode]);
  
  if (!isConnected || !account) {
    return (
      <Card className="w-full shadow-md">
        <CardHeader>
          <CardTitle>Portfolio Performance</CardTitle>
          <CardDescription>Connect your wallet to view performance data</CardDescription>
        </CardHeader>
        <CardContent className="text-center py-8 text-muted-foreground">
          No wallet connected
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="w-full shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Portfolio Performance
        </CardTitle>
        <CardDescription>Track your yield and portfolio growth over time</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {isSimulationMode && (
          <div className="bg-amber-50 border border-amber-200 rounded-md p-3 text-sm text-amber-800">
            <div className="flex justify-between items-center">
              <span className="font-medium flex items-center">
                <Clock className="h-4 w-4 mr-2" /> Simulated time elapsed:
              </span>
              <span>{timeElapsed} hours</span>
            </div>
            <p className="mt-1 text-xs">
              In simulation mode, 1 second equals 1 hour. This allows you to see how yields would accumulate over time.
            </p>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-50 p-4 rounded-lg">
            <div className="text-sm text-muted-foreground mb-1">Total Deposited</div>
            <div className="text-2xl font-bold">{performanceData.totalDeposited.toFixed(2)}</div>
            <div className="text-xs text-muted-foreground mt-1">Tokens</div>
          </div>
          
          <div className="bg-slate-50 p-4 rounded-lg">
            <div className="text-sm text-muted-foreground mb-1">Current Value</div>
            <div className="text-2xl font-bold">{performanceData.currentValue.toFixed(2)}</div>
            <div className="text-xs text-muted-foreground mt-1">Tokens</div>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-sm text-green-700 mb-1">Total Yield Earned</div>
            <div className="text-2xl font-bold text-green-700 flex items-center">
              {performanceData.totalYield.toFixed(2)}
              {performanceData.totalYield > 0 && (
                <ArrowUpRight className="h-4 w-4 ml-1" />
              )}
            </div>
            <div className="text-xs text-green-600 mt-1">
              {performanceData.yieldPercentage.toFixed(2)}% return
            </div>
          </div>
        </div>
        
        <div>
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-medium">Daily Yield (Last 7 Days)</h3>
            <div className="text-xs text-muted-foreground">
              Average: {(performanceData.dailyYield.reduce((a, b) => a + b, 0) / 7).toFixed(4)} tokens/day
            </div>
          </div>
          
          <div className="flex items-end h-32 gap-1">
            {performanceData.dailyYield.map((yield_, index) => {
              const maxYield = Math.max(...performanceData.dailyYield);
              const height = maxYield > 0 ? (yield_ / maxYield) * 100 : 0;
              
              return (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div 
                    className="w-full bg-green-200 hover:bg-green-300 transition-colors rounded-t"
                    style={{ height: `${height}%` }}
                  />
                  <div className="text-xs mt-1">{`D-${6-index}`}</div>
                </div>
              );
            })}
          </div>
        </div>
        
        <div>
          <h3 className="text-sm font-medium mb-2">Strategy Allocation</h3>
          <div className="space-y-3">
            {MOCK_STRATEGIES_DATA.slice(0, 4).map((strategy, index) => {
              // Calculate allocation percentage based on strategy APY
              const allocationPercentage = index === 0 ? 60 : index === 1 ? 20 : index === 2 ? 15 : 5;
              
              return (
                <div key={strategy.address} className="space-y-1">
                  <div className="flex justify-between items-center text-sm">
                    <span>{strategy.name}</span>
                    <span className="text-green-600">{strategy.apy}% APY</span>
                  </div>
                  <Progress value={allocationPercentage} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{allocationPercentage}% allocation</span>
                    <span>${(parseFloat(strategy.tvl) / 1000000).toFixed(2)}M TVL</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
