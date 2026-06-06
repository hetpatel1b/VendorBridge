"use client";

import { motion } from "framer-motion";
import { Sparkles, TrendingDown, Clock, ShieldCheck } from "lucide-react";

export function AiCopilotPanel() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.5 }}
      className="glass-panel rounded-xl p-5 mb-8 flex flex-col md:flex-row items-start md:items-center gap-4 relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
      
      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary relative z-10 border border-primary/30">
        <Sparkles className="w-6 h-6" />
      </div>
      
      <div className="flex-grow relative z-10">
        <h4 className="text-lg font-semibold premium-gradient-text">Copilot Recommendation</h4>
        <p className="text-muted-foreground mt-1 text-sm">
          <strong className="text-foreground">Apex Systems Inc.</strong> is the optimal choice. They offer the lowest total price, fastest delivery time, and carry an impeccable compliance record.
        </p>
      </div>

      <div className="flex gap-3 relative z-10 flex-wrap">
        <div className="bg-background/50 border border-white/5 rounded-lg px-3 py-2 flex items-center gap-2 backdrop-blur-md">
          <TrendingDown className="w-4 h-4 text-green-500" />
          <span className="text-sm font-medium text-green-500">-6% vs Avg</span>
        </div>
        <div className="bg-background/50 border border-white/5 rounded-lg px-3 py-2 flex items-center gap-2 backdrop-blur-md">
          <Clock className="w-4 h-4 text-blue-500" />
          <span className="text-sm font-medium text-blue-500">7 Days Faster</span>
        </div>
        <div className="bg-background/50 border border-white/5 rounded-lg px-3 py-2 flex items-center gap-2 backdrop-blur-md hidden lg:flex">
          <ShieldCheck className="w-4 h-4 text-purple-500" />
          <span className="text-sm font-medium text-purple-500">Zero Risk</span>
        </div>
      </div>
    </motion.div>
  );
}
