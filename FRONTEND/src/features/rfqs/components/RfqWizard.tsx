"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, CheckCircle, Package, Users, FileText, Send, Sparkles, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";

const steps = [
  { id: 1, title: "AI Generation", icon: Sparkles },
  { id: 2, title: "Review Details", icon: FileText },
  { id: 3, title: "Vendor Selection", icon: Users },
  { id: 4, title: "Publish", icon: Send },
];

export function RfqWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const router = useRouter();

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, steps.length));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      nextStep();
    }, 2000); // simulate AI thinking
  };

  const submit = () => router.push("/rfqs");

  return (
    <div className="max-w-4xl mx-auto">
      {/* Stepper */}
      <div className="mb-12">
        <div className="flex items-center justify-between relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-muted/50 rounded-full z-0"></div>
          <motion.div 
            className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary rounded-full z-0"
            initial={{ width: "0%" }}
            animate={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          ></motion.div>

          {steps.map((step) => {
            const isCompleted = currentStep > step.id;
            const isActive = currentStep === step.id;

            return (
              <div key={step.id} className="relative z-10 flex flex-col items-center group">
                <motion.div 
                  className={`w-12 h-12 rounded-full flex items-center justify-center border-4 border-background transition-colors duration-300 ${
                    isActive 
                      ? "bg-primary text-primary-foreground shadow-[0_0_15px_rgba(var(--primary),0.5)]" 
                      : isCompleted 
                        ? "bg-primary/20 text-primary" 
                        : "bg-muted text-muted-foreground"
                  }`}
                >
                  {isCompleted ? <CheckCircle className="w-5 h-5" /> : <step.icon className="w-5 h-5" />}
                </motion.div>
                <span className={`absolute -bottom-7 text-xs font-medium whitespace-nowrap ${isActive ? "text-primary" : "text-muted-foreground"}`}>
                  {step.title}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <Card className="glass-panel p-8 min-h-[400px] relative overflow-hidden">
        <AnimatePresence mode="wait">
          
          {/* Step 1: AI Prompt */}
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col items-center justify-center h-full min-h-[300px] text-center"
            >
              <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-6">
                <Sparkles className="w-8 h-8" />
              </div>
              <h2 className="text-3xl font-semibold mb-2 tracking-tight">What do you need to buy?</h2>
              <p className="text-muted-foreground mb-8 max-w-lg">
                Describe your procurement needs in plain english. Our AI Copilot will generate the full RFQ structure, line items, and identify ideal vendors.
              </p>
              
              <div className="w-full max-w-2xl relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary to-purple-500 rounded-xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                <Textarea 
                  placeholder="e.g. I need 50 Dell XPS 15 laptops with 32GB RAM and 3 years of pro support delivered to the NY office by next Friday."
                  className="relative bg-background/90 backdrop-blur min-h-[120px] text-lg p-4 resize-none border-primary/20"
                />
                <Button 
                  onClick={handleGenerate} 
                  disabled={isGenerating}
                  className="absolute bottom-4 right-4 shadow-lg shadow-primary/20"
                >
                  {isGenerating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                  {isGenerating ? "Generating RFQ..." : "Generate RFQ"}
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 2: Auto-filled Details */}
          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="flex items-center gap-3 bg-primary/10 text-primary p-3 rounded-lg text-sm font-medium border border-primary/20">
                <Sparkles className="w-4 h-4" /> AI Copilot drafted this RFQ based on your prompt.
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2 col-span-2">
                  <Label>RFQ Title</Label>
                  <Input defaultValue="Dell XPS 15 Fleet - NY Office" className="bg-background/50 font-medium" />
                </div>
                <div className="space-y-2">
                  <Label>Department</Label>
                  <Input defaultValue="IT Operations" className="bg-background/50" />
                </div>
                <div className="space-y-2">
                  <Label>Deadline</Label>
                  <Input type="date" defaultValue="2026-06-15" className="bg-background/50" />
                </div>
              </div>

              <div>
                <Label className="mb-3 block">Extracted Line Items</Label>
                <div className="rounded-lg border border-border/50 bg-background/30 p-4 space-y-4">
                  <div className="grid grid-cols-12 gap-4 items-center">
                    <div className="col-span-8"><Label className="text-xs text-muted-foreground">Description</Label></div>
                    <div className="col-span-4"><Label className="text-xs text-muted-foreground">Quantity</Label></div>
                  </div>
                  <div className="grid grid-cols-12 gap-4">
                    <Input className="col-span-8 bg-background/50" defaultValue="Dell XPS 15 (32GB RAM)" />
                    <Input className="col-span-4 bg-background/50" type="number" defaultValue="50" />
                  </div>
                  <div className="grid grid-cols-12 gap-4">
                    <Input className="col-span-8 bg-background/50" defaultValue="Pro Support Plus (3 Years)" />
                    <Input className="col-span-4 bg-background/50" type="number" defaultValue="50" />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 3: AI Selected Vendors */}
          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-3 bg-primary/10 text-primary p-3 rounded-lg text-sm font-medium border border-primary/20 mb-6">
                <Sparkles className="w-4 h-4" /> Based on your hardware needs, these vendors have the highest historical success rate.
              </div>

              <div className="space-y-3">
                {[
                  { name: "Global Hardware Co.", match: "98%", active: true },
                  { name: "Apex Systems Inc.", match: "92%", active: true },
                  { name: "TechNova Solutions", match: "85%", active: false },
                ].map((vendor, i) => (
                  <div key={i} className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${vendor.active ? 'border-primary/40 bg-primary/5' : 'border-border/50 bg-background/30'}`}>
                    <div className="flex items-center gap-4">
                      <Checkbox id={`vendor-${i}`} defaultChecked={vendor.active} />
                      <div>
                        <Label htmlFor={`vendor-${i}`} className="font-medium text-base">{vendor.name}</Label>
                      </div>
                    </div>
                    {vendor.active && (
                      <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-1 rounded-full">{vendor.match} AI Match</span>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 4: Publish */}
          {currentStep === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6 text-center py-8"
            >
              <div className="w-20 h-20 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Send className="w-10 h-10 ml-1" />
              </div>
              <h2 className="text-3xl font-semibold mb-2 premium-gradient-text">Ready to Send?</h2>
              <p className="text-muted-foreground max-w-sm mx-auto mb-8">
                Your AI-generated RFQ is ready. 2 vendors will be notified immediately via email and portal.
              </p>
            </motion.div>
          )}

        </AnimatePresence>
      </Card>

      {/* Footer Navigation (Hide on Step 1) */}
      {currentStep > 1 && (
        <div className="flex justify-between items-center mt-8">
          <Button variant="ghost" onClick={prevStep}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          
          {currentStep < steps.length ? (
            <Button onClick={nextStep} className="shadow-lg shadow-primary/20">
              Continue <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={submit} className="bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-500/20">
              Publish RFQ <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
