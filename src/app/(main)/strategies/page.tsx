
"use client";

import { StrategyCard } from "@/components/strategy-card";
import { AddStrategyForm } from "@/components/add-strategy-form";
import { MOCK_STRATEGIES_DATA, YIELD_HARBOR_VAULT_ABI, YIELD_HARBOR_VAULT_ADDRESS, MOCK_STRATEGY_ABI } from "@/lib/constants";
import type { StrategyInfo } from "@/lib/constants";
import { useWeb3 } from "@/contexts/web3-context";
import { Button } from "@/components/ui/button";
import { ListFilter, Loader2, AlertTriangle, Shuffle, Plus } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { Contract, formatUnits } from "ethers";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type SortOption = "apy_desc" | "apy_asc" | "tvl_desc" | "tvl_asc" | "name_asc" | "name_desc";

export default function StrategiesPage() {
  const { isConnected, signer, provider } = useWeb3();
  const { toast } = useToast();
  const [strategies, setStrategies] = useState<StrategyInfo[]>(MOCK_STRATEGIES_DATA);
  const [isLoading, setIsLoading] = useState(false);
  const [isAllocating, setIsAllocating] = useState(false);
  const [currentVaultStrategy, setCurrentVaultStrategy] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState<SortOption>("apy_desc");

  const fetchStrategiesFromContract = useCallback(async () => {
    if (!isConnected || !provider) return;
    setIsLoading(true);
    try {
      const vaultContract = new Contract(YIELD_HARBOR_VAULT_ADDRESS, YIELD_HARBOR_VAULT_ABI, provider);
      const strategiesCount = await vaultContract.getStrategiesCount();
      const fetchedStrategies: StrategyInfo[] = [];

      const currentStrategyAddress = await vaultContract.currentStrategy();
      setCurrentVaultStrategy(currentStrategyAddress.toLowerCase());

      for (let i = 0; i < strategiesCount; i++) {
        const strategyAddress = await vaultContract.strategies(i);
        const strategyContract = new Contract(strategyAddress, MOCK_STRATEGY_ABI, provider);

        const [name, apyBigInt, tvlInStrategyBigInt, tokenSymbolResult] = await Promise.allSettled([
            strategyContract.name(),
            strategyContract.getAPY(),
            vaultContract.strategyAllocations(strategyAddress),
            // Assuming strategy might have a `tokenSymbol()` or similar, otherwise use placeholder
            (async () => {
                try {
                    const tokenAddr = await strategyContract.token();
                    const tokenContract = new Contract(tokenAddr, ["function symbol() view returns (string)"], provider);
                    return await tokenContract.symbol();
                } catch { return undefined; }
            })()
        ]);

        fetchedStrategies.push({
          address: strategyAddress,
          name: name.status === "fulfilled" ? name.value : `Strategy ${i + 1}`,
          apy: apyBigInt.status === "fulfilled" ? Number(formatUnits(apyBigInt.value, 2)) : 0, // APY stored as 500 for 5.00%
          tvl: tvlInStrategyBigInt.status === "fulfilled" ? formatUnits(tvlInStrategyBigInt.value, 18) : "0", // Assuming 18 decimals for TVL
          tokenSymbol: tokenSymbolResult.status === "fulfilled" ? tokenSymbolResult.value : undefined,
        });
      }
      // If no strategies fetched from contract, use mock data as fallback
      setStrategies(fetchedStrategies.length > 0 ? fetchedStrategies : MOCK_STRATEGIES_DATA);

    } catch (error: any) {
      toast({ title: "Error fetching strategies", description: error.message, variant: "destructive" });
      setStrategies(MOCK_STRATEGIES_DATA); // Fallback to mock on error
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, provider, toast]);

  // Load custom strategies from localStorage
  const loadCustomStrategies = useCallback(() => {
    if (typeof window !== 'undefined') {
      const storedStrategies = localStorage.getItem("custom_strategies");
      if (storedStrategies) {
        const customStrategies = JSON.parse(storedStrategies);
        return customStrategies;
      }
    }
    return [];
  }, []);

  // Handle adding a new strategy
  const handleStrategyAdded = useCallback((newStrategy: StrategyInfo) => {
    setStrategies(prev => [...prev, newStrategy]);
  }, []);

  useEffect(() => {
    if (isConnected) {
      // fetchStrategiesFromContract(); // Uncomment to fetch live data
      // For demo purposes, using MOCK_STRATEGIES_DATA and simulating current strategy
      const mockCurrentStrategy = MOCK_STRATEGIES_DATA.length > 0 ? MOCK_STRATEGIES_DATA[0].address : null;
      setCurrentVaultStrategy(mockCurrentStrategy ? mockCurrentStrategy.toLowerCase() : null);

      // Combine mock strategies with custom strategies from localStorage
      const customStrategies = loadCustomStrategies();
      setStrategies([...MOCK_STRATEGIES_DATA, ...customStrategies]);
    }
  }, [isConnected, fetchStrategiesFromContract, loadCustomStrategies]);

  const handleAllocateToBestStrategy = async () => {
    if (!signer) {
      toast({ title: "Error", description: "Wallet not connected or signer not available.", variant: "destructive"});
      return;
    }
    setIsAllocating(true);
    try {
      const vaultContract = new Contract(YIELD_HARBOR_VAULT_ADDRESS, YIELD_HARBOR_VAULT_ABI, signer);
      const tx = await vaultContract.allocateToBestStrategy();
      await tx.wait();
      toast({ title: "Allocation Successful", description: "Funds conceptually re-allocated to the best strategy." });
      // fetchStrategiesFromContract(); // Re-fetch to update TVLs and current strategy
      // Simulate update for demo
      const bestStrategy = [...strategies].sort((a,b) => b.apy - a.apy)[0];
      if (bestStrategy) setCurrentVaultStrategy(bestStrategy.address.toLowerCase());
      toast({ title: "Conceptual Allocation", description: `Funds notionally moved to ${bestStrategy?.name || 'best strategy'}. (Simulated)`})

    } catch (error: any) {
      toast({ title: "Allocation Failed", description: error.message, variant: "destructive" });
    } finally {
      setIsAllocating(false);
    }
  };

  const sortedStrategies = [...strategies].sort((a, b) => {
    switch (sortOption) {
      case "apy_desc": return b.apy - a.apy;
      case "apy_asc": return a.apy - b.apy;
      case "tvl_desc": return parseFloat(b.tvl) - parseFloat(a.tvl);
      case "tvl_asc": return parseFloat(a.tvl) - parseFloat(b.tvl);
      case "name_asc": return a.name.localeCompare(b.name);
      case "name_desc": return b.name.localeCompare(a.name);
      default: return 0;
    }
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Yield Strategies</h1>
          <p className="text-muted-foreground">
            Discover conceptual yield strategies available to the YieldHarbor vault.
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="default" className="bg-primary">
                <Plus className="mr-2 h-4 w-4" />
                Add Strategy
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Add New Strategy</DialogTitle>
                <DialogDescription>
                  Create a custom yield strategy for the YieldHarbor vault.
                </DialogDescription>
              </DialogHeader>
              <AddStrategyForm onStrategyAdded={handleStrategyAdded} />
            </DialogContent>
          </Dialog>

          <Button onClick={handleAllocateToBestStrategy} disabled={!isConnected || isAllocating || isLoading} className="bg-accent hover:bg-accent/90 text-accent-foreground">
            {isAllocating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Shuffle className="mr-2 h-4 w-4" />}
            Simulate Allocation
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <ListFilter className="mr-2 h-4 w-4" /> Sort By
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuRadioGroup value={sortOption} onValueChange={(value) => setSortOption(value as SortOption)}>
                <DropdownMenuRadioItem value="apy_desc">APY (High to Low)</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="apy_asc">APY (Low to High)</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="tvl_desc">TVL (High to Low)</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="tvl_asc">TVL (Low to High)</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="name_asc">Name (A-Z)</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="name_desc">Name (Z-A)</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {!isConnected && (
        <div className="text-center py-10">
          <AlertTriangle className="mx-auto h-12 w-12 text-muted-foreground" />
          <p className="mt-4 text-muted-foreground">Please connect your wallet to view strategy details.</p>
        </div>
      )}

      {isConnected && isLoading && (
        <div className="text-center py-10">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
          <p className="mt-4 text-muted-foreground">Loading strategies...</p>
        </div>
      )}

      {isConnected && !isLoading && strategies.length === 0 && (
         <div className="text-center py-10">
          <AlertTriangle className="mx-auto h-12 w-12 text-muted-foreground" />
          <p className="mt-4 text-muted-foreground">No strategies found or unable to fetch data.</p>
        </div>
      )}

      {isConnected && !isLoading && strategies.length > 0 && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedStrategies.map((strategy) => (
            <div key={strategy.address} className="relative">
              <StrategyCard strategy={strategy} />
              {currentVaultStrategy === strategy.address.toLowerCase() && (
                <div className="absolute top-2 right-2 bg-primary text-primary-foreground text-xs font-semibold px-2 py-1 rounded-full shadow-md">
                  Current
                </div>
              )}
            </div>
          ))}
        </div>
      )}
       <p className="text-sm text-muted-foreground text-center pt-4">
          Note: Strategy data is currently mocked for demonstration. APY and TVL figures are illustrative.
          The 'Simulate Allocation' button conceptually re-allocates funds to the highest APY strategy (this is a simulated action).
        </p>
    </div>
  );
}
