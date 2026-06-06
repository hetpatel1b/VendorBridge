import { VendorDirectory } from "@/features/vendors/components/VendorDirectory";
import DashboardLayout from "@/app/dashboard/layout";

export default function VendorsPage() {
  return (
    <DashboardLayout>
      <div className="p-6 lg:p-12 animate-in-fade max-w-[1400px] mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Vendor Directory</h1>
          <p className="text-muted-foreground mt-1">Manage vendor profiles, performance scores, and compliance status.</p>
        </header>

        <main>
          <VendorDirectory />
        </main>
      </div>
    </DashboardLayout>
  );
}
