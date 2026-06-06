"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, LucideIcon } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area } from "recharts";

interface KpiCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend: number;
  trendLabel?: string;
  data: { value: number }[];
  delay?: number;
}

export function KpiCard({ title, value, icon: Icon, trend, trendLabel, data, delay = 0 }: KpiCardProps) {
  const isPositive = trend >= 0;
  const trendColor = isPositive ? "text-emerald-500" : "text-rose-500";
  const trendBg = isPositive ? "bg-emerald-500/10" : "bg-rose-500/10";
  const chartColor = isPositive ? "#10b981" : "#f43f5e";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="relative overflow-hidden rounded-xl border border-border/50 bg-background/50 backdrop-blur-xl p-5 shadow-sm transition-all hover:shadow-md hover:-translate-y-1 group"
    >
      <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full bg-primary/5 blur-2xl group-hover:bg-primary/10 transition-colors" />
      
      <div className="flex items-center justify-between mb-4 relative z-10">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        <div className="p-2 rounded-md bg-muted/50 text-muted-foreground group-hover:text-primary transition-colors">
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="flex items-end justify-between relative z-10">
        <div>
          <div className="text-3xl font-bold tracking-tight mb-1">{value}</div>
          <div className="flex items-center gap-1.5 mt-1">
            <span className={`flex items-center text-xs font-medium px-1.5 py-0.5 rounded-sm ${trendBg} ${trendColor}`}>
              {isPositive ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
              {Math.abs(trend)}%
            </span>
            {trendLabel && <span className="text-xs text-muted-foreground">{trendLabel}</span>}
          </div>
        </div>
        
        <div className="w-24 h-12">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id={`gradient-${title.replace(/\s+/g, '')}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={chartColor} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={chartColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke={chartColor} 
                strokeWidth={2}
                fillOpacity={1} 
                fill={`url(#gradient-${title.replace(/\s+/g, '')})`} 
                isAnimationActive={true}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  );
}
