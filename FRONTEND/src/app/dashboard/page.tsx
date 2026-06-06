import { AnimatedKpiCard } from "@/features/dashboard/components/AnimatedKpiCard";
import { ActivityFeedList } from "@/features/dashboard/components/ActivityFeedList";
import { Sparkles, ArrowRight } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import Link from "next/link";

export default function DashboardPage() {
  return (
    <div className="min-h-screen p-6 lg:p-12 animate-in-fade max-w-7xl mx-auto">
      <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Command Center</h1>
          <p className="text-muted-foreground mt-1">Good Morning, Alex. You have 3 urgent items needing attention.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="glass-card">Export Report</Button>
          <Link href="/rfqs/1042/compare" className={buttonVariants()}>
            Review Quotes <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </div>
      </header>

      <main className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <AnimatedKpiCard title="Total Spend" prefix="$" value={2400000} trend={-12.5} trendLabel="vs last quarter" delay={0.1} />
          <AnimatedKpiCard title="Active RFQs" value={14} trend={18.2} trendLabel="vs last month" delay={0.2} />
          <AnimatedKpiCard title="Vendor Health" value={94} suffix="%" trend={2.1} trendLabel="avg score" delay={0.3} />
          <AnimatedKpiCard title="Pending Approvals" value={7} trend={-5.0} trendLabel="vs last week" delay={0.4} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 glass-panel rounded-xl p-8 relative overflow-hidden flex flex-col justify-center min-h-[300px]">
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="relative z-10 max-w-lg">
              <div className="flex items-center gap-2 text-primary font-medium mb-4">
                <Sparkles className="w-5 h-5" />
                <span>AI Procurement Intelligence</span>
              </div>
              <h2 className="text-2xl font-semibold mb-4 leading-tight">
                "Vendor A is 12% cheaper on the laptop fleet, but Vendor B has a flawless delivery record. Recommend selecting Vendor B to mitigate risk on this critical timeline."
              </h2>
              <Link href="/rfqs/1042/compare" className={buttonVariants({ variant: "secondary", className: "bg-primary/20 hover:bg-primary/30 text-primary border-none" })}>
                 View Detailed Comparison
              </Link>
            </div>
          </div>
          
          <div className="lg:col-span-1">
            <ActivityFeedList />
          </div>
        </div>
      </main>
    </div>
  );
}
