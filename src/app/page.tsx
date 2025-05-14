
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Anchor, BarChartBig, Zap, Clock, ArrowRight, Wallet, TrendingUp, BarChart, DollarSign } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export default function LandingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-background to-secondary/30 p-4 sm:p-8">
      <header className="text-center mb-12">
        <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-6">
          <Anchor className="w-16 h-16 text-primary" />
        </div>
        <h1 className="text-5xl sm:text-6xl font-bold text-foreground mb-4">
          Welcome to YieldHarbor
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Optimize your DeFi yields by aggregating from various sources, conceptually across different blockchains and Layer 2 solutions.
        </p>
        <div className="flex justify-center mt-6">
          <Badge variant="outline" className="text-amber-600 border-amber-300 bg-amber-50 px-3 py-1">
            <Clock className="w-4 h-4 mr-1" />
            Accelerated Simulation Mode
          </Badge>
        </div>
      </header>

      <main className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl w-full mb-12">
        <Card className="shadow-xl hover:shadow-2xl transition-shadow duration-300">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <Zap className="w-8 h-8 text-accent" />
              <CardTitle className="text-2xl">Cross-Chain Simulation</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription className="mb-4">
              Experience how a DeFi vault can conceptually interact with strategies on different blockchains or L2s to find the best yields.
            </CardDescription>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start">
                <div className="mr-2 mt-0.5 h-4 w-4 rounded-full bg-green-500/20 flex items-center justify-center">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                </div>
                <span>Strategies across Ethereum, Arbitrum, Optimism, and more</span>
              </li>
              <li className="flex items-start">
                <div className="mr-2 mt-0.5 h-4 w-4 rounded-full bg-green-500/20 flex items-center justify-center">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                </div>
                <span>Automatic rebalancing to highest yield sources</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Link href="/strategies" className="text-sm text-primary flex items-center">
              View Strategies <ArrowRight className="ml-1 h-3 w-3" />
            </Link>
          </CardFooter>
        </Card>

        <Card className="shadow-xl hover:shadow-2xl transition-shadow duration-300">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <BarChartBig className="w-8 h-8 text-accent" />
              <CardTitle className="text-2xl">Automated Yield Aggregation</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription className="mb-4">
              Our smart vault contract (conceptually) allocates funds to the highest-yielding strategy, maximizing your returns.
            </CardDescription>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span>AlphaStaker ETH</span>
                <Badge variant="secondary" className="text-green-600">5.25% APY</Badge>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span>BetaLender USDC</span>
                <Badge variant="secondary" className="text-green-600">3.75% APY</Badge>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span>DeltaYield USDT</span>
                <Badge variant="secondary" className="text-green-600">6.10% APY</Badge>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Link href="/deposit" className="text-sm text-primary flex items-center">
              Deposit Funds <ArrowRight className="ml-1 h-3 w-3" />
            </Link>
          </CardFooter>
        </Card>

        <Card className="shadow-xl hover:shadow-2xl transition-shadow duration-300">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <Clock className="w-8 h-8 text-accent" />
              <CardTitle className="text-2xl">Accelerated Simulation</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription className="mb-4">
              Test the platform with simulated tokens and accelerated time where 1 second equals 1 hour of yield accrual.
            </CardDescription>
            <div className="bg-amber-50 border border-amber-200 rounded-md p-3 text-sm text-amber-800">
              <div className="flex items-center gap-2 mb-2">
                <Wallet className="h-4 w-4" />
                <span className="font-medium">1000 test tokens automatically allocated</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                <span className="font-medium">Watch your yield grow in real-time</span>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Link href="/dashboard" className="text-sm text-primary flex items-center">
              Try Simulation <ArrowRight className="ml-1 h-3 w-3" />
            </Link>
          </CardFooter>
        </Card>
      </main>

      <div className="max-w-5xl w-full mb-12">
        <Card className="shadow-lg border-primary/20">
          <CardHeader>
            <CardTitle className="text-2xl">How YieldHarbor Works</CardTitle>
            <CardDescription>A simple guide to using our DeFi yield optimization platform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Wallet className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-medium mb-2">1. Connect Wallet</h3>
                <p className="text-sm text-muted-foreground">Connect your MetaMask wallet to get started with test tokens</p>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <DollarSign className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-medium mb-2">2. Deposit Tokens</h3>
                <p className="text-sm text-muted-foreground">Deposit your tokens into the YieldHarbor vault</p>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <BarChart className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-medium mb-2">3. Earn Yield</h3>
                <p className="text-sm text-muted-foreground">Your tokens are allocated to optimal strategies</p>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-medium mb-2">4. Withdraw Anytime</h3>
                <p className="text-sm text-muted-foreground">Withdraw your tokens plus earned yield whenever you want</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="text-center">
        <Link href="/dashboard">
          <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg transform hover:scale-105 transition-transform duration-300">
            Explore Dashboard
          </Button>
        </Link>
        <p className="mt-4 text-sm text-muted-foreground">
          Connect your Metamask wallet on the Sepolia testnet to get started.
        </p>
        <div className="mt-2 flex justify-center">
          <Badge variant="outline" className="text-amber-600 border-amber-300 bg-amber-50">
            No real tokens needed - simulation mode available
          </Badge>
        </div>
      </div>

      <footer className="mt-16 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} YieldHarbor. All rights reserved (conceptually).</p>
      </footer>
    </div>
  );
}
