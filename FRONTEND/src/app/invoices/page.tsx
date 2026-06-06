import { ThreeWayMatch } from "@/features/invoices/components/ThreeWayMatch";
import DashboardLayout from "@/app/dashboard/layout";

export default function InvoicesPage() {
  return (
    <DashboardLayout>
      <div className="p-6 lg:p-12 animate-in-fade max-w-[1400px] mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Invoice Matching Center</h1>
          <p className="text-muted-foreground mt-1">Review automated 3-way matches and resolve discrepancies.</p>
        </header>

        <main>
          <ThreeWayMatch />
        </main>
      </div>
    </DashboardLayout>
  );
}


