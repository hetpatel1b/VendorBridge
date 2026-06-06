"use client";

import { motion } from "framer-motion";
import { Search, Star, ShieldCheck, MapPin, MoreVertical, ExternalLink } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

const vendors = [
  { id: "V-001", name: "Apex Systems Inc.", category: "IT Hardware", location: "San Francisco, CA", score: 98, status: "Approved", risk: "Low", certs: ["SOC2", "ISO 9001"] },
  { id: "V-002", name: "TechNova Solutions", category: "IT Services", location: "New York, NY", score: 92, status: "Approved", risk: "Low", certs: ["ISO 27001"] },
  { id: "V-003", name: "Global Office Supplies", category: "Facilities", location: "Chicago, IL", score: 85, status: "Under Review", risk: "Medium", certs: [] },
  { id: "V-004", name: "CyberDefend LLC", category: "Security", location: "Austin, TX", score: 95, status: "Approved", risk: "Low", certs: ["SOC2", "FedRAMP"] },
  { id: "V-005", name: "CloudScale Systems", category: "Cloud Infrastructure", location: "Seattle, WA", score: 88, status: "Approved", risk: "Medium", certs: ["ISO 9001"] },
  { id: "V-006", name: "PrintCorp", category: "Facilities", location: "Dallas, TX", score: 72, status: "Probation", risk: "High", certs: [] },
];

export function VendorDirectory() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search vendors by name, category, or ID..." className="pl-9 h-11 glass-panel" />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" className="glass-card">Filter</Button>
          <Button className="shadow-lg shadow-primary/20">Add Vendor</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vendors.map((vendor, i) => (
          <motion.div
            key={vendor.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="p-6 glass-card group hover:border-primary/30 transition-all cursor-pointer h-full flex flex-col relative overflow-hidden">
              {vendor.score >= 95 && (
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-xl -translate-y-1/2 translate-x-1/2"></div>
              )}
              
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-xl bg-muted/50 border border-border/50 flex items-center justify-center font-bold text-xl text-primary">
                  {vendor.name.charAt(0)}
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </div>
              
              <h3 className="font-semibold text-lg">{vendor.name}</h3>
              <p className="text-sm text-muted-foreground mb-4">{vendor.category}</p>
              
              <div className="space-y-2 mt-auto">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {vendor.location}</span>
                </div>
                
                <div className="flex items-center gap-2 pt-3 border-t border-border/50">
                  <Badge variant={vendor.score >= 90 ? "default" : vendor.score >= 80 ? "secondary" : "destructive"} className={vendor.score >= 90 ? "bg-primary/20 text-primary hover:bg-primary/30" : ""}>
                    {vendor.score} Score
                  </Badge>
                  
                  {vendor.status === "Approved" && (
                    <Badge variant="outline" className="border-green-500/30 text-green-500 bg-green-500/10">
                      <ShieldCheck className="w-3 h-3 mr-1" /> Approved
                    </Badge>
                  )}
                  {vendor.status === "Under Review" && (
                    <Badge variant="outline" className="border-yellow-500/30 text-yellow-500 bg-yellow-500/10">
                      Reviewing
                    </Badge>
                  )}
                  {vendor.status === "Probation" && (
                    <Badge variant="outline" className="border-red-500/30 text-red-500 bg-red-500/10">
                      Probation
                    </Badge>
                  )}
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
