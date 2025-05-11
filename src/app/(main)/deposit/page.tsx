
import { DepositForm } from "@/components/deposit-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Info } from "lucide-react";

export default function DepositPage() {
  return (
    <div className="container mx-auto max-w-2xl py-8">
      <div className="flex flex-col items-center space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">Deposit Funds</h1>
          <p className="text-muted-foreground">Add your Harbor Tokens (HBT) to the YieldHarbor vault.</p>
        </div>
        
        <DepositForm />

        <Card className="w-full max-w-md border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/30 shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center text-blue-700 dark:text-blue-300">
              <Info className="w-5 h-5 mr-2" />
              How Deposits Work
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-blue-600 dark:text-blue-400 space-y-2">
            <p>
              When you deposit HBT, you receive vault shares representing your portion of the total assets.
              The vault then (conceptually) allocates these funds to the highest-yielding strategies.
            </p>
            <p>
              You will need to approve the Vault contract to spend your HBT tokens before your first deposit, or if depositing an amount greater than your current allowance.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
