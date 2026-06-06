"use client";

import { motion } from "framer-motion";
import { Box, ArrowRight, Shield, Zap } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      {/* Left Column: Branding & Form */}
      <div className="flex flex-col justify-center px-8 lg:px-24 bg-background relative z-10">
        <div className="absolute top-8 left-8 flex items-center gap-2 font-bold tracking-tighter text-lg">
          <Box className="w-5 h-5 text-primary" /> VendorBridge
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-sm w-full mx-auto"
        >
          <h1 className="text-3xl font-semibold tracking-tight mb-2">Welcome back</h1>
          <p className="text-muted-foreground mb-8 text-sm">
            Log in to your command center to continue.
          </p>

          <form className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="alex@acmecorp.com" className="bg-background/50 h-11" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link href="#" className="text-xs text-primary hover:underline">Forgot password?</Link>
              </div>
              <Input id="password" type="password" className="bg-background/50 h-11" placeholder="••••••••" />
            </div>
            <Button className="w-full h-11 mt-6 font-medium shadow-lg shadow-primary/20" asChild>
              <Link href="/dashboard">
                Sign In <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border/60"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button variant="outline" className="h-11 border-border/60 bg-background/50">
              Google
            </Button>
            <Button variant="outline" className="h-11 border-border/60 bg-background/50">
              SAML SSO
            </Button>
          </div>
        </motion.div>
      </div>

      {/* Right Column: Visuals */}
      <div className="hidden lg:flex relative overflow-hidden bg-muted/30 border-l border-border/50 items-center justify-center p-12">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_0%,rgba(120,119,198,0.15),rgba(255,255,255,0))]"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[100px] pointer-events-none mix-blend-screen"></div>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="glass-panel w-full max-w-lg rounded-2xl p-8 relative z-10"
        >
          <div className="flex gap-4 mb-8 border-b border-border/50 pb-8">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary flex-shrink-0">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-lg premium-gradient-text">Instant Procurement</h3>
              <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                VendorBridge 2.0 uses edge computing and optimistic UI to make every action feel instant.
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center text-green-500 flex-shrink-0">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-lg premium-gradient-text">Enterprise Security</h3>
              <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                Bank-grade encryption, SOC2 Type II compliance, and granular RBAC built into the core.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Abstract pattern floating in background */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
      </div>
    </div>
  );
}
