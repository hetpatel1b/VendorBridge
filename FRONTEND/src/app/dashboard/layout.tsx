import { Sidebar } from "@/components/layout/Sidebar";
import { Bell, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="lg:pl-64 flex flex-col min-h-screen">
        <header className="h-16 border-b border-border/50 bg-background/50 backdrop-blur-xl flex items-center justify-between px-6 sticky top-0 z-30">
          <div className="flex-1 max-w-md">
            <button className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 hover:bg-muted px-4 py-2 rounded-full border border-border/50 w-full transition-colors transition-all focus:outline-none focus:ring-2 focus:ring-primary/50">
              <Search className="w-4 h-4" />
              <span>Search RFQs, Vendors, POs...</span>
              <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                <span className="text-xs">⌘</span>K
              </kbd>
            </button>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="relative rounded-full">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-2 w-2 h-2 bg-red-500 rounded-full border border-background"></span>
            </Button>
          </div>
        </header>
        <main className="flex-1 relative z-10">{children}</main>
      </div>
    </div>
  );
}
