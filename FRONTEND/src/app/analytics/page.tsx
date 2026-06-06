import { SpendAnalytics } from "@/features/analytics/components/SpendAnalytics";
import DashboardLayout from "@/app/dashboard/layout";

export default function AnalyticsPage() {
  return (
    <DashboardLayout>
      <div className="p-6 lg:p-12 animate-in-fade max-w-[1400px] mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Analytics Command Center</h1>
          <p className="text-muted-foreground mt-1">Real-time insights into spend, vendor performance, and organizational efficiency.</p>
        </header>

        <main>
          <SpendAnalytics />
        </main>
      </div>
    </DashboardLayout>
  );
}
