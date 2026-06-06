"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, ShieldAlert, TrendingDown, TrendingUp, Clock, FileText, Keyboard } from "lucide-react";
import { toast } from "sonner";
import useSound from "use-sound";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const initialApprovals = [
  { id: "APR-8492", type: "Purchase Order", title: "MacBook Pro Fleet Upgrade", requester: "Sarah Jenkins", department: "Engineering", amount: 39500, vendor: "Apex Systems Inc.", budgetImpact: -2.4, riskScore: "Low", timeWaiting: "2 hours" },
  { id: "APR-8493", type: "Invoice", title: "Q3 Cloud Infrastructure", requester: "David Chen", department: "DevOps", amount: 145000, vendor: "AWS", budgetImpact: 12.5, riskScore: "High", timeWaiting: "1 day" },
  { id: "APR-8494", type: "Vendor Onboarding", title: "CyberDefend LLC", requester: "Security Team", department: "IT", amount: 0, vendor: "CyberDefend LLC", budgetImpact: 0, riskScore: "Low", timeWaiting: "4 hours" }
];

export function ApprovalQueue() {
  const [approvals, setApprovals] = useState(initialApprovals);
  const [focusedIndex, setFocusedIndex] = useState(0);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      switch (e.key.toLowerCase()) {
        case "j":
          setFocusedIndex((prev) => Math.min(prev + 1, approvals.length - 1));
          break;
        case "k":
          setFocusedIndex((prev) => Math.max(prev - 1, 0));
          break;
        case "a":
          if (approvals.length > 0) handleAction(approvals[focusedIndex].id, "approve");
          break;
        case "r":
          if (approvals.length > 0) handleAction(approvals[focusedIndex].id, "reject");
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [focusedIndex, approvals]);

  const handleAction = (id: string, action: "approve" | "reject") => {
    const approval = approvals.find((a) => a.id === id);
    if (!approval) return;

    // Trigger visual/sound feedback and remove
    toast(action === "approve" ? "Approved" : "Rejected", {
      description: `${approval.title} has been ${action === "approve" ? "approved" : "rejected"}.`,
      action: {
        label: "Undo",
        onClick: () => {
          setApprovals((prev) => [approval, ...prev]);
          toast.success("Action undone");
        }
      }
    });

    setApprovals((prev) => prev.filter((a) => a.id !== id));
    
    // Adjust focus if necessary
    setFocusedIndex((prev) => (prev >= approvals.length - 1 ? Math.max(0, approvals.length - 2) : prev));
  };

  return (
    <div className="space-y-6">
      {/* Keyboard Shortcuts Hint */}
      <div className="flex items-center justify-between bg-muted/30 border border-border/50 p-3 rounded-lg text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <Keyboard className="w-4 h-4" />
          <span>Vim-style navigation enabled</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1"><kbd className="bg-background border rounded px-1.5 py-0.5 font-mono text-[10px]">j</kbd> / <kbd className="bg-background border rounded px-1.5 py-0.5 font-mono text-[10px]">k</kbd> navigate</span>
          <span className="flex items-center gap-1"><kbd className="bg-background border rounded px-1.5 py-0.5 font-mono text-[10px]">a</kbd> approve</span>
          <span className="flex items-center gap-1"><kbd className="bg-background border rounded px-1.5 py-0.5 font-mono text-[10px]">r</kbd> reject</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <AnimatePresence>
          {approvals.map((approval, i) => {
            const isFocused = i === focusedIndex;
            
            return (
              <motion.div
                key={approval.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100, transition: { duration: 0.2 } }}
                className="relative"
              >
                {/* Focus indicator ring */}
                {isFocused && (
                  <motion.div 
                    layoutId="focus-ring"
                    className="absolute -inset-2 border-2 border-primary/50 rounded-xl z-0"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                
                <Card className={`p-6 glass-card relative overflow-hidden group z-10 transition-colors ${isFocused ? 'bg-background/80 border-primary/30' : ''}`}>
                  {approval.budgetImpact > 0 && (
                    <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                  )}
                  
                  <div className="flex flex-col lg:flex-row gap-8">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="bg-background text-muted-foreground border-border/50">
                          {approval.type}
                        </Badge>
                        <span className="text-sm font-mono text-muted-foreground">{approval.id}</span>
                      </div>
                      
                      <h3 className="text-xl font-bold tracking-tight mb-4">{approval.title}</h3>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground mb-1">Requester</p>
                          <p className="font-medium">{approval.requester}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground mb-1">Vendor</p>
                          <p className="font-medium">{approval.vendor}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex-1 bg-background/50 rounded-xl p-5 border border-border/50 relative">
                      <div className="absolute -top-3 left-4 bg-background px-2 text-xs font-semibold text-primary uppercase tracking-wider flex items-center gap-1">
                        <FileText className="w-3 h-3" /> Context Engine
                      </div>
                      
                      <div className="mb-4">
                        <p className="text-3xl font-bold tracking-tighter">${approval.amount.toLocaleString()}</p>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-2 rounded bg-background border border-border/30">
                          <span className="text-sm text-muted-foreground">Budget Impact</span>
                          <span className={`text-sm font-medium flex items-center gap-1 ${approval.budgetImpact > 0 ? 'text-red-500' : 'text-green-500'}`}>
                            {approval.budgetImpact > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                            {Math.abs(approval.budgetImpact)}% {approval.budgetImpact > 0 ? 'Over' : 'Under'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-row lg:flex-col justify-center gap-3 min-w-[140px]">
                      <Button 
                        onClick={() => handleAction(approval.id, "approve")}
                        className={`w-full h-12 shadow-lg font-semibold transition-all ${isFocused ? 'shadow-green-500/20 bg-green-500 hover:bg-green-600 text-white' : 'bg-green-500/80 text-white hover:bg-green-500'}`}
                      >
                        <Check className="w-5 h-5 mr-2" /> Approve
                      </Button>
                      <Button 
                        onClick={() => handleAction(approval.id, "reject")}
                        variant="outline" 
                        className={`w-full h-12 transition-all ${isFocused ? 'border-red-500/50 text-red-500 hover:bg-red-500/10' : 'border-red-500/30 text-red-500/80'}`}
                      >
                        <X className="w-5 h-5 mr-2" /> Reject
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
        
        {approvals.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-24 text-muted-foreground">
            <Check className="w-12 h-12 mx-auto mb-4 text-green-500/50" />
            <h3 className="text-xl font-medium text-foreground">All caught up!</h3>
            <p>Your approval queue is empty.</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
