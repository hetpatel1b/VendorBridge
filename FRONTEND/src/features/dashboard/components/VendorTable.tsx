"use client";

import { useState } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MoreHorizontal, ArrowUpDown, Search, Filter } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const vendors = [
  { id: "V-1001", name: "Acme Corp", category: "Hardware", revenue: "$240,000", rating: 4.8, status: "Active", lastActive: "2h ago" },
  { id: "V-1002", name: "Globex Inc", category: "Software", revenue: "$185,000", rating: 4.5, status: "Active", lastActive: "5h ago" },
  { id: "V-1003", name: "Soylent Corp", category: "Logistics", revenue: "$95,000", rating: 3.2, status: "Warning", lastActive: "1d ago" },
  { id: "V-1004", name: "Initech", category: "Software", revenue: "$320,000", rating: 4.9, status: "Active", lastActive: "15m ago" },
  { id: "V-1005", name: "Umbrella Corp", category: "Consulting", revenue: "$45,000", rating: 2.1, status: "Critical", lastActive: "1w ago" },
];

export function VendorTable() {
  const [search, setSearch] = useState("");

  const filteredVendors = vendors.filter(v => 
    v.name.toLowerCase().includes(search.toLowerCase()) || 
    v.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="border border-border/50 bg-background/50 backdrop-blur-xl rounded-xl shadow-sm overflow-hidden flex flex-col">
      <div className="p-6 border-b border-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Vendor Performance</h2>
          <p className="text-sm text-muted-foreground mt-1">Manage and monitor your top vendors.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search vendors..." 
              className="pl-9 w-full sm:w-[250px] bg-background/50" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button variant="outline" className="shrink-0 gap-2">
            <Filter className="w-4 h-4" />
            <span className="hidden sm:inline">Filter</span>
          </Button>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30">
              <TableHead className="w-[250px]">
                <Button variant="ghost" className="p-0 hover:bg-transparent font-semibold">
                  Vendor Name <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>Category</TableHead>
              <TableHead>
                <Button variant="ghost" className="p-0 hover:bg-transparent font-semibold">
                  Revenue <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Active</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredVendors.map((vendor) => (
              <TableRow key={vendor.id} className="group hover:bg-muted/50 transition-colors">
                <TableCell className="font-medium">
                  <div className="flex flex-col">
                    <span>{vendor.name}</span>
                    <span className="text-xs text-muted-foreground">{vendor.id}</span>
                  </div>
                </TableCell>
                <TableCell>{vendor.category}</TableCell>
                <TableCell>{vendor.revenue}</TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <span className="font-medium">{vendor.rating}</span>
                    <span className="text-muted-foreground ml-1">/5</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge 
                    variant={vendor.status === 'Active' ? 'default' : vendor.status === 'Warning' ? 'secondary' : 'destructive'}
                    className={
                      vendor.status === 'Active' ? 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 hover:text-emerald-500 border-emerald-500/20' :
                      vendor.status === 'Warning' ? 'bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 hover:text-amber-500 border-amber-500/20' :
                      'bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 hover:text-rose-500 border-rose-500/20'
                    }
                  >
                    {vendor.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">{vendor.lastActive}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring hover:bg-accent hover:text-accent-foreground h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem>View details</DropdownMenuItem>
                      <DropdownMenuItem>Message vendor</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-rose-500 focus:text-rose-500 focus:bg-rose-500/10">Suspend account</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      <div className="p-4 border-t border-border/50 flex items-center justify-between text-sm text-muted-foreground">
        <div>Showing 1 to {filteredVendors.length} of {vendors.length} entries</div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled>Previous</Button>
          <Button variant="outline" size="sm">Next</Button>
        </div>
      </div>
    </div>
  );
}
