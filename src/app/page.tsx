
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Anchor, BarChartBig, Zap } from "lucide-react";
import Link from "next/link";

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
            <CardDescription>
              Experience how a DeFi vault can conceptually interact with strategies on different blockchains or L2s to find the best yields.
            </CardDescription>
          </CardContent>
        </Card>

        <Card className="shadow-xl hover:shadow-2xl transition-shadow duration-300">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <BarChartBig className="w-8 h-8 text-accent" />
              <CardTitle className="text-2xl">Automated Yield Aggregation</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Our smart vault contract (conceptually) allocates funds to the highest-yielding strategy, maximizing your returns.
            </CardDescription>
          </CardContent>
        </Card>

        <Card className="shadow-xl hover:shadow-2xl transition-shadow duration-300">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
               <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent"><path d="M20 12V8H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v4"/><path d="M18 12v1a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-1a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2Z"/><path d="M4 12v1a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-1a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2Z"/><path d="M12 18v1a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-1a2 2 0 0 0-2-2h-1a2 2 0 0 0-2 2Z"/></svg>
              <CardTitle className="text-2xl">Secure & Transparent</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Interact with ERC20 tokens on the Sepolia testnet. Track your shares and accrued yield with ease.
            </CardDescription>
          </CardContent>
        </Card>
      </main>

      <div className="text-center">
        <Link href="/dashboard">
          <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg transform hover:scale-105 transition-transform duration-300">
            Explore Dashboard
          </Button>
        </Link>
        <p className="mt-4 text-sm text-muted-foreground">
          Connect your Metamask wallet on the Sepolia testnet to get started.
        </p>
      </div>

      <footer className="mt-16 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} YieldHarbor. All rights reserved (conceptually).</p>
      </footer>
    </div>
  );
}
