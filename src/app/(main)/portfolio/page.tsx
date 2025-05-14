
"use client";

import { BalanceDisplay } from "@/components/balance-display";
import { PortfolioPerformance } from "@/components/portfolio-performance";
import { TransactionHistory } from "@/components/transaction-history";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Info, Activity, TrendingUp, PieChart, Zap, BarChartBig, DollarSign, ChevronRight } from "lucide-react";
import { useWeb3 } from "@/contexts/web3-context";
import { MOCK_STRATEGIES_DATA } from "@/lib/constants";
import { useState, useEffect } from "react";

export default function PortfolioPage() {
  const {
    isSimulationMode,
    fakeVaultShares,
    vaultShares,
    isConnected
  } = useWeb3();

  // Get the strategies sorted by APY
  const sortedStrategies = [...MOCK_STRATEGIES_DATA].sort((a, b) => b.apy - a.apy);
  const primaryStrategy = sortedStrategies[0];

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

  // Calculate if user has shares
  const currentShares = isSimulationMode ? fakeVaultShares : vaultShares;
  const hasShares = parseFloat(currentShares) > 0;

  // Animation for the pie chart segments
  const [animateChart, setAnimateChart] = useState(false);

  useEffect(() => {
    // Trigger animation after component mounts
    const timer = setTimeout(() => setAnimateChart(true), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="container mx-auto max-w-4xl py-8">
      <div className="flex flex-col space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Your Portfolio</h1>
            <p className="text-muted-foreground">Track your assets and performance in YieldHarbor.</p>
          </div>
          <div className="flex gap-2">
            <Link href="/deposit">
              <Button>Deposit Funds</Button>
            </Link>
            <Link href="/withdraw">
              <Button variant="outline">Withdraw Funds</Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <BalanceDisplay />

          {isConnected && isSimulationMode && (
            <Card className="w-full shadow-lg overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 -mt-8 -mr-8 bg-primary/10 rounded-full blur-2xl"></div>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5 text-primary" />
                  Asset Distribution
                </CardTitle>
                <CardDescription>
                  How your assets are allocated across strategies
                </CardDescription>
              </CardHeader>

              {!hasShares && (
                <CardContent className="text-center py-6">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <PieChart className="h-6 w-6 text-primary/50" />
                    </div>
                    <p className="text-sm text-muted-foreground max-w-xs mx-auto mt-2">
                      Deposit tokens to see your asset distribution visualization.
                    </p>
                  </div>
                </CardContent>
              )}

              {hasShares && (
                <CardContent>
                  <div className="relative h-48 w-48 mx-auto">
                    {/* SVG Pie Chart */}
                    <svg viewBox="0 0 100 100" className="transform -rotate-90 h-full w-full">
                      {/* Primary Strategy - 60% */}
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="transparent"
                        stroke="hsl(var(--primary))"
                        strokeWidth="20"
                        strokeDasharray={`${animateChart ? 60 * 2.51 : 0} 251`}
                        className="transition-all duration-1000 ease-out"
                      />
                      {/* Strategy 2 - 20% */}
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="transparent"
                        stroke="hsl(var(--primary) / 0.7)"
                        strokeWidth="20"
                        strokeDasharray={`${animateChart ? 20 * 2.51 : 0} 251`}
                        strokeDashoffset={`${-60 * 2.51}`}
                        className="transition-all duration-1000 ease-out delay-100"
                      />
                      {/* Strategy 3 - 15% */}
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="transparent"
                        stroke="hsl(var(--primary) / 0.5)"
                        strokeWidth="20"
                        strokeDasharray={`${animateChart ? 15 * 2.51 : 0} 251`}
                        strokeDashoffset={`${-(60 + 20) * 2.51}`}
                        className="transition-all duration-1000 ease-out delay-200"
                      />
                      {/* Strategy 4 - 5% */}
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="transparent"
                        stroke="hsl(var(--primary) / 0.3)"
                        strokeWidth="20"
                        strokeDasharray={`${animateChart ? 5 * 2.51 : 0} 251`}
                        strokeDashoffset={`${-(60 + 20 + 15) * 2.51}`}
                        className="transition-all duration-1000 ease-out delay-300"
                      />
                    </svg>

                    {/* Center text */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                      <span className="text-sm text-muted-foreground">Primary</span>
                      <span className="text-xl font-bold text-primary">60%</span>
                      <span className="text-xs">{primaryStrategy.name}</span>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          )}
        </div>

        {isConnected && isSimulationMode && (
          <Card className="w-full shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Strategy Allocation
              </CardTitle>
              <CardDescription>
                Your assets are allocated to these strategies based on their APY
              </CardDescription>
            </CardHeader>

            {!hasShares && (
              <CardContent className="text-center py-8">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <PieChart className="h-8 w-8 text-primary/50" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-medium">No Assets Deposited Yet</h3>
                    <p className="text-sm text-muted-foreground max-w-md mx-auto">
                      Deposit tokens to see how they would be allocated across different yield-generating strategies.
                    </p>
                    <Link href="/deposit">
                      <Button className="mt-2">Deposit Tokens</Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            )}

            {hasShares && (
              <div>
                <CardContent className="space-y-4">
                  {sortedStrategies.map((strategy, index) => {
                    // Calculate allocation percentage based on index
                    const allocation = index === 0 ? 60 : index === 1 ? 20 : index === 2 ? 15 : 5;
                    const StrategyIcon = getStrategyIcon(strategy.tokenSymbol);

                    return (
                      <div key={strategy.address} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <StrategyIcon className={`h-5 w-5 ${index === 0 ? 'text-primary' : 'text-muted-foreground'}`} />
                            <span className={`${index === 0 ? 'font-medium' : ''}`}>
                              {strategy.name}
                              {index === 0 && (
                                <Badge className="ml-2 bg-primary/10 text-primary hover:bg-primary/20 text-xs">
                                  Primary
                                </Badge>
                              )}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={index === 0 ? "default" : "outline"} className="text-xs">
                              {allocation}%
                            </Badge>
                            <Badge variant="secondary" className={`text-xs ${index === 0 ? 'text-green-600 bg-green-50' : ''}`}>
                              <TrendingUp className="h-3 w-3 mr-1" />
                              {strategy.apy}% APY
                            </Badge>
                          </div>
                        </div>
                        <div className="w-full bg-primary/10 rounded-full h-2">
                          <div
                            className={`${index === 0 ? 'bg-primary' : 'bg-primary/40'} h-2 rounded-full transition-all duration-1000 ease-out`}
                            style={{ width: `${animateChart ? allocation : 0}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}

                  <div className="text-xs text-muted-foreground mt-2">
                    <p>Strategy allocations are updated hourly based on market conditions and APY changes.</p>
                  </div>
                </CardContent>
                <CardFooter className="border-t pt-4">
                  <Link href="/strategies" className="text-sm text-primary hover:underline flex items-center ml-auto">
                    View All Strategies <ChevronRight className="h-4 w-4 ml-1" />
                  </Link>
                </CardFooter>
              </div>
            )}
          </Card>
        )}

        <Tabs defaultValue="performance" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="performance">
              <TrendingUp className="mr-2 h-4 w-4" />
              Performance
            </TabsTrigger>
            <TabsTrigger value="history">
              <Activity className="mr-2 h-4 w-4" />
              Transaction History
            </TabsTrigger>
            <TabsTrigger value="info">
              <Info className="mr-2 h-4 w-4" />
              Info
            </TabsTrigger>
          </TabsList>

          <TabsContent value="performance">
            <PortfolioPerformance />
          </TabsContent>

          <TabsContent value="history">
            <TransactionHistory />
          </TabsContent>

          <TabsContent value="info">
            <Card className="w-full border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/30 shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center text-blue-700 dark:text-blue-300">
                  <Info className="w-5 h-5 mr-2" />
                  Understanding Your Portfolio
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-blue-600 dark:text-blue-400 space-y-4">
                <div>
                  <p className="font-medium mb-1">Token Balance:</p>
                  <p>
                    The amount of {isSimulationMode ? "test tokens" : "Harbor Tokens (HBT)"} currently in your connected wallet.
                  </p>
                </div>

                <div>
                  <p className="font-medium mb-1">Vault Shares:</p>
                  <p>
                    Represents your ownership stake in the YieldHarbor vault. The number of shares changes when you deposit or withdraw.
                  </p>
                </div>

                <div>
                  <p className="font-medium mb-1">Value of Shares:</p>
                  <p>
                    The current estimated value of your vault shares, calculated by (Your Shares * Price Per Share). The Price Per Share fluctuates based on the vault's performance.
                  </p>
                </div>

                <div>
                  <p className="font-medium mb-1">Yield Generation:</p>
                  <p>
                    In simulation mode, yield is generated based on the APY of the strategies and the time your tokens have been deposited. The simulation is accelerated so that 1 second equals 1 hour of yield accrual.
                  </p>
                </div>

                <div>
                  <p className="font-medium mb-1">Strategy Allocation:</p>
                  <p>
                    Your deposited tokens are automatically allocated to different strategies based on their APY. Higher APY strategies receive a larger allocation to maximize your returns.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
