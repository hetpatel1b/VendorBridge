"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, AlertCircle, ShieldCheck, Zap, SlidersHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

interface VendorData {
  id: string;
  name: string;
  baseScore: number;
  price: number;
  deliveryDays: number;
  riskLevel: "Low" | "Medium" | "High";
  compliance: string[];
}

const mockVendors: VendorData[] = [
  { id: "v1", name: "TechNova Solutions", baseScore: 92, price: 42000, deliveryDays: 14, riskLevel: "Medium", compliance: ["ISO 9001"] },
  { id: "v2", name: "Apex Systems Inc.", baseScore: 98, price: 39500, deliveryDays: 7, riskLevel: "Low", compliance: ["ISO 9001", "SOC2", "GDPR"] },
  { id: "v3", name: "Global Hardware Co.", baseScore: 85, price: 40000, deliveryDays: 21, riskLevel: "High", compliance: ["ISO 9001"] },
  { id: "v4", name: "Nexus Procurement", baseScore: 88, price: 37000, deliveryDays: 30, riskLevel: "Low", compliance: ["SOC2"] },
];

export function ComparisonMatrix() {
  const [weights, setWeights] = useState({ price: 50, speed: 30, risk: 20 });

  // Normalize prices and speeds for scoring calculation
  const maxPrice = Math.max(...mockVendors.map(v => v.price));
  const maxDays = Math.max(...mockVendors.map(v => v.deliveryDays));

  const sortedVendors = useMemo(() => {
    return mockVendors.map(vendor => {
      // Calculate normalized scores (100 is best)
      const priceScore = ((maxPrice - vendor.price) / maxPrice) * 100 + 50; // simple normalization
      const speedScore = ((maxDays - vendor.deliveryDays) / maxDays) * 100 + 50;
      const riskScore = vendor.riskLevel === 'Low' ? 100 : vendor.riskLevel === 'Medium' ? 70 : 40;

      // Apply weights
      const totalWeight = weights.price + weights.speed + weights.risk;
      const finalScore = (
        (priceScore * weights.price) + 
        (speedScore * weights.speed) + 
        (riskScore * weights.risk)
      ) / totalWeight;

      return {
        ...vendor,
        calculatedScore: Math.round(finalScore)
      };
    }).sort((a, b) => b.calculatedScore - a.calculatedScore);
  }, [weights, maxPrice, maxDays]);

  const lowestPrice = Math.min(...mockVendors.map((v) => v.price));
  const fastestDelivery = Math.min(...mockVendors.map((v) => v.deliveryDays));

  return (
    <div className="space-y-8">
      {/* Interactive Weighting Engine */}
      <Card className="p-6 glass-panel border-primary/20 bg-background/80 backdrop-blur-2xl">
        <div className="flex items-center gap-2 mb-6 text-primary">
          <SlidersHorizontal className="w-5 h-5" />
          <h3 className="font-semibold text-lg tracking-tight">AI Weighting Engine</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm font-medium">Price Sensitivity</span>
              <span className="text-sm text-muted-foreground">{weights.price}%</span>
            </div>
            <Slider 
              value={[weights.price]} 
              onValueChange={([val]) => setWeights(w => ({ ...w, price: val }))} 
              max={100} step={5} className="cursor-pointer"
            />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm font-medium">Speed Importance</span>
              <span className="text-sm text-muted-foreground">{weights.speed}%</span>
            </div>
            <Slider 
              value={[weights.speed]} 
              onValueChange={([val]) => setWeights(w => ({ ...w, speed: val }))} 
              max={100} step={5} className="cursor-pointer"
            />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm font-medium">Risk Aversion</span>
              <span className="text-sm text-muted-foreground">{weights.risk}%</span>
            </div>
            <Slider 
              value={[weights.risk]} 
              onValueChange={([val]) => setWeights(w => ({ ...w, risk: val }))} 
              max={100} step={5} className="cursor-pointer"
            />
          </div>
        </div>
      </Card>

      {/* Dynamic Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <AnimatePresence>
          {sortedVendors.map((vendor, index) => {
            const isRecommended = index === 0;

            return (
              <motion.div 
                key={vendor.id} 
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="relative group h-full"
              >
                {isRecommended && (
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl blur opacity-30 group-hover:opacity-50 transition duration-500" />
                )}
                <Card
                  className={`relative h-full flex flex-col p-6 glass-card overflow-hidden ${
                    isRecommended ? "border-primary/50 bg-primary/5" : "border-border/50"
                  }`}
                >
                  {isRecommended && (
                    <div className="absolute top-0 right-0 px-3 py-1 bg-primary text-primary-foreground text-xs font-semibold rounded-bl-lg flex items-center gap-1 shadow-lg">
                      <Zap className="w-3 h-3" /> #1 Match
                    </div>
                  )}
                  
                  <div className="mb-6 mt-2">
                    <h3 className="text-xl font-semibold tracking-tight leading-tight">{vendor.name}</h3>
                    <div className="flex items-center gap-2 mt-3">
                      <Badge variant={vendor.calculatedScore >= 80 ? "default" : "secondary"} className={vendor.calculatedScore >= 80 ? "bg-primary/20 text-primary hover:bg-primary/30" : ""}>
                        {vendor.calculatedScore} Match Score
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-6 flex-grow">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Total Price</p>
                      <div className="flex items-end gap-2">
                        <p className="text-2xl font-mono font-medium tracking-tighter">
                          ${vendor.price.toLocaleString()}
                        </p>
                        {vendor.price === lowestPrice && (
                          <Badge variant="outline" className="border-green-500/30 text-green-500 bg-green-500/10 mb-1">Lowest</Badge>
                        )}
                      </div>
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Delivery</p>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-lg">{vendor.deliveryDays} Days</p>
                        {vendor.deliveryDays === fastestDelivery && (
                          <Badge variant="outline" className="border-blue-500/30 text-blue-500 bg-blue-500/10">Fastest</Badge>
                        )}
                      </div>
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Risk</p>
                      <div className="flex items-center gap-2">
                        {vendor.riskLevel === "Low" ? (
                          <span className="flex items-center text-green-500 gap-1.5 font-medium"><ShieldCheck className="w-4 h-4" /> Low Risk</span>
                        ) : vendor.riskLevel === "Medium" ? (
                          <span className="flex items-center text-yellow-500 gap-1.5 font-medium"><AlertCircle className="w-4 h-4" /> Medium Risk</span>
                        ) : (
                          <span className="flex items-center text-red-500 gap-1.5 font-medium"><AlertCircle className="w-4 h-4" /> High Risk</span>
                        )}
                      </div>
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">Compliance</p>
                      <div className="flex flex-wrap gap-1.5">
                        {vendor.compliance.map((cert) => (
                          <Badge key={cert} variant="secondary" className="text-xs font-normal bg-background/50">
                            <Check className="w-3 h-3 mr-1" /> {cert}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-border/50">
                    <Button 
                      className="w-full shadow-sm transition-all h-11 font-medium" 
                      variant={isRecommended ? "default" : "outline"}
                    >
                      {isRecommended ? "Award Contract" : "Select Vendor"}
                    </Button>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
