
"use client";

import { useWeb3 } from "@/contexts/web3-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, PieChart, TrendingUp, Users, Landmark, ListTree, AlertCircle, Anchor, Activity, Zap, BarChartBig } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { TransactionHistory } from "@/components/transaction-history";
import { PortfolioPerformance } from "@/components/portfolio-performance";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MOCK_STRATEGIES_DATA } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";

export default function DashboardPage() {
  const {
    account,
    isConnected,
    hbtBalance,
    vaultShares,
    vaultShareValue,
    fakeTokenBalance,
    fakeVaultShares,
    fakeVaultShareValue,
    isSimulationMode,
    toggleSimulationMode,
    tvl
  } = useWeb3();

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <Anchor className="w-24 h-24 text-primary mb-6" />
        <h2 className="text-3xl font-semibold mb-4">Welcome to YieldHarbor</h2>
        <p className="text-muted-foreground mb-6 max-w-md">
          Please connect your Metamask wallet on the Sepolia testnet to access the dashboard and manage your DeFi yields.
        </p>
        {/* The connect button is in the header, but one could be added here too. */}
        {/* <Button onClick={connectWallet} size="lg">Connect Wallet</Button> */}
      </div>
    );
  }

  // Toggle between real and simulation mode
  const handleToggleMode = () => {
    toggleSimulationMode();
  };

  // Get the appropriate values based on simulation mode
  const currentBalance = isSimulationMode ? fakeTokenBalance : hbtBalance;
  const currentShares = isSimulationMode ? fakeVaultShares : vaultShares;
  const currentShareValue = isSimulationMode ? fakeVaultShareValue : vaultShareValue;

  // Get the primary strategy (highest APY)
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

  const PrimaryStrategyIcon = getStrategyIcon(primaryStrategy.tokenSymbol);

  const stats = [
    { title: "Total Value Locked (TVL)", value: `$${parseFloat(tvl).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, icon: DollarSign, description: "Across all strategies" },
    {
      title: isSimulationMode ? "Your Test Token Balance" : "Your HBT Balance",
      value: `${parseFloat(currentBalance).toFixed(2)} ${isSimulationMode ? "Tokens" : "HBT"}`,
      icon: PieChart,
      description: "Tokens in your wallet"
    },
    {
      title: "Your Vault Shares",
      value: `${parseFloat(currentShares).toFixed(4)} Shares`,
      icon: Users,
      description: "Your stake in the vault"
    },
    {
      title: "Value of Your Shares",
      value: `${parseFloat(currentShareValue).toFixed(2)} ${isSimulationMode ? "Tokens" : "HBT"}`,
      icon: TrendingUp,
      description: "Current market value"
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <div className="flex items-center gap-2">
            <p className="text-muted-foreground">Overview of your YieldHarbor activity.</p>
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
          </div>
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

      {isSimulationMode && parseFloat(fakeTokenBalance) > 0 && (
        <Card className="bg-green-50 border-green-200 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-green-700 text-lg">
              <AlertCircle className="h-5 w-5" />
              Test Tokens Available
            </CardTitle>
          </CardHeader>
          <CardContent className="text-green-600 text-sm">
            <p>You have {parseFloat(fakeTokenBalance).toFixed(2)} test tokens in your wallet. These tokens can be used to test the platform's functionality without using real blockchain assets.</p>
            <p className="mt-2">Try depositing some tokens to see how yield accumulates over time!</p>
          </CardContent>
        </Card>
      )}

      {isSimulationMode && parseFloat(currentShares) > 0 && (
        <Card className="bg-primary/5 border-primary/20 shadow-lg overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 -mt-8 -mr-8 bg-primary/10 rounded-full blur-2xl"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 -mb-6 -ml-6 bg-primary/10 rounded-full blur-xl"></div>
          <CardHeader className="pb-2 relative z-10">
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2 text-primary text-lg">
                <PrimaryStrategyIcon className="h-6 w-6" />
                Current Primary Strategy
              </CardTitle>
              <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                {primaryStrategy.apy}% APY
              </Badge>
            </div>
            <CardDescription>
              Your tokens are primarily allocated to the highest-yielding strategy
            </CardDescription>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="text-2xl font-bold text-primary">{primaryStrategy.name}</div>
              <div className="text-sm text-muted-foreground">
                ~60% allocation
              </div>
            </div>

            <div className="space-y-2">
              <div className="w-full bg-primary/10 rounded-full h-2.5">
                <div className="bg-primary h-2.5 rounded-full" style={{ width: '60%' }}></div>
              </div>

              <div className="flex justify-between text-xs text-muted-foreground">
                <div>Other strategies: ~40% allocation</div>
                <div>Updated hourly</div>
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <Link href="/strategies">
                <Button variant="outline" size="sm" className="text-xs">
                  View All Strategies
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={index} className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="history">Transaction History</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Landmark className="h-6 w-6 text-primary" />
                  Manage Your Vault
                </CardTitle>
                <CardDescription>Deposit or withdraw your {isSimulationMode ? "test" : "HBT"} tokens from the YieldHarbor vault.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>The YieldHarbor vault aggregates yield from multiple (simulated) sources to maximize your returns. Your deposited tokens are converted into shares, representing your portion of the vault's total assets.</p>
                <div className="flex gap-4">
                  <Link href="/deposit" className="flex-1">
                    <Button className="w-full">Deposit Tokens</Button>
                  </Link>
                  <Link href="/withdraw" className="flex-1">
                    <Button variant="outline" className="w-full">Withdraw Tokens</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ListTree className="h-6 w-6 text-primary" />
                  Explore Strategies
                </CardTitle>
                <CardDescription>View the (simulated) strategies where the vault allocates funds.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>YieldHarbor conceptually queries various yield strategies and allocates funds to the highest-yielding ones. This process is simulated for demonstration on the Sepolia testnet.</p>
                <div className="flex gap-4">
                  <Link href="/strategies" className="flex-1">
                    <Button variant="outline" className="w-full">View Strategies</Button>
                  </Link>
                  <Link href="/history" className="flex-1">
                    <Button variant="outline" className="w-full">
                      <Activity className="mr-2 h-4 w-4" />
                      View History
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance">
          <PortfolioPerformance />
        </TabsContent>

        <TabsContent value="history">
          <TransactionHistory />
        </TabsContent>
      </Tabs>

      <Card className="bg-amber-50 border-amber-200 shadow-lg dark:bg-amber-900/30 dark:border-amber-700/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
            <AlertCircle className="h-6 w-6" />
            Important Notice: Testnet Simulation
          </CardTitle>
        </CardHeader>
        <CardContent className="text-amber-600 dark:text-amber-500">
          <p>YieldHarbor is a conceptual project demonstrating cross-chain yield optimization on the Sepolia testnet. All tokens and yields are simulated and have no real-world value. This platform is for educational and demonstrative purposes only.</p>

          {isSimulationMode && (
            <div className="mt-4 p-3 bg-amber-100 rounded-md text-sm">
              <p className="font-medium">You are currently in Test Mode</p>
              <p className="mt-1">In this mode, you can use simulated tokens to test the platform's functionality without connecting to the blockchain. Test tokens are automatically allocated to your account and will earn simulated yield when deposited.</p>
              <p className="mt-2 font-medium text-amber-700">⚡ Time Acceleration Enabled</p>
              <p className="mt-1">For testing purposes, time has been accelerated so that 1 second in real time equals 1 hour in simulation time. This allows you to see yield accumulation quickly without waiting.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
