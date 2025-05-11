
"use client";

import { useState, useEffect } from "react";
import { useWeb3 } from "@/contexts/web3-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Wallet } from "lucide-react";
import { parseUnits, formatUnits } from "ethers";

export function DepositForm() {
  const { hbtBalance, depositToVault, getAllowance, approveHBT, isConnected, YIELD_HARBOR_VAULT_ADDRESS } = useWeb3();
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [needsApproval, setNeedsApproval] = useState(false);
  const [isCheckingAllowance, setIsCheckingAllowance] = useState(false);

  useEffect(() => {
    const checkAllowance = async () => {
      if (!isConnected || !amount || parseFloat(amount) <= 0) {
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
  }, [amount, isConnected, getAllowance]);


  const handleDeposit = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      alert("Please enter a valid amount.");
      return;
    }
    setIsLoading(true);
    const success = await depositToVault(amount);
    if (success) {
      setAmount(""); // Reset amount on successful deposit
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
    setAmount(hbtBalance);
  };


  if (!isConnected) {
    return <p className="text-center text-muted-foreground">Please connect your wallet to deposit funds.</p>;
  }

  return (
    <Card className="w-full max-w-md shadow-lg">
      <CardHeader>
        <CardTitle>Deposit HBT Tokens</CardTitle>
        <CardDescription>Deposit your Harbor Tokens (HBT) into the vault to earn yield.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between text-sm">
          <div className="text-muted-foreground flex items-center">
            <Wallet className="w-4 h-4 mr-2" /> Your HBT Balance:
          </div>
          <div className="font-medium">{parseFloat(hbtBalance).toFixed(4)} HBT</div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="deposit-amount">Amount to Deposit</Label>
          <div className="flex items-center gap-2">
            <Input
              id="deposit-amount"
              type="number"
              placeholder="0.00 HBT"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={isLoading}
              min="0"
            />
            <Button variant="outline" size="sm" onClick={setMaxAmount} disabled={isLoading || parseFloat(hbtBalance) <= 0}>Max</Button>
          </div>
           {parseFloat(amount) > parseFloat(hbtBalance) && (
            <p className="text-xs text-destructive">Amount exceeds your HBT balance.</p>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-2">
        {needsApproval && !isCheckingAllowance && (
          <Button onClick={handleApprove} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" disabled={isLoading || parseFloat(amount) <= 0 || parseFloat(amount) > parseFloat(hbtBalance)}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Approve HBT
          </Button>
        )}
        <Button 
          onClick={handleDeposit} 
          className="w-full" 
          disabled={isLoading || needsApproval || isCheckingAllowance || !amount || parseFloat(amount) <= 0 || parseFloat(amount) > parseFloat(hbtBalance)}
        >
          {isLoading || isCheckingAllowance ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {isCheckingAllowance ? 'Checking...' : (isLoading && !needsApproval ? 'Depositing...' : (isLoading && needsApproval ? 'Approving...' : 'Deposit HBT'))}
        </Button>
      </CardFooter>
    </Card>
  );
}
