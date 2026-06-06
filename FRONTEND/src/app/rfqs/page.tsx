import { RfqListTable } from "@/features/rfqs/components/RfqListTable";
import DashboardLayout from "@/app/dashboard/layout";

export default function RfqManagementPage() {
  return (
    <DashboardLayout>
      <div className="p-6 lg:p-12 animate-in-fade max-w-[1400px] mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">RFQ Management</h1>
          <p className="text-muted-foreground mt-1">Manage all active requests for quotations and monitor vendor responses.</p>
        </header>

        <main>
          <RfqListTable />
        </main>
      </div>
    </DashboardLayout>
  );
}
