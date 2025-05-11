
"use client";

import { useState } from "react";
import { useWeb3 } from "@/contexts/web3-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, PieChart, TrendingUp } from "lucide-react";

export function WithdrawForm() {
  const { vaultShares, vaultShareValue, withdrawFromVault, isConnected } = useWeb3();
  const [sharesToWithdraw, setSharesToWithdraw] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleWithdraw = async () => {
    if (!sharesToWithdraw || parseFloat(sharesToWithdraw) <= 0) {
      alert("Please enter a valid amount of shares to withdraw.");
      return;
    }
    setIsLoading(true);
    const success = await withdrawFromVault(sharesToWithdraw);
    if (success) {
      setSharesToWithdraw(""); // Reset amount on successful withdrawal
      // Balances will be updated by the context
    }
    setIsLoading(false);
  };

  const setMaxShares = () => {
    setSharesToWithdraw(vaultShares);
  };

  const estimatedHbtToReceive = () => {
    if (!sharesToWithdraw || parseFloat(sharesToWithdraw) <= 0 || parseFloat(vaultShares) <= 0 || parseFloat(vaultShareValue) <=0) {
      return "0.00";
    }
    try {
      const pricePerShare = parseFloat(vaultShareValue) / parseFloat(vaultShares);
      if (isNaN(pricePerShare) || pricePerShare <=0) return "0.00";
      const hbtValue = parseFloat(sharesToWithdraw) * pricePerShare;
      return hbtValue.toFixed(4);
    } catch (e) {
      return "0.00";
    }
  };

  if (!isConnected) {
    return <p className="text-center text-muted-foreground">Please connect your wallet to withdraw funds.</p>;
  }

  return (
    <Card className="w-full max-w-md shadow-lg">
      <CardHeader>
        <CardTitle>Withdraw HBT Tokens</CardTitle>
        <CardDescription>Withdraw your HBT tokens by redeeming your vault shares.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-muted-foreground flex items-center">
              <PieChart className="w-4 h-4 mr-2" /> Your Vault Shares:
            </div>
            <div className="font-medium">{parseFloat(vaultShares).toFixed(4)} Shares</div>
          </div>
          <div>
            <div className="text-muted-foreground flex items-center">
              <TrendingUp className="w-4 h-4 mr-2" /> Value of Shares (HBT):
            </div>
            <div className="font-medium">{parseFloat(vaultShareValue).toFixed(4)} HBT</div>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="withdraw-shares">Shares to Withdraw</Label>
          <div className="flex items-center gap-2">
            <Input
              id="withdraw-shares"
              type="number"
              placeholder="0.00 Shares"
              value={sharesToWithdraw}
              onChange={(e) => setSharesToWithdraw(e.target.value)}
              disabled={isLoading}
              min="0"
            />
            <Button variant="outline" size="sm" onClick={setMaxShares} disabled={isLoading || parseFloat(vaultShares) <= 0}>Max</Button>
          </div>
          {parseFloat(sharesToWithdraw) > parseFloat(vaultShares) && (
            <p className="text-xs text-destructive">Amount exceeds your available shares.</p>
          )}
        </div>
        <div className="text-sm text-muted-foreground">
            Estimated HBT to receive: <span className="font-medium text-foreground">{estimatedHbtToReceive()} HBT</span>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleWithdraw} 
          className="w-full"
          disabled={isLoading || !sharesToWithdraw || parseFloat(sharesToWithdraw) <= 0 || parseFloat(sharesToWithdraw) > parseFloat(vaultShares)}
        >
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Withdraw HBT
        </Button>
      </CardFooter>
    </Card>
  );
}
