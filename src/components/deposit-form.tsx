
"use client";

import { useState, useEffect } from "react";
import { useWeb3 } from "@/contexts/web3-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Wallet, TrendingUp, Zap, BarChartBig, DollarSign } from "lucide-react";
import { parseUnits, formatUnits } from "ethers";
import { MOCK_STRATEGIES_DATA } from "@/lib/constants";

interface DepositFormProps {
  onAmountChange?: (amount: string) => void;
}

export function DepositForm({ onAmountChange }: DepositFormProps) {
  const {
    hbtBalance,
    fakeTokenBalance,
    isSimulationMode,
    depositToVault,
    depositFakeTokens,
    getAllowance,
    approveHBT,
    isConnected,
    toggleSimulationMode
  } = useWeb3();

  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [needsApproval, setNeedsApproval] = useState(false);
  const [isCheckingAllowance, setIsCheckingAllowance] = useState(false);
  const [lastDepositAmount, setLastDepositAmount] = useState("");
  const [showDepositSuccess, setShowDepositSuccess] = useState(false);

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

  // Get the appropriate balance based on simulation mode
  const currentBalance = isSimulationMode ? fakeTokenBalance : hbtBalance;

  useEffect(() => {
    const checkAllowance = async () => {
      // Skip allowance check if in simulation mode
      if (isSimulationMode || !isConnected || !amount || parseFloat(amount) <= 0) {
        setNeedsApproval(false);
        return;
      }

      setIsCheckingAllowance(true);
      try {
        const allowanceString = await getAllowance();
        const allowance = parseUnits(allowanceString || "0", 18);
        const amountToDeposit = parseUnits(amount, 18);
        setNeedsApproval(allowance < amountToDeposit);
      } catch (error) {
        console.error("Error checking allowance:", error);
        setNeedsApproval(true); // Assume approval is needed on error
      } finally {
        setIsCheckingAllowance(false);
      }
    };

    const debounceTimeout = setTimeout(checkAllowance, 500);
    return () => clearTimeout(debounceTimeout);
  }, [amount, isConnected, getAllowance, isSimulationMode]);


  const handleDeposit = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      alert("Please enter a valid amount.");
      return;
    }

    if (parseFloat(amount) > parseFloat(currentBalance)) {
      alert("Amount exceeds your balance.");
      return;
    }

    setIsLoading(true);
    let success;

    // Use the appropriate deposit function based on simulation mode
    if (isSimulationMode) {
      success = await depositFakeTokens(amount);
    } else {
      success = await depositToVault(amount);
    }

    if (success) {
      // Store the deposit amount before resetting it
      setLastDepositAmount(amount);
      setShowDepositSuccess(true);

      // Hide success message after 10 seconds
      setTimeout(() => {
        setShowDepositSuccess(false);
      }, 10000);

      setAmount(""); // Reset amount on successful deposit
      if (onAmountChange) onAmountChange("");
      // Balances will be updated by the context
    }
    setIsLoading(false);
  };

  const handleApprove = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      alert("Please enter a valid amount to approve.");
      return;
    }
    setIsLoading(true);
    // Approve a slightly larger amount or use max_uint for simplicity in demo
    // For production, exact amount or user-defined approval is better.
    // Here, we'll approve the amount entered.
    const success = await approveHBT(amount);
    if (success) {
      setNeedsApproval(false); // Assuming approval went through, re-check might be good
    }
    setIsLoading(false);
  };

  const setMaxAmount = () => {
    setAmount(currentBalance);
    if (onAmountChange) onAmountChange(currentBalance);
  };

  const handleToggleMode = () => {
    toggleSimulationMode();
    setAmount(""); // Reset amount when switching modes
    if (onAmountChange) onAmountChange("");
  };


  if (!isConnected) {
    return <p className="text-center text-muted-foreground">Please connect your wallet to deposit funds.</p>;
  }

  return (
    <Card className="w-full max-w-md shadow-lg">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Deposit {isSimulationMode ? "Test" : "HBT"} Tokens</CardTitle>
            <CardDescription>
              {isSimulationMode
                ? "Deposit test tokens into the vault to simulate earning yield."
                : "Deposit your Harbor Tokens (HBT) into the vault to earn yield."}
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
            You are in test mode using simulated tokens. These tokens have no real value but allow you to test the platform's functionality.
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
              Your tokens are primarily allocated to the highest-yielding strategy, with smaller allocations to other strategies for diversification.
            </p>
          </div>
        )}

        {showDepositSuccess && (
          <div className="bg-green-50 border border-green-200 rounded-md p-3 text-sm text-green-800 animate-fadeIn">
            <div className="flex items-center gap-2 font-medium mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Deposit Successful!
            </div>
            <p>You deposited <span className="font-medium">{parseFloat(lastDepositAmount).toFixed(4)} {isSimulationMode ? "Tokens" : "HBT"}</span></p>

            {isSimulationMode && (
              <div className="mt-2 space-y-1">
                <p className="font-medium text-green-700">Strategy Allocation:</p>
                <div className="pl-2 border-l-2 border-green-300 space-y-1">
                  <p className="flex items-center gap-1">
                    <PrimaryStrategyIcon className="h-3 w-3 text-primary" />
                    <span className="font-medium">• 60% to {primaryStrategy.name} ({primaryStrategy.apy}% APY) - Primary</span>
                  </p>
                  <p>• 20% to BetaLender USDC (3.75% APY)</p>
                  <p>• 15% to GammaPool BTC (4.50% APY)</p>
                  <p>• 5% to DeltaYield USDT (6.10% APY)</p>
                </div>
                <p className="text-xs mt-2">Your tokens will start earning yield immediately at an accelerated rate (1 second = 1 hour).</p>
              </div>
            )}
          </div>
        )}
        <div className="flex items-center justify-between text-sm">
          <div className="text-muted-foreground flex items-center">
            <Wallet className="w-4 h-4 mr-2" /> Your {isSimulationMode ? "Test" : "HBT"} Balance:
          </div>
          <div className="font-medium">{parseFloat(currentBalance).toFixed(4)} {isSimulationMode ? "Tokens" : "HBT"}</div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="deposit-amount">Amount to Deposit</Label>
          <div className="flex items-center gap-2">
            <Input
              id="deposit-amount"
              type="number"
              placeholder={`0.00 ${isSimulationMode ? "Tokens" : "HBT"}`}
              value={amount}
              onChange={(e) => {
                const newAmount = e.target.value;
                setAmount(newAmount);
                if (onAmountChange) onAmountChange(newAmount);
              }}
              disabled={isLoading}
              min="0"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={setMaxAmount}
              disabled={isLoading || parseFloat(currentBalance) <= 0}
            >
              Max
            </Button>
          </div>
          {parseFloat(amount) > parseFloat(currentBalance) && (
            <p className="text-xs text-destructive">Amount exceeds your balance.</p>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-2">
        {!isSimulationMode && needsApproval && !isCheckingAllowance && (
          <Button
            onClick={handleApprove}
            className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
            disabled={isLoading || parseFloat(amount) <= 0 || parseFloat(amount) > parseFloat(currentBalance)}
          >
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Approve HBT
          </Button>
        )}
        <Button
          onClick={handleDeposit}
          className="w-full"
          disabled={
            isLoading ||
            (!isSimulationMode && (needsApproval || isCheckingAllowance)) ||
            !amount ||
            parseFloat(amount) <= 0 ||
            parseFloat(amount) > parseFloat(currentBalance)
          }
        >
          {isLoading || (!isSimulationMode && isCheckingAllowance) ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {!isSimulationMode && isCheckingAllowance
            ? 'Checking...'
            : (isLoading
                ? `Depositing ${isSimulationMode ? "Test Tokens" : "HBT"}...`
                : `Deposit ${isSimulationMode ? "Test Tokens" : "HBT"}`
              )
          }
        </Button>
      </CardFooter>
    </Card>
  );
}
