"use client";

import { motion } from "framer-motion";
import { 
  FileText, MoreHorizontal, ArrowUpRight, 
  Clock, CheckCircle, AlertCircle, Plus 
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

const statusConfig = {
  draft: { color: "bg-muted text-muted-foreground", icon: FileText, label: "Draft" },
  open: { color: "bg-blue-500/10 text-blue-500", icon: Clock, label: "Open" },
  evaluation: { color: "bg-yellow-500/10 text-yellow-500", icon: AlertCircle, label: "Evaluation" },
  awarded: { color: "bg-green-500/10 text-green-500", icon: CheckCircle, label: "Awarded" },
  closed: { color: "bg-red-500/10 text-red-500", icon: CheckCircle, label: "Closed" },
};

export function RfqListTable() {
  const [rfqs, setRfqs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRfqs() {
      try {
        const { data, error } = await supabase.from("rfqs").select("*");
        if (error) {
          console.error("Error fetching rfqs:", error.message);
        } else if (data) {
          const mappedRfqs = data.map((item: any) => ({
            id: item.rfq_number || item.id,
            title: item.title,
            department: item.category || "General",
            status: (item.status || "draft").toLowerCase(),
            budget: item.budget_estimate || 0,
            deadline: item.submission_deadline ? new Date(item.submission_deadline) : new Date(),
            quotes: item.quotes_count || 0,
            rawId: item.id
          }));
          setRfqs(mappedRfqs);
        }
      } catch (err) {
        console.error("Failed to fetch rfqs:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchRfqs();
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground">Loading RFQs...</div>;
  }
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 max-w-sm w-full">
          <Input placeholder="Search RFQs..." className="h-10 glass-panel" />
        </div>
        <Button render={<Link href="/rfqs/new" />} nativeButton={false} className="shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-300">
            <Plus className="w-4 h-4 mr-2" /> Create RFQ
        </Button>
      </div>

      <div className="rounded-xl border border-border/50 glass-card overflow-hidden relative">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow className="hover:bg-transparent border-border/50">
              <TableHead className="w-[120px]">RFQ ID</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Budget</TableHead>
              <TableHead className="text-right">Deadline</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rfqs.map((rfq, i) => {
              const config = statusConfig[rfq.status as keyof typeof statusConfig] || statusConfig.draft;
              const StatusIcon = config.icon;
              return (
                <TableRow 
                  key={rfq.rawId || rfq.id} 
                  className="group hover:bg-muted/30 cursor-pointer transition-colors border-border/50"
                >
                  <TableCell className="font-mono font-medium">{rfq.id}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium text-foreground">{rfq.title}</span>
                      <span className="text-xs text-muted-foreground mt-0.5">{rfq.quotes} quotes received</span>
                    </div>
                  </TableCell>
                  <TableCell>{rfq.department}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`border-none ${config.color}`}>
                      <StatusIcon className="w-3 h-3 mr-1" />
                      {config.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    ${rfq.budget.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {format(rfq.deadline, "MMM d, yyyy")}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger render={<Button variant="ghost" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity" />}>
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-[160px] glass-panel">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => navigator.clipboard.writeText(rfq.rawId || rfq.id)}>
                          Copy RFQ ID
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {rfq.status === "evaluation" && (
                          <DropdownMenuItem render={<Link href={`/rfqs/${(rfq.rawId || rfq.id).split('-')[1] || rfq.id}/compare`} className="flex items-center text-primary font-medium focus:text-primary" />}>
                              Compare Quotes <ArrowUpRight className="w-4 h-4 ml-auto" />
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
