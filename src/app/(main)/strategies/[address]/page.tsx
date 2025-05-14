"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { MOCK_STRATEGIES_DATA } from "@/lib/constants";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, TrendingUp, BarChart2, DollarSign, Clock, Users, Zap, BarChartBig } from "lucide-react";
import { useWeb3 } from "@/contexts/web3-context";

interface StrategyData {
  address: string;
  name: string;
  apy: number;
  tvl: string;
  tokenSymbol?: string;
  description?: string;
  riskLevel?: string;
  performanceHistory?: {
    date: string;
    apy: number;
  }[];
}

export default function StrategyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isSimulationMode } = useWeb3();
  const [strategy, setStrategy] = useState<StrategyData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeElapsed, setTimeElapsed] = useState(0);
  
  // Mock descriptions for strategies
  const strategyDescriptions: Record<string, { description: string, risk: string }> = {
    "AlphaStaker ETH": {
      description: "AlphaStaker ETH is a liquid staking strategy that earns yield by staking ETH with multiple validators. The strategy automatically compounds rewards and maintains liquidity for depositors.",
      risk: "Medium"
    },
    "BetaLender USDC": {
      description: "BetaLender USDC provides yield by lending USDC to verified borrowers in the DeFi ecosystem. The strategy implements strict risk management and collateralization requirements.",
      risk: "Low"
    },
    "GammaPool BTC": {
      description: "GammaPool BTC generates yield through a combination of lending and liquidity provision for wrapped Bitcoin. The strategy dynamically allocates assets based on market conditions.",
      risk: "Medium-High"
    },
    "DeltaYield USDT": {
      description: "DeltaYield USDT focuses on generating high yields through algorithmic trading and arbitrage opportunities across multiple DEXes using USDT as the base asset.",
      risk: "High"
    }
  };
  
  // Mock performance history data
  const generatePerformanceHistory = (baseApy: number) => {
    const history = [];
    const now = new Date();
    
    for (let i = 30; i >= 0; i--) {
      const date = new Date();
      date.setDate(now.getDate() - i);
      
      // Random fluctuation around the base APY
      const fluctuation = (Math.random() * 2 - 1) * (baseApy * 0.2);
      const apy = Math.max(0, baseApy + fluctuation);
      
      history.push({
        date: date.toISOString().split('T')[0],
        apy: parseFloat(apy.toFixed(2))
      });
    }
    
    return history;
  };
  
  useEffect(() => {
    if (!params.address) return;
    
    const address = Array.isArray(params.address) ? params.address[0] : params.address;
    
    // Find strategy in mock data
    const foundStrategy = MOCK_STRATEGIES_DATA.find(s => 
      s.address.toLowerCase() === address.toLowerCase()
    );
    
    if (foundStrategy) {
      // Add additional mock data
      const strategyInfo = strategyDescriptions[foundStrategy.name] || {
        description: "A yield-generating strategy that optimizes returns while managing risk.",
        risk: "Medium"
      };
      
      setStrategy({
        ...foundStrategy,
        description: strategyInfo.description,
        riskLevel: strategyInfo.risk,
        performanceHistory: generatePerformanceHistory(foundStrategy.apy)
      });
    }
    
    // Simulate loading
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, [params.address]);
  
  // Simulate time passing for demo purposes
  useEffect(() => {
    if (!isSimulationMode) return;
    
    const timer = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);
    
    return () => clearInterval(timer);
  }, [isSimulationMode]);
  
  const getTokenIcon = (symbol?: string) => {
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
  
  if (isLoading) {
    return (
      <div className="container mx-auto py-8 space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Strategies
          </Button>
        </div>
        
        <div className="space-y-6">
          <Skeleton className="h-12 w-1/3" />
          <Skeleton className="h-6 w-2/3" />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
          
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }
  
  if (!strategy) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center gap-2 mb-6">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Strategies
          </Button>
        </div>
        
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Strategy Not Found</h2>
              <p className="text-muted-foreground">The strategy you're looking for doesn't exist or has been removed.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  const TokenIcon = getTokenIcon(strategy.tokenSymbol);
  
  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Strategies
        </Button>
      </div>
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-full">
              <TokenIcon className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold">{strategy.name}</h1>
          </div>
          <p className="text-muted-foreground mt-1">{strategy.description}</p>
        </div>
        
        <div className="flex items-center gap-2 bg-green-50 text-green-700 px-3 py-2 rounded-md">
          <TrendingUp className="h-5 w-5" />
          <span className="text-xl font-bold">{strategy.apy}% APY</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              Total Value Locked
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">${parseFloat(strategy.tvl).toLocaleString()}</div>
            <p className="text-sm text-muted-foreground">Assets currently in this strategy</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart2 className="h-5 w-5 text-primary" />
              Risk Level
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{strategy.riskLevel}</div>
            <div className="mt-2">
              <Progress value={
                strategy.riskLevel === "Low" ? 25 :
                strategy.riskLevel === "Medium" ? 50 :
                strategy.riskLevel === "Medium-High" ? 75 : 90
              } className="h-2" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Allocation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {strategy.name === "AlphaStaker ETH" ? "60%" :
               strategy.name === "BetaLender USDC" ? "20%" :
               strategy.name === "GammaPool BTC" ? "15%" : "5%"}
            </div>
            <p className="text-sm text-muted-foreground">Percentage of vault funds</p>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Performance History</CardTitle>
          <CardDescription>APY over the last 30 days</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 relative">
            {/* Simple chart visualization */}
            <div className="absolute inset-0 flex items-end">
              {strategy.performanceHistory?.map((day, i) => (
                <div 
                  key={i} 
                  className="flex-1 bg-primary/80 hover:bg-primary transition-all"
                  style={{ 
                    height: `${(day.apy / (strategy.apy * 1.5)) * 100}%`,
                    marginLeft: i > 0 ? '2px' : '0'
                  }}
                  title={`${day.date}: ${day.apy}% APY`}
                />
              ))}
            </div>
            
            {/* Y-axis labels */}
            <div className="absolute inset-y-0 left-0 flex flex-col justify-between text-xs text-muted-foreground">
              <span>{(strategy.apy * 1.5).toFixed(2)}%</span>
              <span>{strategy.apy.toFixed(2)}%</span>
              <span>{(strategy.apy * 0.5).toFixed(2)}%</span>
              <span>0%</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="text-sm text-muted-foreground">
          {isSimulationMode && (
            <div className="w-full bg-amber-50 border border-amber-200 rounded-md p-3 text-amber-800">
              <div className="flex justify-between items-center">
                <span className="font-medium flex items-center">
                  <Clock className="h-4 w-4 mr-2" /> Simulated time elapsed:
                </span>
                <span>{timeElapsed} hours</span>
              </div>
              <p className="mt-2 text-xs">
                In simulation mode, 1 second equals 1 hour. This allows you to see how yields would accumulate over time.
              </p>
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
