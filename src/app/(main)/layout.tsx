
"use client";

import React, { useState, useEffect } from "react";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { MainHeader } from "@/components/layout/main-header";
import { Anchor, PanelLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function MainAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    
    // Load sidebar state from local storage
    const storedSidebarState = localStorage.getItem("sidebarCollapsed");
    if (storedSidebarState) {
      setIsSidebarCollapsed(JSON.parse(storedSidebarState));
    }

    return () => window.removeEventListener("resize", checkMobile);
  }, []);
  
  const toggleSidebar = () => {
    if (isMobile) {
      setIsMobileSidebarOpen(!isMobileSidebarOpen);
    } else {
      const newState = !isSidebarCollapsed;
      setIsSidebarCollapsed(newState);
      localStorage.setItem("sidebarCollapsed", JSON.stringify(newState));
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-muted/40">
      <MainHeader toggleSidebar={toggleSidebar} isSidebarCollapsed={isSidebarCollapsed} />
      <div className="flex flex-1">
        {/* Desktop Sidebar */}
        {!isMobile && (
          <aside
            className={cn(
              "fixed inset-y-0 left-0 z-30 hidden flex-col border-r bg-sidebar text-sidebar-foreground transition-all duration-300 ease-in-out lg:flex",
              isSidebarCollapsed ? "w-16 pt-16" : "w-64 pt-16" 
            )}
          >
            <div className={cn("flex items-center justify-between p-3 h-16 border-b", isSidebarCollapsed ? "justify-center" : "justify-between")}>
              {!isSidebarCollapsed && (
                <div className="flex items-center gap-2">
                  <Anchor className="h-7 w-7 text-primary" />
                  <span className="font-bold text-lg">YieldHarbor</span>
                </div>
              )}
              <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleSidebar}
                  className="h-8 w-8"
                  aria-label="Toggle Sidebar"
                >
                  <PanelLeft className="h-5 w-5 transform transition-transform duration-300" style={{ transform: isSidebarCollapsed ? 'rotate(180deg)' : 'rotate(0deg)' }} />
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto py-4">
              <SidebarNav isCollapsed={isSidebarCollapsed} />
            </div>
          </aside>
        )}

        {/* Mobile Sidebar - Sheet */}
        {isMobile && (
            <div 
              className={cn(
                  "fixed inset-0 z-40 bg-black/50 transition-opacity lg:hidden",
                  isMobileSidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
              )}
              onClick={() => setIsMobileSidebarOpen(false)} 
            />
        )}
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r bg-sidebar text-sidebar-foreground transition-transform duration-300 ease-in-out lg:hidden",
            isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="flex items-center justify-between p-4 h-16 border-b">
            <div className="flex items-center gap-2">
              <Anchor className="h-7 w-7 text-primary" />
              <span className="font-bold text-lg">YieldHarbor</span>
            </div>
            <Button
                variant="ghost"
                size="icon"
                onClick={toggleSidebar} // Close button for mobile sidebar
                className="h-8 w-8"
                aria-label="Close Sidebar"
              >
                <PanelLeft className="h-5 w-5" />
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto py-4">
            <SidebarNav isCollapsed={false} /> {/* Mobile sidebar is never collapsed */}
          </div>
        </aside>

        <main
          className={cn(
            "flex-1 flex flex-col transition-all duration-300 ease-in-out",
            !isMobile && (isSidebarCollapsed ? "lg:pl-16" : "lg:pl-64"),
             "pt-16" // Account for fixed header height
          )}
        >
          <div className="p-4 sm:p-6 lg:p-8 flex-grow">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
