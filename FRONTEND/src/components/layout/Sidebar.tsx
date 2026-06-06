"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  Box, LayoutDashboard, Users, Package, ShoppingCart, PieChart, FileCheck, Receipt, Settings, LogOut, ChevronLeft, ChevronRight
} from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const navItems: { name: string; href: string; icon: any; badge?: string }[] = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Vendors", href: "/vendors", icon: Users },
  { name: "RFQs", href: "/rfqs", icon: Package },
  { name: "Purchase Orders", href: "/purchase-orders", icon: ShoppingCart },
  { name: "Approvals", href: "/approvals", icon: FileCheck },
  { name: "Invoices", href: "/invoices", icon: Receipt },
  { name: "Analytics", href: "/analytics", icon: PieChart },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { isSidebarCollapsed, toggleSidebar } = useAppStore();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Successfully logged out");
      router.push("/login");
    } catch (error: any) {
      toast.error(error.message || "Failed to log out");
    }
  };

  return (
    <div className={cn("h-screen border-r border-border/50 bg-background/50 backdrop-blur-xl flex flex-col fixed left-0 top-0 z-40 hidden lg:flex transition-all duration-300", isSidebarCollapsed ? "w-20" : "w-64")}>
      <div className="h-16 flex items-center justify-between px-4 border-b border-border/50">
        <div className="flex items-center gap-2 font-bold tracking-tight text-lg overflow-hidden whitespace-nowrap">
          <Box className="w-6 h-6 text-primary shrink-0" /> 
          {!isSidebarCollapsed && <span>VendorBridge</span>}
        </div>
        <button 
          onClick={toggleSidebar} 
          className="p-1.5 rounded-md hover:bg-muted text-muted-foreground transition-colors shrink-0"
        >
          {isSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      <div className="p-3 flex-1 overflow-y-auto space-y-1 overflow-x-hidden">
        {!isSidebarCollapsed && <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 mt-4">Platform</p>}
        {isSidebarCollapsed && <div className="h-4"></div>}
        
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          
          return (
            <Link key={item.name} href={item.href} className="block relative group" title={isSidebarCollapsed ? item.name : undefined}>
              {isActive && (
                <motion.div 
                  layoutId="sidebar-active"
                  className="absolute inset-0 bg-primary/10 rounded-md border border-primary/20"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <div className={cn("relative z-10 flex items-center rounded-md text-sm font-medium transition-colors", isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50', isSidebarCollapsed ? "justify-center p-2.5" : "gap-3 px-3 py-2.5")}>
                <item.icon className="w-5 h-5 shrink-0" />
                {!isSidebarCollapsed && <span>{item.name}</span>}
                {!isSidebarCollapsed && item.badge && (
                  <span className="ml-auto bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                    {item.badge}
                  </span>
                )}
                {isSidebarCollapsed && item.badge && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full"></span>
                )}
              </div>
            </Link>
          );
        })}
        
        {!isSidebarCollapsed && <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 mt-8">Configuration</p>}
        <div className={cn("mt-8", isSidebarCollapsed && "mt-4")}>
          <Link href="/settings" className={cn("relative flex items-center rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors", isSidebarCollapsed ? "justify-center p-2.5" : "gap-3 px-3 py-2.5")} title={isSidebarCollapsed ? "Settings" : undefined}>
            <Settings className="w-5 h-5 shrink-0" />
            {!isSidebarCollapsed && <span>Settings</span>}
          </Link>
        </div>
      </div>

      <div className="p-3 border-t border-border/50">
        <div 
          onClick={handleLogout}
          className={cn("flex items-center rounded-md hover:bg-muted/50 transition-colors cursor-pointer group text-muted-foreground hover:text-foreground", isSidebarCollapsed ? "justify-center p-2.5" : "gap-3 px-3 py-2.5")}
          title={isSidebarCollapsed ? "Log Out" : undefined}
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {!isSidebarCollapsed && <span className="text-sm font-medium whitespace-nowrap overflow-hidden">Log Out</span>}
        </div>
      </div>
    </div>
  );
}
