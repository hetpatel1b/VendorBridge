"use client";

import { motion } from "framer-motion";
import { FileText, CheckCircle, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";

const activities = [
  { id: 1, type: "rfq", title: "RFQ-1042 Quoted", time: "Just now", vendor: "Apex Systems Inc.", icon: FileText, color: "text-blue-500" },
  { id: 2, type: "po", title: "PO-404 Approved", time: "5m ago", vendor: "Global Hardware Co.", icon: CheckCircle, color: "text-green-500" },
  { id: 3, type: "rfq", title: "RFQ-1045 Created", time: "1hr ago", vendor: "Internal", icon: Clock, color: "text-purple-500" },
];

export function ActivityFeedList() {
  return (
    <Card className="p-6 glass-card h-full">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold tracking-tight">Live Activity</h3>
        <span className="flex items-center text-xs font-medium text-green-500 bg-green-500/10 px-2 py-1 rounded-full">
          <span className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse" /> Live
        </span>
      </div>

      <div className="space-y-6">
        {activities.map((activity, i) => (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 + 0.5 }}
            className="flex gap-4 relative"
          >
            {i !== activities.length - 1 && (
              <div className="absolute left-4 top-10 bottom-[-24px] w-px bg-border" />
            )}
            <div className={`w-8 h-8 rounded-full bg-background border border-border flex items-center justify-center flex-shrink-0 z-10 ${activity.color}`}>
              <activity.icon className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-medium">{activity.title}</p>
              <p className="text-xs text-muted-foreground mt-1">{activity.vendor} · {activity.time}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </Card>
  );
}
