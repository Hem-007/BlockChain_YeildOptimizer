
"use client";

import { useWeb3 } from "@/contexts/web3-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, PieChart, TrendingUp, Users, Landmark, ListTree, AlertCircle, Anchor } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function DashboardPage() {
  const { account, isConnected, hbtBalance, vaultShares, vaultShareValue, tvl } = useWeb3();

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
  
  const stats = [
    { title: "Total Value Locked (TVL)", value: `$${parseFloat(tvl).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, icon: DollarSign, description: "Across all strategies" },
    { title: "Your HBT Balance", value: `${parseFloat(hbtBalance).toFixed(2)} HBT`, icon: PieChart, description: "Tokens in your wallet" },
    { title: "Your Vault Shares", value: `${parseFloat(vaultShares).toFixed(4)} Shares`, icon: Users, description: "Your stake in the vault" },
    { title: "Value of Your Shares", value: `$${parseFloat(vaultShareValue).toFixed(2)} HBT`, icon: TrendingUp, description: "Current market value" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your YieldHarbor activity.</p>
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

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Landmark className="h-6 w-6 text-primary" />
              Manage Your Vault
            </CardTitle>
            <CardDescription>Deposit or withdraw your HBT tokens from the YieldHarbor vault.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>The YieldHarbor vault aggregates yield from multiple (simulated) sources to maximize your returns. Your deposited HBT tokens are converted into shares, representing your portion of the vault's total assets.</p>
            <div className="flex gap-4">
              <Link href="/deposit" className="flex-1">
                <Button className="w-full">Deposit HBT</Button>
              </Link>
              <Link href="/withdraw" className="flex-1">
                <Button variant="outline" className="w-full">Withdraw HBT</Button>
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
            <Link href="/strategies" className="w-full">
               <Button variant="outline" className="w-full">View Strategies</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
      
      <Card className="bg-amber-50 border-amber-200 shadow-lg dark:bg-amber-900/30 dark:border-amber-700/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
            <AlertCircle className="h-6 w-6" />
            Important Notice: Testnet Simulation
          </CardTitle>
        </CardHeader>
        <CardContent className="text-amber-600 dark:text-amber-500">
          <p>YieldHarbor is a conceptual project demonstrating cross-chain yield optimization on the Sepolia testnet. All tokens and yields are simulated and have no real-world value. This platform is for educational and demonstrative purposes only.</p>
        </CardContent>
      </Card>
    </div>
  );
}
