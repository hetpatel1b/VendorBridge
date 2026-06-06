"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Check, AlertCircle, ShieldCheck, Zap, SlidersHorizontal, ArrowLeft, Loader2, Table2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface VendorData {
  id: string;
  name: string;
  baseScore: number;
  price: number;
  deliveryDays: number;
  riskLevel: "Low" | "Medium" | "High";
  compliance: string[];
  calculatedScore?: number;
  quotation_id: string;
}

export function ComparisonMatrix() {
  const { rfqId } = useParams();
  const router = useRouter();
  const [vendorsData, setVendorsData] = useState<VendorData[]>([]);
  const [matrixData, setMatrixData] = useState<any[]>([]);
  const [rfqHeader, setRfqHeader] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [weights, setWeights] = useState({ price: 50, speed: 30, risk: 20 });

  const getAccessToken = () => {
    if (typeof window === 'undefined') return '';
    const sessionStr = localStorage.getItem('mock_supabase_session');
    if (!sessionStr) return '';
    try {
      const session = JSON.parse(sessionStr);
      return session?.access_token || '';
    } catch {
      return '';
    }
  };

  async function fetchComparisonData() {
    setLoading(true);
    try {
      const token = getAccessToken();
      const res = await fetch(`${API_URL}/api/v1/quotations/compare/${rfqId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const json = await res.json();
      if (json.success && json.data) {
        setRfqHeader(json.data.rfq);
        setMatrixData(json.data.matrix || []);
        
        const mapped = (json.data.vendors || []).map((v: any) => ({
          id: v.vendor_id,
          name: v.company_name,
          baseScore: v.rating_avg ? v.rating_avg * 20 : 80, // scale 5.0 to 100
          price: v.total_amount || 0,
          deliveryDays: v.delivery_days || 7,
          riskLevel: v.rating_avg >= 4.2 ? "Low" : v.rating_avg >= 3.5 ? "Medium" : "High",
          compliance: v.rating_avg >= 4.0 ? ["ISO 9001", "SOC2"] : ["ISO 9001"],
          quotation_id: v.quotation_id
        }));
        setVendorsData(mapped);
      } else {
        toast.error(json.error || "Failed to fetch comparison details");
      }
    } catch (err: any) {
      console.error("Failed to fetch comparison matrix:", err);
      toast.error("Network error while loading comparison matrix");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (rfqId) {
      fetchComparisonData();
    }
  }, [rfqId]);

  const handleSelectVendor = async (quotationId: string) => {
    setSubmitting(quotationId);
    try {
      const token = getAccessToken();
      const res = await fetch(`${API_URL}/api/v1/quotations/${quotationId}/select`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Contract successfully awarded! Purchase Order generated.");
        router.push("/purchase-orders");
      } else {
        toast.error(data.error || "Selection failed");
      }
    } catch (err: any) {
      toast.error(err.message || "An error occurred");
    } finally {
      setSubmitting(null);
    }
  };

  // Normalize prices and speeds for scoring calculation
  const maxPrice = Math.max(...vendorsData.map(v => v.price), 1);
  const maxDays = Math.max(...vendorsData.map(v => v.deliveryDays), 1);

  const sortedVendors = useMemo(() => {
    return vendorsData.map(vendor => {
      // Calculate normalized scores (100 is best)
      const priceScore = ((maxPrice - vendor.price) / maxPrice) * 100 + 50; 
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
  }, [weights, vendorsData, maxPrice, maxDays]);

  const lowestPrice = Math.min(...vendorsData.map((v) => v.price), Infinity);
  const fastestDelivery = Math.min(...vendorsData.map((v) => v.deliveryDays), Infinity);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-muted-foreground gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span>Loading comparison details...</span>
      </div>
    );
  }

  if (vendorsData.length === 0) {
    return (
      <Card className="p-12 text-center glass-panel max-w-lg mx-auto">
        <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-xl font-bold mb-2">No Quotations Yet</h3>
        <p className="text-muted-foreground text-sm mb-6">
          No vendors have submitted bids for this RFQ yet. Send invitations or check back later.
        </p>
        <Button onClick={() => router.push("/rfqs")} variant="outline" className="gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to RFQs
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {/* RFQ Header Info */}
      {rfqHeader && (
        <Card className="p-6 border-border/50 glass-card bg-muted/10">
          <div className="flex justify-between items-start flex-wrap gap-4">
            <div>
              <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest bg-muted/60 px-2 py-0.5 rounded">
                {rfqHeader.rfq_number}
              </span>
              <h2 className="text-2xl font-bold tracking-tight mt-2">{rfqHeader.title}</h2>
              <p className="text-muted-foreground text-sm mt-1">{rfqHeader.description}</p>
            </div>
            <div className="text-right">
              <span className="text-xs text-muted-foreground uppercase tracking-wider block">Estimated Budget</span>
              <span className="text-2xl font-bold font-mono text-primary">${rfqHeader.budget_estimate?.toLocaleString()}</span>
            </div>
          </div>
        </Card>
      )}

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
              onValueChange={(val: any) => setWeights(w => ({ ...w, price: val[0] }))} 
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
              onValueChange={(val: any) => setWeights(w => ({ ...w, speed: val[0] }))} 
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
              onValueChange={(val: any) => setWeights(w => ({ ...w, risk: val[0] }))} 
              max={100} step={5} className="cursor-pointer"
            />
          </div>
        </div>
      </Card>

      {/* Dynamic Match Cards */}
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
                    <h3 className="text-xl font-semibold tracking-tight leading-tight line-clamp-1" title={vendor.name}>{vendor.name}</h3>
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
                      onClick={() => handleSelectVendor(vendor.quotation_id)}
                      disabled={submitting !== null}
                    >
                      {submitting === vendor.quotation_id ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          Awarding...
                        </>
                      ) : (
                        isRecommended ? "Award Contract" : "Select Vendor"
                      )}
                    </Button>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Itemized Comparison Matrix Table */}
      <Card className="p-6 border-border/50 glass-card">
        <div className="flex items-center gap-2 mb-6">
          <Table2 className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-lg tracking-tight">Item-by-Item Price Comparison Grid</h3>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="border-border/50 hover:bg-transparent">
                <TableHead className="min-w-[200px]">RFQ Item Name</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead className="text-right">Est. Unit Price</TableHead>
                {vendorsData.map(v => (
                  <TableHead key={v.id} className="text-right font-medium text-foreground">
                    {v.name}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {matrixData.map((row) => (
                <TableRow key={row.rfq_item_id} className="border-border/50 hover:bg-muted/10">
                  <TableCell className="font-medium text-foreground">{row.item_name}</TableCell>
                  <TableCell className="text-right">{row.quantity} {row.unit}</TableCell>
                  <TableCell className="text-right text-muted-foreground font-mono">
                    ${Number(row.estimated_unit_price).toLocaleString()}
                  </TableCell>
                  {vendorsData.map(v => {
                    const quote = row.quotes.find((q: any) => q.vendor_id === v.id);
                    const isLowest = quote?.price_rank === 1;
                    return (
                      <TableCell key={v.id} className="text-right font-mono">
                        {quote && quote.unit_price !== null ? (
                          <div className="flex flex-col items-end">
                            <span className={isLowest ? "text-green-500 font-semibold" : "text-foreground"}>
                              ${Number(quote.unit_price).toLocaleString()}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              Total: ${Number(quote.total_price).toLocaleString()}
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground/40">—</span>
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
