"use client";

import { KpiCard } from "@/features/dashboard/components/KpiCard";
import { AnalyticsCharts } from "@/features/dashboard/components/AnalyticsCharts";
import { VendorTable } from "@/features/dashboard/components/VendorTable";
import { ActivityFeedList } from "@/features/dashboard/components/ActivityFeedList";
import { Building2, Users, ShoppingCart, DollarSign, Package, Star, Download, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  // Mock data for sparklines
  const generateSparkline = (base: number, volatility: number = 0.2) => 
    Array.from({ length: 14 }).map((_, i) => ({ value: base * (1 + (Math.random() - 0.5) * volatility) + (i * base * 0.05) }));

  return (
    <div className="p-6 lg:p-8 animate-in-fade w-full mx-auto max-w-[1600px]">
      <header className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Here's what's happening with your vendors today.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2 bg-background/50 backdrop-blur-xl">
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export</span>
          </Button>
          <Button className="gap-2 shadow-sm">
            <Plus className="w-4 h-4" />
            New Report
          </Button>
        </div>
      </header>

      <main className="space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          <KpiCard 
            title="Total Vendors" 
            value="1,248" 
            icon={Building2} 
            trend={12.5} 
            data={generateSparkline(1000)} 
            delay={0.1}
          />
          <KpiCard 
            title="Active Vendors" 
            value="892" 
            icon={Users} 
            trend={5.2} 
            data={generateSparkline(800)} 
            delay={0.2}
          />
          <KpiCard 
            title="Orders This Month" 
            value="4,209" 
            icon={ShoppingCart} 
            trend={-2.4} 
            data={generateSparkline(4000, 0.4)} 
            delay={0.3}
          />
          <KpiCard 
            title="Revenue" 
            value="$2.4M" 
            icon={DollarSign} 
            trend={18.2} 
            data={generateSparkline(2000000)} 
            delay={0.4}
          />
          <KpiCard 
            title="Inventory Health" 
            value="94%" 
            icon={Package} 
            trend={1.1} 
            data={generateSparkline(90, 0.1)} 
            delay={0.5}
          />
          <KpiCard 
            title="Vendor Satisfaction" 
            value="4.8/5" 
            icon={Star} 
            trend={4.5} 
            data={generateSparkline(4.5, 0.05)} 
            delay={0.6}
          />
        </div>

        {/* Analytics Section */}
        <AnalyticsCharts />

        {/* Table and Activity Section */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2">
            <VendorTable />
          </div>
          <div className="xl:col-span-1">
            <ActivityFeedList />
          </div>
        </div>
      </main>
    </div>
  );
}
