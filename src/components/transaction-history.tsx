"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowDownToLine, ArrowUpFromLine, Clock, DollarSign, TrendingUp, Zap, BarChartBig } from "lucide-react";
import { useWeb3 } from "@/contexts/web3-context";
import { MOCK_STRATEGIES_DATA } from "@/lib/constants";
import { Skeleton } from "@/components/ui/skeleton";

interface Transaction {
  id: string;
  type: "deposit" | "withdraw";
  amount: string;
  timestamp: number;
  strategies?: {
    name: string;
    percentage: number;
    apy: number;
    isPrimary?: boolean;
  }[];
  yieldEarned?: string;
  primaryStrategy?: string;
}

export function TransactionHistory() {
  const { account, isSimulationMode } = useWeb3();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load transaction history from localStorage
  useEffect(() => {
    if (!account) return;

    setIsLoading(true);

    // Simulate loading delay
    setTimeout(() => {
      const storedTransactions = localStorage.getItem(`transactions_${account}`);
      if (storedTransactions) {
        setTransactions(JSON.parse(storedTransactions));
      } else if (isSimulationMode) {
        // Generate some mock transactions for first-time users in simulation mode
        const mockTransactions = generateMockTransactions();
        setTransactions(mockTransactions);
        localStorage.setItem(`transactions_${account}`, JSON.stringify(mockTransactions));
      }
      setIsLoading(false);
    }, 1000);
  }, [account, isSimulationMode]);

  // Generate mock transaction history for new users
  const generateMockTransactions = (): Transaction[] => {
    const now = Date.now();
    const hour = 3600 * 1000;
    const day = 24 * hour;

    return [
      {
        id: "tx-" + Math.random().toString(36).substring(2, 10),
        type: "deposit",
        amount: "250",
        timestamp: now - 7 * day,
        primaryStrategy: "AlphaStaker ETH",
        strategies: [
          { name: "AlphaStaker ETH", percentage: 60, apy: 5.25, isPrimary: true },
          { name: "BetaLender USDC", percentage: 20, apy: 3.75 },
          { name: "GammaPool BTC", percentage: 15, apy: 4.50 },
          { name: "DeltaYield USDT", percentage: 5, apy: 6.10 }
        ]
      },
      {
        id: "tx-" + Math.random().toString(36).substring(2, 10),
        type: "withdraw",
        amount: "100",
        timestamp: now - 5 * day,
        primaryStrategy: "AlphaStaker ETH",
        strategies: [
          { name: "AlphaStaker ETH", percentage: 60, apy: 5.25, isPrimary: true },
          { name: "BetaLender USDC", percentage: 20, apy: 3.75 },
          { name: "GammaPool BTC", percentage: 15, apy: 4.50 },
          { name: "DeltaYield USDT", percentage: 5, apy: 6.10 }
        ],
        yieldEarned: "2.35"
      },
      {
        id: "tx-" + Math.random().toString(36).substring(2, 10),
        type: "deposit",
        amount: "150",
        timestamp: now - 3 * day,
        primaryStrategy: "DeltaYield USDT",
        strategies: [
          { name: "DeltaYield USDT", percentage: 55, apy: 6.10, isPrimary: true },
          { name: "AlphaStaker ETH", percentage: 25, apy: 5.25 },
          { name: "BetaLender USDC", percentage: 10, apy: 3.75 },
          { name: "GammaPool BTC", percentage: 10, apy: 4.50 }
        ]
      },
      {
        id: "tx-" + Math.random().toString(36).substring(2, 10),
        type: "withdraw",
        amount: "75",
        timestamp: now - 1 * day,
        primaryStrategy: "DeltaYield USDT",
        strategies: [
          { name: "DeltaYield USDT", percentage: 55, apy: 6.10, isPrimary: true },
          { name: "AlphaStaker ETH", percentage: 25, apy: 5.25 },
          { name: "BetaLender USDC", percentage: 10, apy: 3.75 },
          { name: "GammaPool BTC", percentage: 10, apy: 4.50 }
        ],
        yieldEarned: "1.87"
      }
    ];
  };

  // Add a new transaction to history
  const addTransaction = (transaction: Transaction) => {
    if (!account) return;

    const updatedTransactions = [transaction, ...transactions];
    setTransactions(updatedTransactions);
    localStorage.setItem(`transactions_${account}`, JSON.stringify(updatedTransactions));
  };

  // Format timestamp to readable date
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Get icon for strategy
  const getStrategyIcon = (strategyName: string) => {
    if (strategyName.includes("ETH")) return Zap;
    if (strategyName.includes("BTC")) return BarChartBig;
    return DollarSign;
  };

  if (!account) {
    return (
      <Card className="w-full shadow-md">
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>Connect your wallet to view transaction history</CardDescription>
        </CardHeader>
        <CardContent className="text-center py-8 text-muted-foreground">
          No wallet connected
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Transaction History
        </CardTitle>
        <CardDescription>Your deposit and withdrawal history with strategy allocations</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="all">All Transactions</TabsTrigger>
            <TabsTrigger value="deposits">Deposits</TabsTrigger>
            <TabsTrigger value="withdrawals">Withdrawals</TabsTrigger>
          </TabsList>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex flex-col space-y-3">
                  <div className="flex justify-between">
                    <Skeleton className="h-6 w-[120px]" />
                    <Skeleton className="h-6 w-[80px]" />
                  </div>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              ))}
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No transactions found
            </div>
          ) : (
            <>
              <TabsContent value="all" className="space-y-4">
                {transactions.map((tx) => (
                  <TransactionItem key={tx.id} transaction={tx} />
                ))}
              </TabsContent>

              <TabsContent value="deposits" className="space-y-4">
                {transactions
                  .filter((tx) => tx.type === "deposit")
                  .map((tx) => (
                    <TransactionItem key={tx.id} transaction={tx} />
                  ))}
              </TabsContent>

              <TabsContent value="withdrawals" className="space-y-4">
                {transactions
                  .filter((tx) => tx.type === "withdraw")
                  .map((tx) => (
                    <TransactionItem key={tx.id} transaction={tx} />
                  ))}
              </TabsContent>
            </>
          )}
        </Tabs>
      </CardContent>
    </Card>
  );

  // Transaction item component
  function TransactionItem({ transaction }: { transaction: Transaction }) {
    const [expanded, setExpanded] = useState(false);

    return (
      <div
        className="border rounded-lg p-4 hover:border-primary/50 transition-colors cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${
              transaction.type === "deposit"
                ? "bg-green-100 text-green-600"
                : "bg-blue-100 text-blue-600"
            }`}>
              {transaction.type === "deposit"
                ? <ArrowDownToLine className="h-4 w-4" />
                : <ArrowUpFromLine className="h-4 w-4" />
              }
            </div>
            <div>
              <div className="font-medium">
                {transaction.type === "deposit" ? "Deposit" : "Withdrawal"}
              </div>
              <div className="text-sm text-muted-foreground">
                {formatDate(transaction.timestamp)}
              </div>
              {transaction.primaryStrategy && (
                <div className="text-xs mt-1">
                  <span className="text-muted-foreground">Primary Strategy: </span>
                  <span className="font-medium text-primary">{transaction.primaryStrategy}</span>
                </div>
              )}
            </div>
          </div>
          <div className="text-right">
            <div className="font-medium">
              {transaction.type === "deposit" ? "+" : "-"}{transaction.amount} Tokens
            </div>
            {transaction.type === "withdraw" && transaction.yieldEarned && (
              <div className="text-sm text-green-600">
                +{transaction.yieldEarned} Yield
              </div>
            )}
          </div>
        </div>

        {expanded && transaction.strategies && (
          <div className="mt-4 pt-4 border-t">
            <div className="text-sm font-medium mb-2">
              {transaction.type === "deposit"
                ? "Allocated to Strategies:"
                : "Withdrawn from Strategies:"}
            </div>
            <div className="space-y-2">
              {transaction.strategies.map((strategy) => {
                const StrategyIcon = getStrategyIcon(strategy.name);
                return (
                  <div
                    key={strategy.name}
                    className={`flex justify-between items-center text-sm p-2 rounded-md ${
                      strategy.isPrimary
                        ? 'bg-primary/5 border border-primary/20'
                        : ''
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <StrategyIcon className={`h-4 w-4 ${strategy.isPrimary ? 'text-primary' : 'text-muted-foreground'}`} />
                      <span className={strategy.isPrimary ? 'font-medium' : ''}>
                        {strategy.name}
                        {strategy.isPrimary && (
                          <span className="ml-2 text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
                            Primary
                          </span>
                        )}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {strategy.percentage}%
                      </Badge>
                      <Badge variant="secondary" className={`text-xs ${strategy.isPrimary ? 'text-green-600 bg-green-50' : 'text-muted-foreground'}`}>
                        <TrendingUp className="h-3 w-3 mr-1" />
                        {strategy.apy}% APY
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>

            {transaction.type === "withdraw" && transaction.yieldEarned && (
              <div className="mt-3 pt-3 border-t border-green-200 text-sm text-green-700">
                <div className="flex items-center gap-1">
                  <TrendingUp className="h-4 w-4" />
                  <span className="font-medium">Yield earned: {transaction.yieldEarned} Tokens</span>
                </div>
                <p className="mt-1 text-xs">
                  Yield was generated based on the time your tokens were deposited and the APY of each strategy.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
}
