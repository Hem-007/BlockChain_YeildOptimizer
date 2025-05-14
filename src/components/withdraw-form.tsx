
"use client";

import { useState } from "react";
import { useWeb3 } from "@/contexts/web3-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, PieChart, TrendingUp, Zap, BarChartBig, DollarSign } from "lucide-react";
import { MOCK_STRATEGIES_DATA } from "@/lib/constants";

export function WithdrawForm() {
  const {
    vaultShares,
    vaultShareValue,
    fakeVaultShares,
    fakeVaultShareValue,
    isSimulationMode,
    withdrawFromVault,
    withdrawFakeTokens,
    toggleSimulationMode,
    isConnected
  } = useWeb3();

  const [sharesToWithdraw, setSharesToWithdraw] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [lastWithdrawal, setLastWithdrawal] = useState<{shares: string, amount: string} | null>(null);
  const [showWithdrawSuccess, setShowWithdrawSuccess] = useState(false);
  const [withdrawalYield, setWithdrawalYield] = useState("0");

  // Get the primary strategy (highest APY)
  const primaryStrategy = [...MOCK_STRATEGIES_DATA].sort((a, b) => b.apy - a.apy)[0];

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

  // Get the appropriate values based on simulation mode
  const currentShares = isSimulationMode ? fakeVaultShares : vaultShares;
  const currentShareValue = isSimulationMode ? fakeVaultShareValue : vaultShareValue;

  const handleWithdraw = async () => {
    if (!sharesToWithdraw || parseFloat(sharesToWithdraw) <= 0) {
      alert("Please enter a valid amount of shares to withdraw.");
      return;
    }

    if (parseFloat(sharesToWithdraw) > parseFloat(currentShares)) {
      alert("Amount exceeds your available shares.");
      return;
    }

    setIsLoading(true);
    let success;

    // Use the appropriate withdraw function based on simulation mode
    if (isSimulationMode) {
      success = await withdrawFakeTokens(sharesToWithdraw);
    } else {
      success = await withdrawFromVault(sharesToWithdraw);
    }

    if (success) {
      // Calculate the yield earned
      const initialValue = parseFloat(sharesToWithdraw);
      const finalValue = parseFloat(estimatedHbtToReceive());
      const yieldEarned = (finalValue - initialValue).toFixed(4);

      // Store withdrawal details
      setLastWithdrawal({
        shares: sharesToWithdraw,
        amount: estimatedHbtToReceive()
      });
      setWithdrawalYield(yieldEarned);
      setShowWithdrawSuccess(true);

      // Hide success message after 10 seconds
      setTimeout(() => {
        setShowWithdrawSuccess(false);
      }, 10000);

      setSharesToWithdraw(""); // Reset amount on successful withdrawal
      // Balances will be updated by the context
    }
    setIsLoading(false);
  };

  const setMaxShares = () => {
    setSharesToWithdraw(currentShares);
  };

  const handleToggleMode = () => {
    toggleSimulationMode();
    setSharesToWithdraw(""); // Reset amount when switching modes
  };

  const estimatedHbtToReceive = () => {
    if (!sharesToWithdraw ||
        parseFloat(sharesToWithdraw) <= 0 ||
        parseFloat(currentShares) <= 0 ||
        parseFloat(currentShareValue) <= 0) {
      return "0.00";
    }
    try {
      const pricePerShare = parseFloat(currentShareValue) / parseFloat(currentShares);
      if (isNaN(pricePerShare) || pricePerShare <= 0) return "0.00";
      const tokenValue = parseFloat(sharesToWithdraw) * pricePerShare;
      return tokenValue.toFixed(4);
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
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Withdraw {isSimulationMode ? "Test" : "HBT"} Tokens</CardTitle>
            <CardDescription>
              {isSimulationMode
                ? "Withdraw test tokens by redeeming your simulated vault shares."
                : "Withdraw your HBT tokens by redeeming your vault shares."}
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleToggleMode}
            className={isSimulationMode ? "bg-amber-100 hover:bg-amber-200 border-amber-300" : ""}
          >
            {isSimulationMode ? "Test Mode" : "Real Mode"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isSimulationMode && (
          <div className="bg-amber-50 border border-amber-200 rounded-md p-2 text-xs text-amber-800">
            You are in test mode using simulated tokens. Withdrawals will include simulated yield based on time since deposit.
          </div>
        )}

        {isSimulationMode && (
          <div className="bg-primary/5 border border-primary/20 rounded-md p-3">
            <div className="flex items-center gap-2 mb-2">
              <PrimaryStrategyIcon className="h-5 w-5 text-primary" />
              <span className="font-medium">Primary Strategy: {primaryStrategy.name}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-1 text-muted-foreground">
                <TrendingUp className="h-4 w-4" />
                <span>Current APY:</span>
              </div>
              <span className="font-medium text-green-600">{primaryStrategy.apy}%</span>
            </div>
            <p className="text-xs mt-2 text-muted-foreground">
              Your tokens are primarily allocated to this strategy (60%). Withdrawing will redeem tokens from all strategies proportionally.
            </p>
          </div>
        )}

        {showWithdrawSuccess && lastWithdrawal && (
          <div className="bg-green-50 border border-green-200 rounded-md p-3 text-sm text-green-800">
            <div className="flex items-center gap-2 font-medium mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Withdrawal Successful!
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Shares redeemed:</span>
                <span className="font-medium">{parseFloat(lastWithdrawal.shares).toFixed(4)} Shares</span>
              </div>

              <div className="flex justify-between">
                <span>Tokens received:</span>
                <span className="font-medium">{parseFloat(lastWithdrawal.amount).toFixed(4)} {isSimulationMode ? "Tokens" : "HBT"}</span>
              </div>

              {parseFloat(withdrawalYield) > 0 && (
                <div className="flex justify-between text-green-700">
                  <span>Yield earned:</span>
                  <span className="font-medium">+{withdrawalYield} {isSimulationMode ? "Tokens" : "HBT"}</span>
                </div>
              )}

              {isSimulationMode && (
                <div className="mt-2 pt-2 border-t border-green-200">
                  <p className="font-medium">Yield Sources:</p>
                  <ul className="pl-4 mt-1 space-y-1 text-xs list-disc">
                    <li className="flex items-center gap-1">
                      <PrimaryStrategyIcon className="h-3 w-3 text-primary flex-shrink-0" />
                      <span className="font-medium">{primaryStrategy.name}: 60% of allocation ({primaryStrategy.apy}% APY) - Primary</span>
                    </li>
                    <li>BetaLender USDC: 20% of allocation (3.75% APY)</li>
                    <li>GammaPool BTC: 15% of allocation (4.50% APY)</li>
                    <li>DeltaYield USDT: 5% of allocation (6.10% APY)</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-muted-foreground flex items-center">
              <PieChart className="w-4 h-4 mr-2" /> Your Vault Shares:
            </div>
            <div className="font-medium">{parseFloat(currentShares).toFixed(4)} Shares</div>
          </div>
          <div>
            <div className="text-muted-foreground flex items-center">
              <TrendingUp className="w-4 h-4 mr-2" /> Value of Shares:
            </div>
            <div className="font-medium">
              {parseFloat(currentShareValue).toFixed(4)} {isSimulationMode ? "Tokens" : "HBT"}
            </div>
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
            <Button
              variant="outline"
              size="sm"
              onClick={setMaxShares}
              disabled={isLoading || parseFloat(currentShares) <= 0}
            >
              Max
            </Button>
          </div>
          {parseFloat(sharesToWithdraw) > parseFloat(currentShares) && (
            <p className="text-xs text-destructive">Amount exceeds your available shares.</p>
          )}
        </div>
        <div className="text-sm text-muted-foreground">
            Estimated {isSimulationMode ? "tokens" : "HBT"} to receive:
            <span className="font-medium text-foreground">
              {estimatedHbtToReceive()} {isSimulationMode ? "Tokens" : "HBT"}
            </span>
            {isSimulationMode && parseFloat(sharesToWithdraw) > 0 && (
              <div className="text-xs text-green-600 mt-1">
                Includes simulated yield based on strategy APY and time since deposit
              </div>
            )}
        </div>
      </CardContent>
      <CardFooter>
        <Button
          onClick={handleWithdraw}
          className="w-full"
          disabled={
            isLoading ||
            !sharesToWithdraw ||
            parseFloat(sharesToWithdraw) <= 0 ||
            parseFloat(sharesToWithdraw) > parseFloat(currentShares)
          }
        >
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Withdraw {isSimulationMode ? "Test Tokens" : "HBT"}
        </Button>
      </CardFooter>
    </Card>
  );
}
