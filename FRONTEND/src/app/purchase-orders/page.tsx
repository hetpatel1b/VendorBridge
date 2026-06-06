import { PoList } from "@/features/purchase-orders/components/PoList";
import DashboardLayout from "@/app/dashboard/layout";

export default function PurchaseOrdersPage() {
  return (
    <DashboardLayout>
      <div className="p-6 lg:p-12 animate-in-fade max-w-[1400px] mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Purchase Orders</h1>
          <p className="text-muted-foreground mt-1">Track fulfillment and lifecycle of approved purchase orders.</p>
        </header>

        <main>
          <PoList />
        </main>
      </div>
    </DashboardLayout>
  );
}
