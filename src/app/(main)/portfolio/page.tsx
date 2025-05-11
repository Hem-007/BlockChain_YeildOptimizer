
import { BalanceDisplay } from "@/components/balance-display";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Info, ArrowRightLeft } from "lucide-react";

export default function PortfolioPage() {
  return (
    <div className="container mx-auto max-w-2xl py-8">
      <div className="flex flex-col items-center space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">Your Portfolio</h1>
          <p className="text-muted-foreground">Track your assets and performance in YieldHarbor.</p>
        </div>

        <BalanceDisplay />
        
        <Card className="w-full max-w-lg shadow-md">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <ArrowRightLeft className="w-5 h-5 text-primary"/>
                    Quick Actions
                </CardTitle>
                <CardDescription>Manage your investments with ease.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row gap-4">
                <Link href="/deposit" className="flex-1">
                    <Button className="w-full">Deposit More HBT</Button>
                </Link>
                <Link href="/withdraw" className="flex-1">
                    <Button variant="outline" className="w-full">Withdraw HBT</Button>
                </Link>
            </CardContent>
        </Card>

        <Card className="w-full max-w-lg border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/30 shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center text-blue-700 dark:text-blue-300">
              <Info className="w-5 h-5 mr-2" />
              Understanding Your Portfolio
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-blue-600 dark:text-blue-400 space-y-2">
            <p>
              <strong>HBT Token Balance:</strong> The amount of Harbor Tokens (HBT) currently in your connected wallet.
            </p>
            <p>
              <strong>Vault Shares:</strong> Represents your ownership stake in the YieldHarbor vault. The number of shares changes when you deposit or withdraw.
            </p>
            <p>
              <strong>Value of Shares:</strong> The current estimated value of your vault shares in HBT, calculated by (Your Shares * Price Per Share). The Price Per Share fluctuates based on the vault's performance.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
