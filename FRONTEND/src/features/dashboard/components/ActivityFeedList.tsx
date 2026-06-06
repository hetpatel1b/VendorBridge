"use client";

import { motion } from "framer-motion";
import { UserPlus, Package, AlertTriangle, CreditCard } from "lucide-react";
import { Card } from "@/components/ui/card";

const activities = [
  { id: 1, type: "vendor", title: "New Vendor Registration", time: "10m ago", details: "Acme Corp completed onboarding", icon: UserPlus, color: "text-blue-500", bg: "bg-blue-500/10" },
  { id: 2, type: "order", title: "Order #8902 Shipped", time: "1h ago", details: "Global Hardware Co. dispatched items", icon: Package, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  { id: 3, type: "inventory", title: "Low Inventory Alert", time: "2h ago", details: "SKU-4029 stock below threshold", icon: AlertTriangle, color: "text-amber-500", bg: "bg-amber-500/10" },
  { id: 4, type: "payment", title: "Payment Processed", time: "4h ago", details: "$12,450 paid to Initech", icon: CreditCard, color: "text-purple-500", bg: "bg-purple-500/10" },
];

export function ActivityFeedList() {
  return (
    <div className="border border-border/50 bg-background/50 backdrop-blur-xl rounded-xl p-6 shadow-sm h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold tracking-tight">Recent Activity</h3>
        <span className="flex items-center text-xs font-medium text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full">
          <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse" /> Live
        </span>
      </div>

      <div className="space-y-6 flex-1">
        {activities.map((activity, i) => (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 + 0.2 }}
            className="flex gap-4 relative"
          >
            {i !== activities.length - 1 && (
              <div className="absolute left-4 top-10 bottom-[-24px] w-px bg-border/50" />
            )}
            <div className={`w-8 h-8 rounded-full border border-border/50 flex items-center justify-center flex-shrink-0 z-10 ${activity.bg} ${activity.color}`}>
              <activity.icon className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-medium">{activity.title}</p>
              <p className="text-xs text-muted-foreground mt-1">{activity.details} · {activity.time}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
