import { ApprovalQueue } from "@/features/approvals/components/ApprovalQueue";
import DashboardLayout from "@/app/dashboard/layout";

export default function ApprovalsPage() {
  return (
    <DashboardLayout>
      <div className="p-6 lg:p-12 animate-in-fade max-w-[1400px] mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Pending Approvals</h1>
          <p className="text-muted-foreground mt-1">Review requests with AI-generated context to make faster decisions.</p>
        </header>

        <main>
          <ApprovalQueue />
        </main>
      </div>
    </DashboardLayout>
  );
}
