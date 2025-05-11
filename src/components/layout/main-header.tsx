
"use client";

import Link from "next/link";
import { Anchor } from "lucide-react";
import { WalletConnector } from "@/components/wallet-connector";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { SidebarNav } from "./sidebar-nav"; 
import { Menu } from "lucide-react";

export function MainHeader({ toggleSidebar, isSidebarCollapsed }: { toggleSidebar?: () => void; isSidebarCollapsed?: boolean;}) {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between max-w-screen-2xl">
        <div className="flex items-center">
          {toggleSidebar && (
             <Button
                variant="ghost"
                size="icon"
                onClick={toggleSidebar}
                className="mr-2 lg:hidden"
                aria-label="Toggle Sidebar"
              >
                <Menu className="h-6 w-6" />
            </Button>
          )}
          <Link href="/dashboard" className="flex items-center space-x-2">
            <Anchor className="h-7 w-7 text-primary" />
            <span className="font-bold text-xl hidden sm:inline-block">YieldHarbor</span>
          </Link>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* <ModeToggle /> Uncomment if you add a theme toggle */}
          <WalletConnector />
        </div>
      </div>
    </header>
  );
}
