"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  Box, LayoutDashboard, FileText, Users, CheckSquare, 
  CreditCard, PieChart, Settings, Bell, Search, LogOut
} from "lucide-react";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/components/auth/AuthProvider";
import { toast } from "sonner";

const navItems = [
  { name: "Command Center", href: "/dashboard", icon: LayoutDashboard },
  { name: "RFQ Management", href: "/rfqs", icon: FileText },
  { name: "Vendor Directory", href: "/vendors", icon: Users },
  { name: "Approvals", href: "/approvals", icon: CheckSquare, badge: "3" },
  { name: "Invoices", href: "/invoices", icon: CreditCard },
  { name: "Analytics", href: "/analytics", icon: PieChart },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, role } = useAuth();

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
    <div className="w-64 h-screen border-r border-border/50 bg-background/50 backdrop-blur-xl flex flex-col fixed left-0 top-0 z-40 hidden lg:flex">
      <div className="h-16 flex items-center px-6 border-b border-border/50">
        <div className="flex items-center gap-2 font-bold tracking-tight text-lg">
          <Box className="w-5 h-5 text-primary" /> VendorBridge
        </div>
      </div>

      <div className="p-4 flex-1 overflow-y-auto space-y-1">
        <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 mt-4">Platform</p>
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          
          return (
            <Link key={item.name} href={item.href} className="block relative">
              {isActive && (
                <motion.div 
                  layoutId="sidebar-active"
                  className="absolute inset-0 bg-primary/10 rounded-md border border-primary/20"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <div className={`relative z-10 flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'}`}>
                <item.icon className="w-4 h-4" />
                <span>{item.name}</span>
                {item.badge && (
                  <span className="ml-auto bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                    {item.badge}
                  </span>
                )}
              </div>
            </Link>
          );
        })}
        
        <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 mt-8">Configuration</p>
        <Link href="/settings" className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">
          <Settings className="w-4 h-4" />
          <span>Settings</span>
        </Link>
      </div>

      <div className="p-4 border-t border-border/50">
        <div 
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted/50 transition-colors cursor-pointer group"
        >
          <Avatar className="w-8 h-8 border border-border">
            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`} />
            <AvatarFallback>{user?.email?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col overflow-hidden">
            <span className="text-sm font-medium leading-none truncate">{user?.email || "User"}</span>
            <span className="text-xs text-muted-foreground mt-1 uppercase">{role || "User"}</span>
          </div>
          <LogOut className="w-4 h-4 ml-auto flex-shrink-0 text-muted-foreground group-hover:text-foreground" />
        </div>
      </div>
    </div>
  );
}
