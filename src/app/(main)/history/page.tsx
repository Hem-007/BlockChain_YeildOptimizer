"use client";

import { TransactionHistory } from "@/components/transaction-history";
import { useWeb3 } from "@/contexts/web3-context";

export default function HistoryPage() {
  const { isConnected } = useWeb3();

  return (
    <div className="container mx-auto py-8">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transaction History</h1>
          <p className="text-muted-foreground">View your deposit and withdrawal history with strategy allocations.</p>
        </div>
        
        <TransactionHistory />
        
        {!isConnected && (
          <div className="text-center py-8 text-muted-foreground">
            Connect your wallet to view your transaction history.
          </div>
        )}
      </div>
    </div>
  );
}
