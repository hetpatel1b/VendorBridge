"use client";

import { motion } from "framer-motion";
import { 
  Package, FileCheck, Truck, Receipt, 
  MoreHorizontal, Download, Eye
} from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

// Stages of a PO
const STAGES = ["Sent", "Acknowledged", "Shipped", "Delivered", "Invoiced"];

export function PoList() {
  const [pos, setPos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPos() {
      try {
        const { data, error } = await supabase.from("purchase_orders").select("*");
        if (error) {
          console.error("Error fetching purchase orders:", error.message);
        } else if (data) {
          setPos(data);
        }
      } catch (err) {
        console.error("Failed to fetch purchase orders:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchPos();
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground">Loading Purchase Orders...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <Input placeholder="Search Purchase Orders..." className="max-w-sm h-10 glass-panel" />
        <Button variant="outline" className="glass-card">Export CSV</Button>
      </div>

      <div className="space-y-4">
        {pos.map((po, index) => (
          <motion.div
            key={po.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="p-6 glass-card overflow-hidden group">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                
                {/* PO Header Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold font-mono tracking-tight">{po.id}</h3>
                    <Badge variant="secondary" className="bg-primary/10 text-primary">
                      {STAGES[po.currentStage - 1]}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground flex items-center gap-4">
                    <span>{po.vendor}</span>
                    <span className="w-1 h-1 rounded-full bg-border"></span>
                    <span>{format(po.date, "MMM d, yyyy")}</span>
                    <span className="w-1 h-1 rounded-full bg-border"></span>
                    <span>{po.items} Items</span>
                  </div>
                  <div className="mt-4 text-xl font-medium">
                    ${po.amount.toLocaleString()}
                  </div>
                </div>

                {/* Progress Tracker */}
                <div className="flex-1 w-full max-w-md">
                  <div className="flex justify-between mb-2">
                    {STAGES.map((stage, i) => {
                      const isCompleted = i < po.currentStage;
                      const isActive = i === po.currentStage - 1;
                      return (
                        <div key={stage} className={`text-[10px] font-medium uppercase tracking-wider ${isActive ? 'text-primary' : isCompleted ? 'text-foreground' : 'text-muted-foreground/50'}`}>
                          {stage}
                        </div>
                      );
                    })}
                  </div>
                  <div className="relative h-2 bg-muted/50 rounded-full overflow-hidden">
                    <motion.div 
                      className="absolute top-0 left-0 h-full bg-primary rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${((po.currentStage - 0.5) / STAGES.length) * 100}%` }}
                      transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" className="h-9 w-9 hidden md:flex">
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="icon" className="h-9 w-9 hidden md:flex">
                    <Eye className="w-4 h-4" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-9 w-9">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="glass-panel">
                      <DropdownMenuItem><Eye className="w-4 h-4 mr-2" /> View Details</DropdownMenuItem>
                      <DropdownMenuItem><Download className="w-4 h-4 mr-2" /> Download PDF</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-500">Cancel PO</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
