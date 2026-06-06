"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useEffect, useState } from "react";

interface KpiCardProps {
  title: string;
  value: number;
  prefix?: string;
  suffix?: string;
  trend: number;
  trendLabel: string;
  delay?: number;
}

export function AnimatedKpiCard({ title, value, prefix = "", suffix = "", trend, trendLabel, delay = 0 }: KpiCardProps) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let startTime: number;
    const duration = 1500;
    
    const animateValue = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const percentage = Math.min(progress / duration, 1);
      
      // Easing function for smoother counter (easeOutQuart)
      const easeOut = 1 - Math.pow(1 - percentage, 4);
      
      setDisplayValue(value * easeOut);
      
      if (progress < duration) {
        requestAnimationFrame(animateValue);
      } else {
        setDisplayValue(value);
      }
    };
    
    const timeout = setTimeout(() => {
      requestAnimationFrame(animateValue);
    }, delay * 1000);
    
    return () => clearTimeout(timeout);
  }, [value, delay]);

  const formattedValue = value >= 1000000 
    ? (displayValue / 1000000).toFixed(2) + "M" 
    : value >= 1000 
      ? (displayValue / 1000).toFixed(1) + "k"
      : Math.floor(displayValue).toString();

  const isPositive = trend > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
    >
      <Card className="p-6 glass-card relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          {isPositive ? <ArrowUpRight className="w-24 h-24 -mr-8 -mt-8" /> : <ArrowDownRight className="w-24 h-24 -mr-8 -mt-8" />}
        </div>
        
        <p className="text-sm font-medium text-muted-foreground mb-4">{title}</p>
        
        <div className="flex items-baseline gap-2 mb-4">
          <h2 className="text-4xl font-bold tracking-tight premium-gradient-text">
            {prefix}{formattedValue}{suffix}
          </h2>
        </div>
        
        <div className="flex items-center gap-2">
          <div className={`flex items-center text-xs font-semibold px-2 py-1 rounded-full ${isPositive ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
            {isPositive ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
            {Math.abs(trend)}%
          </div>
          <span className="text-xs text-muted-foreground">{trendLabel}</span>
        </div>
      </Card>
    </motion.div>
  );
}
