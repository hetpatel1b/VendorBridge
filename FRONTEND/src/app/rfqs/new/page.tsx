import { RfqWizard } from "@/features/rfqs/components/RfqWizard";
import DashboardLayout from "@/app/dashboard/layout";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CreateRfqPage() {
  return (
    <DashboardLayout>
      <div className="p-6 lg:p-12 animate-in-fade w-full">
        <header className="mb-12 flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild className="rounded-full">
            <Link href="/rfqs">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Create New RFQ</h1>
            <p className="text-muted-foreground mt-1">Configure your request and invite vendors.</p>
          </div>
        </header>

        <main>
          <RfqWizard />
        </main>
      </div>
    </DashboardLayout>
  );
}
