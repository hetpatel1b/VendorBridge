import { ComparisonMatrix } from "@/features/quotations/components/ComparisonMatrix";
import { AiCopilotPanel } from "@/features/quotations/components/AiCopilotPanel";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function CompareQuotesPage() {
  return (
    <div className="min-h-screen p-6 lg:p-12 animate-in-fade max-w-7xl mx-auto">
      <header className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild className="rounded-full">
            <Link href="/dashboard">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Compare Quotes</h1>
            <p className="text-muted-foreground mt-1">RFQ-1042 · MacBook Pro Fleet Upgrade</p>
          </div>
        </div>
      </header>

      <main>
        <AiCopilotPanel />
        <ComparisonMatrix />
      </main>
    </div>
  );
}
