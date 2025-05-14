
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, BarChartBig, Zap, DollarSign, ArrowRight } from "lucide-react";
import type { StrategyInfo } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface StrategyCardProps {
  strategy: StrategyInfo;
}

const TokenIcon: React.FC<{ symbol?: string }> = ({ symbol }) => {
  if (!symbol) return <DollarSign className="h-8 w-8 text-muted-foreground" />;
  // In a real app, you might map symbols to actual image URLs
  // For now, using a placeholder generic icon based on symbol
  const commonIcons: { [key: string]: React.ElementType } = {
    "ETH": Zap,
    "stETH": Zap,
    "USDC": DollarSign,
    "USDT": DollarSign,
    "WBTC": BarChartBig, // Placeholder for BTC like icon
  };
  const IconComponent = commonIcons[symbol] || BarChartBig;
  return <IconComponent className="h-8 w-8 text-primary" />;
};

export function StrategyCard({ strategy }: StrategyCardProps) {
  const router = useRouter();

  const handleViewDetails = () => {
    router.push(`/strategies/${strategy.address}`);
  };

  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col h-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
                <TokenIcon symbol={strategy.tokenSymbol} />
                <div>
                    <CardTitle className="text-xl mb-1">{strategy.name}</CardTitle>
                    <CardDescription>Strategy Address: {strategy.address.substring(0,6)}...{strategy.address.substring(strategy.address.length-4)}</CardDescription>
                </div>
            </div>
        </div>
      </CardHeader>
      <CardContent className="flex-grow space-y-3">
        <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Annual Percentage Yield (APY)</span>
            <Badge variant="outline" className="text-lg font-semibold border-green-500 text-green-600">
                <TrendingUp className="h-4 w-4 mr-1.5" />
                {strategy.apy.toFixed(2)}%
            </Badge>
        </div>
        <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Vault's TVL in Strategy</span>
            <span className="text-md font-medium">
                ${parseFloat(strategy.tvl).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
            </span>
        </div>
        {strategy.tokenSymbol && (
             <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Asset</span>
                <Badge variant="secondary">{strategy.tokenSymbol}</Badge>
            </div>
        )}
      </CardContent>
      <CardFooter>
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={handleViewDetails}
        >
          View Strategy Details
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
