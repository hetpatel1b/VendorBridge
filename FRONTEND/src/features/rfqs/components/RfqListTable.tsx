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

const mockRfqs = [
  { id: "RFQ-1042", title: "MacBook Pro Fleet Upgrade", department: "Engineering", status: "Evaluation", deadline: new Date(Date.now() + 86400000 * 2), budget: 150000, quotes: 3 },
  { id: "RFQ-1043", title: "AWS Cloud Infrastructure 2026", department: "DevOps", status: "Open", deadline: new Date(Date.now() + 86400000 * 5), budget: 500000, quotes: 1 },
  { id: "RFQ-1044", title: "Office Furniture - NY HQ", department: "Operations", status: "Awarded", deadline: new Date(Date.now() - 86400000 * 3), budget: 45000, quotes: 5 },
  { id: "RFQ-1045", title: "Cybersecurity Audit Services", department: "Security", status: "Draft", deadline: new Date(Date.now() + 86400000 * 14), budget: 80000, quotes: 0 },
  { id: "RFQ-1046", title: "Marketing Automation SaaS", department: "Marketing", status: "Closed", deadline: new Date(Date.now() - 86400000 * 1), budget: 120000, quotes: 4 },
];

const statusConfig = {
  Draft: { color: "bg-muted text-muted-foreground", icon: FileText },
  Open: { color: "bg-blue-500/10 text-blue-500", icon: Clock },
  Evaluation: { color: "bg-yellow-500/10 text-yellow-500", icon: AlertCircle },
  Awarded: { color: "bg-green-500/10 text-green-500", icon: CheckCircle },
  Closed: { color: "bg-red-500/10 text-red-500", icon: CheckCircle },
};

export function RfqListTable() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 max-w-sm w-full">
          <Input placeholder="Search RFQs..." className="h-10 glass-panel" />
        </div>
        <Button asChild className="shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-300">
          <Link href="/rfqs/new">
            <Plus className="w-4 h-4 mr-2" /> Create RFQ
          </Link>
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
            {mockRfqs.map((rfq, i) => {
              const StatusIcon = statusConfig[rfq.status as keyof typeof statusConfig].icon;
              return (
                <TableRow 
                  key={rfq.id} 
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
                    <Badge variant="outline" className={`border-none ${statusConfig[rfq.status as keyof typeof statusConfig].color}`}>
                      <StatusIcon className="w-3 h-3 mr-1" />
                      {rfq.status}
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
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-[160px] glass-panel">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => navigator.clipboard.writeText(rfq.id)}>
                          Copy RFQ ID
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {rfq.status === "Evaluation" && (
                          <DropdownMenuItem asChild>
                            <Link href={`/rfqs/${rfq.id.split('-')[1]}/compare`} className="flex items-center text-primary font-medium focus:text-primary">
                              Compare Quotes <ArrowUpRight className="w-4 h-4 ml-auto" />
                            </Link>
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
