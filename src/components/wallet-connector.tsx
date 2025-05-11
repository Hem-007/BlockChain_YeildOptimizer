
"use client";

import { useWeb3 } from "@/contexts/web3-context";
import { Button } from "@/components/ui/button";
import { LogIn, LogOut, Wallet, AlertTriangle } from "lucide-react";
import { SEPOLIA_CHAIN_ID } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useEffect, useState } from "react";

export function WalletConnector() {
  const { 
    connectWallet, 
    disconnectWallet, 
    isConnected, 
    account, 
    chainId,
    hbtBalance 
  } = useWeb3();
  const [displayAccount, setDisplayAccount] = useState<string | null>(null);

  useEffect(() => {
    if (account) {
      setDisplayAccount(`${account.substring(0, 6)}...${account.substring(account.length - 4)}`);
    } else {
      setDisplayAccount(null);
    }
  }, [account]);


  if (isConnected && account) {
    const isCorrectNetwork = chainId === SEPOLIA_CHAIN_ID;
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2 shadow-sm">
            <Avatar className="h-6 w-6">
              <AvatarImage src={`https://api.dicebear.com/7.x/identicon/svg?seed=${account}`} alt="User Avatar" />
              <AvatarFallback>{account.substring(0,2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <span>{displayAccount}</span>
            {!isCorrectNetwork && <AlertTriangle className="h-4 w-4 text-destructive" />}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">Connected Account</p>
              <p className="text-xs leading-none text-muted-foreground break-all">
                {account}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="flex justify-between">
            <span>HBT Balance:</span>
            <Badge variant="secondary">{parseFloat(hbtBalance).toFixed(2)} HBT</Badge>
          </DropdownMenuItem>
          <DropdownMenuItem className="flex justify-between">
            <span>Network:</span>
            {isCorrectNetwork ? (
              <Badge variant="outline" className="text-green-600 border-green-600">Sepolia</Badge>
            ) : (
              <Badge variant="destructive">Wrong Network</Badge>
            )}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={disconnectWallet} className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer">
            <LogOut className="mr-2 h-4 w-4" />
            Disconnect
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <Button onClick={connectWallet} className="bg-accent hover:bg-accent/90 text-accent-foreground shadow-md">
      <LogIn className="mr-2 h-5 w-5" /> Connect Wallet
    </Button>
  );
}
