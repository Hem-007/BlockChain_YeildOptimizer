"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { MOCK_STRATEGIES_DATA } from "@/lib/constants";
import { useWeb3 } from "@/contexts/web3-context";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, Zap, DollarSign, BarChartBig } from "lucide-react";

interface StrategyAllocationProps {
  depositAmount?: string;
}

export function StrategyAllocationDisplay({ depositAmount }: StrategyAllocationProps) {
  const { isSimulationMode } = useWeb3();
  const [isLoading, setIsLoading] = useState(true);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [simulatedYield, setSimulatedYield] = useState(0);
  
  // Calculate total TVL from all strategies
  const totalTVL = MOCK_STRATEGIES_DATA.reduce(
    (sum, strategy) => sum + parseFloat(strategy.tvl), 
    0
  );
  
  // Sort strategies by APY (highest first)
  const sortedStrategies = [...MOCK_STRATEGIES_DATA].sort((a, b) => b.apy - a.apy);
  
  // Simulate loading state
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);
  
  // Simulate time passing and yield accumulation for demo purposes
  useEffect(() => {
    if (!depositAmount || parseFloat(depositAmount) <= 0) return;
    
    const amount = parseFloat(depositAmount);
    const timer = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
      
      // Calculate simulated yield based on highest APY strategy
      // 1 second = 1 hour in our accelerated simulation
      const highestApy = sortedStrategies[0]?.apy || 5;
      const hourlyRate = highestApy / 100 / (365 * 24);
      const newYield = amount * (Math.pow(1 + hourlyRate, timeElapsed + 1) - 1);
      setSimulatedYield(newYield);
    }, 1000);
    
    return () => clearInterval(timer);
  }, [depositAmount, timeElapsed, sortedStrategies]);
  
  // Get icon for strategy based on token symbol
  const getStrategyIcon = (symbol?: string) => {
    if (!symbol) return DollarSign;
    
    const iconMap: Record<string, any> = {
      "ETH": Zap,
      "stETH": Zap,
      "USDC": DollarSign,
      "USDT": DollarSign,
      "WBTC": BarChartBig,
    };
    
    return iconMap[symbol] || BarChartBig;
  };
  
  if (!isSimulationMode) {
    return (
      <Card className="w-full shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Strategy Allocation</CardTitle>
          <CardDescription>
            Real blockchain mode uses actual on-chain strategies
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <p>
            Connect your wallet and switch to simulation mode to see strategy allocations.
          </p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="w-full shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Strategy Allocation</CardTitle>
        <CardDescription>
          Your deposit will be allocated to these strategies
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {depositAmount && parseFloat(depositAmount) > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-md p-3 text-sm text-green-700">
            <div className="flex justify-between items-center">
              <span>Simulated time elapsed:</span>
              <span className="font-medium">{timeElapsed} hours</span>
            </div>
            <div className="flex justify-between items-center mt-1">
              <span>Estimated yield so far:</span>
              <span className="font-medium text-green-600">+{simulatedYield.toFixed(4)} tokens</span>
            </div>
          </div>
        )}
        
        <div className="space-y-3">
          {isLoading ? (
            Array(4).fill(0).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-[120px]" />
                  <Skeleton className="h-4 w-[60px]" />
                </div>
                <Skeleton className="h-2 w-full" />
              </div>
            ))
          ) : (
            sortedStrategies.map((strategy, index) => {
              // Calculate allocation percentage based on strategy APY
              // Higher APY gets more allocation
              const allocationPercentage = (strategy.apy / 
                sortedStrategies.reduce((sum, s) => sum + s.apy, 0)) * 100;
              
              // For the first strategy (highest APY), allocate at least 40%
              const adjustedPercentage = index === 0 ? 
                Math.max(allocationPercentage, 40) : 
                allocationPercentage;
              
              const StrategyIcon = getStrategyIcon(strategy.tokenSymbol);
              
              return (
                <div key={strategy.address} className="space-y-1">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <StrategyIcon className="h-4 w-4 text-primary" />
                      <span className="font-medium text-sm">{strategy.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-3 w-3 text-green-600" />
                      <span className="text-sm font-medium text-green-600">{strategy.apy}% APY</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={adjustedPercentage} className="h-2" />
                    <span className="text-xs text-muted-foreground w-12 text-right">
                      {Math.round(adjustedPercentage)}%
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    TVL: ${parseFloat(strategy.tvl).toLocaleString()}
                  </div>
                </div>
              );
            })
          )}
        </div>
        
        <div className="text-xs text-muted-foreground pt-2 border-t">
          <p>
            Deposits are automatically allocated to strategies based on their current APY.
            Higher APY strategies receive larger allocations to maximize yield.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
