
import { WithdrawForm } from "@/components/withdraw-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Info } from "lucide-react";

export default function WithdrawPage() {
  return (
    <div className="container mx-auto max-w-2xl py-8">
      <div className="flex flex-col items-center space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">Withdraw Funds</h1>
          <p className="text-muted-foreground">Redeem your vault shares for Harbor Tokens (HBT).</p>
        </div>
        
        <WithdrawForm />

        <Card className="w-full max-w-md border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/30 shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center text-blue-700 dark:text-blue-300">
              <Info className="w-5 h-5 mr-2" />
              How Withdrawals Work
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-blue-600 dark:text-blue-400 space-y-2">
            <p>
              When you withdraw, your vault shares are burned, and you receive the corresponding amount of HBT based on the current share price.
            </p>
            <p>
              The share price is determined by the total value of assets in the vault divided by the total number of shares.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
