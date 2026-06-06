"use client";

import { motion } from "framer-motion";
import { 
  Area, AreaChart, Bar, BarChart, ComposedChart, Line, CartesianGrid, 
  ResponsiveContainer, Tooltip, XAxis, YAxis, ReferenceLine 
} from "recharts";
import { PieChart, Activity, TrendingDown, Eye } from "lucide-react";

import { Card } from "@/components/ui/card";

// Added projected data for H2 and a budget ceiling
const spendData = [
  { month: "Jan", actual: 120000, projected: null },
  { month: "Feb", actual: 180000, projected: null },
  { month: "Mar", actual: 150000, projected: null },
  { month: "Apr", actual: 220000, projected: null },
  { month: "May", actual: 190000, projected: null },
  { month: "Jun", actual: 280000, projected: 280000 }, // Connection point
  { month: "Jul", actual: null, projected: 310000 },
  { month: "Aug", actual: null, projected: 305000 },
  { month: "Sep", actual: null, projected: 350000 },
  { month: "Oct", actual: null, projected: 410000 }, // Breach point!
  { month: "Nov", actual: null, projected: 390000 },
  { month: "Dec", actual: null, projected: 450000 },
];

const BUDGET_CEILING = 400000;

const categoryData = [
  { category: "Hardware", amount: 450000 },
  { category: "Software", amount: 320000 },
  { category: "Services", amount: 180000 },
  { category: "Facilities", amount: 90000 },
];

export function SpendAnalytics() {
  return (
    <div className="space-y-6">
      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6 glass-card">
          <div className="flex items-center gap-2 text-muted-foreground mb-4">
            <PieChart className="w-4 h-4" /> YTD Spend
          </div>
          <h2 className="text-3xl font-bold tracking-tight">$1.14M</h2>
          <p className="text-sm text-green-500 mt-2 flex items-center gap-1">
            <TrendingDown className="w-4 h-4" /> 8% below budget
          </p>
        </Card>
        <Card className="p-6 glass-card border-red-500/30 bg-red-500/5">
          <div className="flex items-center gap-2 text-red-500 mb-4 font-semibold">
            <Eye className="w-4 h-4" /> Predictive Alert
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-red-500">October</h2>
          <p className="text-sm text-red-500 mt-2">Budget breach predicted</p>
        </Card>
        <Card className="p-6 glass-card">
          <div className="flex items-center gap-2 text-muted-foreground mb-4">
            <Activity className="w-4 h-4" /> Active Vendors
          </div>
          <h2 className="text-3xl font-bold tracking-tight">42</h2>
          <p className="text-sm text-muted-foreground mt-2">Across 8 categories</p>
        </Card>
        <Card className="p-6 glass-card">
          <div className="flex items-center gap-2 text-muted-foreground mb-4">
            <Activity className="w-4 h-4" /> Cost Savings
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-green-500">$84.5k</h2>
          <p className="text-sm text-muted-foreground mt-2">Via AI Negotiation</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Predictive Trend Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-2">
          <Card className="p-6 glass-card h-[400px] flex flex-col relative overflow-hidden">
            <div className="absolute top-0 right-0 px-4 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-bl-lg">Powered by AI Forecasting</div>
            <h3 className="font-semibold mb-6">Predictive Spend Trajectory (FY 2026)</h3>
            <div className="flex-1 w-full min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={spendData} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="oklch(0.7 0.15 250)" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="oklch(0.7 0.15 250)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="oklch(1 0 0 / 0.1)" />
                  <XAxis dataKey="month" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis 
                    stroke="#888888" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                    tickFormatter={(value) => `$${value / 1000}k`}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'oklch(0.18 0.01 260)', borderColor: 'oklch(1 0 0 / 0.1)', borderRadius: '8px' }}
                    formatter={(value: any) => `$${(value / 1000).toFixed(1)}k`}
                  />
                  
                  {/* Budget Ceiling */}
                  <ReferenceLine 
                    y={BUDGET_CEILING} 
                    stroke="oklch(0.6 0.2 25)" // Red
                    strokeWidth={2} 
                    strokeDasharray="4 4" 
                    label={{ position: 'insideTopLeft', value: 'Monthly Budget Ceiling', fill: 'oklch(0.6 0.2 25)', fontSize: 12, dy: -10 }} 
                  />

                  {/* Actual Spend Area */}
                  <Area type="monotone" dataKey="actual" stroke="oklch(0.7 0.15 250)" strokeWidth={3} fillOpacity={1} fill="url(#colorActual)" />
                  
                  {/* Projected Spend Line */}
                  <Line type="monotone" dataKey="projected" stroke="oklch(0.7 0.15 250)" strokeWidth={3} strokeDasharray="5 5" dot={false} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
