import Link from "next/link";
import { ArrowRight, Box, ShieldCheck, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden selection:bg-primary/30">
      {/* Background Effects */}
      <div className="absolute inset-0 -z-10 h-full w-full bg-background bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#ffffff15_1px,transparent_1px)] [background-size:16px_16px] opacity-40"></div>
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px] -z-10 mix-blend-multiply dark:mix-blend-screen animate-pulse" style={{ animationDuration: '8s' }}></div>
      <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px] -z-10 mix-blend-multiply dark:mix-blend-screen"></div>

      <nav className="flex items-center justify-between p-6 lg:px-12 backdrop-blur-md bg-background/50 border-b border-border/50 sticky top-0 z-50">
        <div className="flex items-center gap-2 font-bold text-xl tracking-tighter">
          <Box className="w-6 h-6 text-primary" /> VendorBridge
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
          <Link href="#features" className="hover:text-foreground transition-colors">Features</Link>
          <Link href="#solutions" className="hover:text-foreground transition-colors">Solutions</Link>
          <Link href="#pricing" className="hover:text-foreground transition-colors">Pricing</Link>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" className="hidden sm:flex" asChild>
            <Link href="/login">Log in</Link>
          </Button>
          <Button className="rounded-full shadow-lg shadow-primary/25" asChild>
            <Link href="/dashboard">Access Platform <ArrowRight className="w-4 h-4 ml-2" /></Link>
          </Button>
        </div>
      </nav>

      <main className="flex-grow flex flex-col items-center justify-center p-6 text-center animate-in-fade z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8 border border-primary/20">
          <Zap className="w-4 h-4" /> Introducing VendorBridge 2.0
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter max-w-4xl mb-6 leading-tight">
          Enterprise procurement, <br className="hidden md:block" />
          <span className="premium-gradient-text">engineered for speed.</span>
        </h1>
        
        <p className="text-xl text-muted-foreground max-w-2xl mb-10 leading-relaxed">
          The only platform that combines Linear's speed, Stripe's clarity, and Vercel's elegance to manage vendors, RFQs, and approvals in milliseconds.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
          <Button size="lg" className="h-14 px-8 text-lg rounded-full shadow-xl shadow-primary/20" asChild>
            <Link href="/dashboard">
              Enter Command Center <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" className="h-14 px-8 text-lg rounded-full glass-card">
            Book a Demo
          </Button>
        </div>

        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 text-left max-w-5xl w-full">
          {[
            { title: "Intelligent Copilot", desc: "AI-driven vendor scoring and price intelligence.", icon: Zap },
            { title: "Milliseconds Matter", desc: "Built on Next.js 15. Every interaction is instantaneous.", icon: Box },
            { title: "Enterprise Grade", desc: "SOC2 compliant, role-based access, and robust audit logs.", icon: ShieldCheck }
          ].map((feature, i) => (
            <div key={i} className="p-6 rounded-2xl glass-card relative group overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <feature.icon className="w-8 h-8 text-primary mb-4" />
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
