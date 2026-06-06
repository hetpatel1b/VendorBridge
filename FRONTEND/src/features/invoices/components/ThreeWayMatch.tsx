"use client";

import { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Check, X, FileText, PackageCheck, Receipt, AlertTriangle } from "lucide-react";
import Xarrow from "react-xarrows";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function ThreeWayMatch() {
  // Hack to ensure Xarrows render correctly after initial layout
  const [isClient, setIsClient] = useState(false);
  useEffect(() => { setIsClient(true); }, []);

  return (
    <div className="space-y-6 relative" id="three-way-container">
      {/* Overview Card */}
      <Card className="glass-card p-6 border-red-500/30 relative overflow-hidden z-10">
        <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-2xl font-bold tracking-tight">INV-9924</h2>
              <Badge variant="outline" className="text-red-500 border-red-500/30 bg-red-500/10">
                <AlertTriangle className="w-3 h-3 mr-1" /> Discrepancy Found
              </Badge>
            </div>
            <p className="text-muted-foreground text-sm">Vendor: Apex Systems Inc. · Expected Match: $39,500</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="border-red-500/30 text-red-500 hover:bg-red-500/10 shadow-lg shadow-red-500/10">Dispute Invoice</Button>
            <Button className="bg-primary/20 text-primary hover:bg-primary/30 border-none shadow-lg shadow-primary/10">Override & Approve</Button>
          </div>
        </div>
      </Card>

      {/* 3-Way Match Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 relative z-10">
        
        {/* PO Column */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="p-6 glass-card h-full relative">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border/50">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 text-blue-500 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold">Purchase Order</h3>
                <p className="text-xs text-muted-foreground">PO-2026-001</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <span className="text-sm text-muted-foreground">Quantity</span>
                <span id="po-qty" className="font-medium text-lg px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-500">15 Units</span>
              </div>
              <div className="flex justify-between items-end">
                <span className="text-sm text-muted-foreground">Unit Price</span>
                <span className="font-medium">$2,633.33</span>
              </div>
              <div className="flex justify-between items-end pt-4 border-t border-border/50">
                <span className="text-sm font-semibold">Total</span>
                <span className="font-bold text-xl">$39,500.00</span>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Goods Receipt Column */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="p-6 glass-card h-full relative border-red-500/30">
            <div className="absolute top-0 right-0 px-2 py-0.5 bg-red-500/10 text-red-500 text-[10px] font-bold uppercase rounded-bl-lg">Mismatch</div>
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border/50">
              <div className="w-10 h-10 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center">
                <PackageCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold">Goods Receipt</h3>
                <p className="text-xs text-muted-foreground">GRN-8821</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <span className="text-sm text-muted-foreground">Quantity Received</span>
                <span id="gr-qty" className="font-medium text-lg text-red-500 flex items-center gap-1 bg-red-500/10 px-2 py-0.5 rounded-md border border-red-500/20">
                  <X className="w-4 h-4" /> 14 Units
                </span>
              </div>
              <div className="flex justify-between items-end">
                <span className="text-sm text-muted-foreground">Condition</span>
                <span className="font-medium text-green-500 flex items-center gap-1">
                  <Check className="w-4 h-4" /> Good
                </span>
              </div>
              <div className="flex justify-between items-end pt-4 border-t border-border/50">
                <span className="text-sm font-semibold">Accepted Total</span>
                <span className="font-bold text-xl text-red-500">$36,866.62</span>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Invoice Column */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="p-6 glass-card h-full border-red-500/30 relative">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border/50">
              <div className="w-10 h-10 rounded-full bg-purple-500/20 text-purple-500 flex items-center justify-center">
                <Receipt className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold">Vendor Invoice</h3>
                <p className="text-xs text-muted-foreground">INV-9924</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <span className="text-sm text-muted-foreground">Billed Quantity</span>
                <span id="inv-qty" className="font-medium text-lg text-red-500 flex items-center gap-1 bg-red-500/10 px-2 py-0.5 rounded-md border border-red-500/20">
                  <X className="w-4 h-4" /> 15 Units
                </span>
              </div>
              <div className="flex justify-between items-end">
                <span className="text-sm text-muted-foreground">Unit Price</span>
                <span className="font-medium text-green-500 flex items-center gap-1">
                  <Check className="w-4 h-4" /> $2,633.33
                </span>
              </div>
              <div className="flex justify-between items-end pt-4 border-t border-border/50">
                <span className="text-sm font-semibold">Billed Total</span>
                <span className="font-bold text-xl text-red-500">$39,500.00</span>
              </div>
            </div>
          </Card>
        </motion.div>

      </div>

      {/* Visual SVG Wiring (Rendered after DOM nodes exist) */}
      {isClient && (
        <div className="absolute inset-0 pointer-events-none z-0 hidden md:block">
          <Xarrow
            start="po-qty"
            end="gr-qty"
            color="oklch(0.6 0.2 25)" // red
            strokeWidth={2}
            path="smooth"
            dashness={{ animation: true, strokeLen: 10, nonStrokeLen: 5 }}
            headSize={4}
            startAnchor="right"
            endAnchor="left"
          />
          <Xarrow
            start="gr-qty"
            end="inv-qty"
            color="oklch(0.6 0.2 25)" // red
            strokeWidth={2}
            path="smooth"
            dashness={{ animation: true, strokeLen: 10, nonStrokeLen: 5 }}
            headSize={4}
            startAnchor="right"
            endAnchor="left"
          />
        </div>
      )}
    </div>
  );
}
