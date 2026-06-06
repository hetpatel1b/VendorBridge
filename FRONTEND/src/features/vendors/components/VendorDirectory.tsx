"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Search, ShieldCheck, MapPin, MoreVertical, AlertTriangle, AlertCircle } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { supabase } from "@/lib/supabaseClient";
import { VendorForm } from "./VendorForm";

export function VendorDirectory() {
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<any>(null);

  async function fetchVendors() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("vendors")
        .select("*")
        .order("company_name");
        
      if (error) {
        console.error("Error fetching vendors:", error.message);
      } else if (data) {
        setVendors(data);
      }
    } catch (err) {
      console.error("Failed to fetch vendors:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchVendors();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this vendor?")) return;
    try {
      const { error } = await supabase.from("vendors").delete().eq("id", id);
      if (error) throw error;
      toast.success("Vendor deleted successfully");
      fetchVendors();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete vendor");
    }
  };

  const handleEdit = (vendor: any) => {
    setEditingVendor(vendor);
    setIsEditModalOpen(true);
  };

  if (loading && vendors.length === 0) {
    return <div className="p-8 text-center text-muted-foreground">Loading vendors...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search vendors by name, category, or ID..." className="pl-9 h-11 glass-panel" />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" className="glass-card" onClick={fetchVendors}>Refresh</Button>
          <Button className="shadow-lg shadow-primary/20" onClick={() => setIsAddModalOpen(true)}>Add Vendor</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vendors.map((vendor, i) => {
          const scorePercentage = (vendor.rating_avg || 0) * 20; // convert 5.0 to 100
          
          return (
            <motion.div
              key={vendor.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="p-6 glass-card group hover:border-primary/30 transition-all h-full flex flex-col relative overflow-hidden">
                {scorePercentage >= 90 && (
                  <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-xl -translate-y-1/2 translate-x-1/2"></div>
                )}
                
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 rounded-xl bg-muted/50 border border-border/50 flex items-center justify-center font-bold text-xl text-primary">
                    {vendor.company_name?.charAt(0) || "V"}
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="glass-panel">
                      <DropdownMenuItem onClick={() => handleEdit(vendor)}>Edit Vendor</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDelete(vendor.id)} className="text-destructive">Delete Vendor</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                
                <h3 className="font-semibold text-lg line-clamp-1" title={vendor.company_name}>{vendor.company_name}</h3>
                <p className="text-sm text-muted-foreground mb-4">{vendor.category}</p>
                
                <div className="space-y-2 mt-auto">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1.5 line-clamp-1">
                      <MapPin className="w-3.5 h-3.5 flex-shrink-0" /> 
                      {vendor.city ? `${vendor.city}, ${vendor.state}` : 'Location missing'}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 pt-3 border-t border-border/50">
                    <Badge variant={scorePercentage >= 80 ? "default" : scorePercentage >= 60 ? "secondary" : "destructive"} className={scorePercentage >= 80 ? "bg-primary/20 text-primary hover:bg-primary/30" : ""}>
                      {Number(vendor.rating_avg).toFixed(1)} / 5.0
                    </Badge>
                    
                    {vendor.status === "approved" && (
                      <Badge variant="outline" className="border-green-500/30 text-green-500 bg-green-500/10">
                        <ShieldCheck className="w-3 h-3 mr-1" /> Approved
                      </Badge>
                    )}
                    {vendor.status === "pending" && (
                      <Badge variant="outline" className="border-yellow-500/30 text-yellow-500 bg-yellow-500/10">
                        <AlertCircle className="w-3 h-3 mr-1" /> Pending
                      </Badge>
                    )}
                    {vendor.status === "suspended" && (
                      <Badge variant="outline" className="border-orange-500/30 text-orange-500 bg-orange-500/10">
                        <AlertTriangle className="w-3 h-3 mr-1" /> Suspended
                      </Badge>
                    )}
                    {vendor.status === "blacklisted" && (
                      <Badge variant="outline" className="border-red-500/30 text-red-500 bg-red-500/10">
                        Blacklisted
                      </Badge>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Add Vendor Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-[600px] glass-panel border-primary/20">
          <DialogHeader>
            <DialogTitle>Add New Vendor</DialogTitle>
          </DialogHeader>
          <VendorForm 
            onSuccess={() => {
              setIsAddModalOpen(false);
              fetchVendors();
            }}
            onCancel={() => setIsAddModalOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Vendor Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[600px] glass-panel border-primary/20">
          <DialogHeader>
            <DialogTitle>Edit Vendor</DialogTitle>
          </DialogHeader>
          {editingVendor && (
            <VendorForm 
              initialData={editingVendor}
              onSuccess={() => {
                setIsEditModalOpen(false);
                setEditingVendor(null);
                fetchVendors();
              }}
              onCancel={() => {
                setIsEditModalOpen(false);
                setEditingVendor(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
