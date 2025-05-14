"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { useWeb3 } from "@/contexts/web3-context";
import { Loader2, Plus, TrendingUp, DollarSign, Zap, BarChartBig } from "lucide-react";
import { MOCK_STRATEGIES_DATA } from "@/lib/constants";

interface AddStrategyFormProps {
  onStrategyAdded: (strategy: any) => void;
}

export function AddStrategyForm({ onStrategyAdded }: AddStrategyFormProps) {
  const { toast } = useToast();
  const { account, isSimulationMode } = useWeb3();
  const [isLoading, setIsLoading] = useState(false);
  
  // Form state
  const [name, setName] = useState("");
  const [tokenSymbol, setTokenSymbol] = useState("ETH");
  const [apy, setApy] = useState(5);
  const [tvl, setTvl] = useState("1000000");
  const [riskLevel, setRiskLevel] = useState("Medium");
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!account) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to add a strategy.",
        variant: "destructive"
      });
      return;
    }
    
    if (!isSimulationMode) {
      toast({
        title: "Real Mode Active",
        description: "Adding strategies is only available in simulation mode.",
        variant: "destructive"
      });
      return;
    }
    
    if (!name || !tokenSymbol || !apy || !tvl) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Generate a random address for the new strategy
      const randomAddress = "0x" + Array.from({length: 40}, () => 
        Math.floor(Math.random() * 16).toString(16)
      ).join("");
      
      // Create new strategy object
      const newStrategy = {
        address: randomAddress,
        name,
        tokenSymbol,
        apy,
        tvl,
        riskLevel
      };
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Get existing strategies from localStorage
      const storedStrategies = localStorage.getItem("custom_strategies");
      const customStrategies = storedStrategies ? JSON.parse(storedStrategies) : [];
      
      // Add new strategy
      customStrategies.push(newStrategy);
      
      // Save to localStorage
      localStorage.setItem("custom_strategies", JSON.stringify(customStrategies));
      
      // Notify parent component
      onStrategyAdded(newStrategy);
      
      // Reset form
      setName("");
      setTokenSymbol("ETH");
      setApy(5);
      setTvl("1000000");
      setRiskLevel("Medium");
      
      toast({
        title: "Strategy Added",
        description: `${name} strategy has been added successfully.`,
      });
    } catch (error: any) {
      toast({
        title: "Error Adding Strategy",
        description: error.message || "An error occurred while adding the strategy.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  if (!isSimulationMode) {
    return (
      <Card className="w-full shadow-md">
        <CardHeader>
          <CardTitle>Add New Strategy</CardTitle>
          <CardDescription>
            Create a custom yield strategy for the YieldHarbor vault.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-amber-50 border border-amber-200 rounded-md p-4 text-amber-800">
            <p className="font-medium">Simulation Mode Required</p>
            <p className="mt-1 text-sm">
              Adding custom strategies is only available in simulation mode. Please switch to simulation mode to use this feature.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="w-full shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Add New Strategy
        </CardTitle>
        <CardDescription>
          Create a custom yield strategy for the YieldHarbor vault.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="strategy-name">Strategy Name</Label>
            <Input
              id="strategy-name"
              placeholder="e.g., AlphaStaker ETH"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="token-symbol">Token</Label>
            <Select
              value={tokenSymbol}
              onValueChange={setTokenSymbol}
              disabled={isLoading}
            >
              <SelectTrigger id="token-symbol">
                <SelectValue placeholder="Select token" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ETH">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    <span>ETH</span>
                  </div>
                </SelectItem>
                <SelectItem value="USDC">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    <span>USDC</span>
                  </div>
                </SelectItem>
                <SelectItem value="USDT">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    <span>USDT</span>
                  </div>
                </SelectItem>
                <SelectItem value="WBTC">
                  <div className="flex items-center gap-2">
                    <BarChartBig className="h-4 w-4" />
                    <span>WBTC</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="apy">Annual Percentage Yield (APY)</Label>
              <span className="text-sm font-medium text-green-600 flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                {apy}%
              </span>
            </div>
            <Slider
              id="apy"
              min={0.1}
              max={15}
              step={0.1}
              value={[apy]}
              onValueChange={(value) => setApy(value[0])}
              disabled={isLoading}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0.1%</span>
              <span>15%</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="tvl">Total Value Locked (TVL) in USD</Label>
            <Input
              id="tvl"
              type="number"
              placeholder="e.g., 1000000"
              value={tvl}
              onChange={(e) => setTvl(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="risk-level">Risk Level</Label>
            <Select
              value={riskLevel}
              onValueChange={setRiskLevel}
              disabled={isLoading}
            >
              <SelectTrigger id="risk-level">
                <SelectValue placeholder="Select risk level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Low">Low</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Medium-High">Medium-High</SelectItem>
                <SelectItem value="High">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding Strategy...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Add Strategy
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
