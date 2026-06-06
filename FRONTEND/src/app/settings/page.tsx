import DashboardLayout from "@/app/dashboard/layout";
import { ShieldCheck, Users, Sliders } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function SettingsPage() {
  return (
    <DashboardLayout>
      <div className="p-6 lg:p-12 animate-in-fade max-w-[1400px] mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Admin Control Center</h1>
          <p className="text-muted-foreground mt-1">Manage organization settings, users, and security policies.</p>
        </header>

        <main className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 glass-card cursor-pointer hover:border-primary/50 transition-colors">
            <Users className="w-8 h-8 text-primary mb-4" />
            <h3 className="text-lg font-semibold mb-2">User Management</h3>
            <p className="text-sm text-muted-foreground">Add, remove, and manage roles for internal employees and vendors.</p>
          </Card>
          <Card className="p-6 glass-card cursor-pointer hover:border-primary/50 transition-colors">
            <ShieldCheck className="w-8 h-8 text-green-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Approval Rules</h3>
            <p className="text-sm text-muted-foreground">Configure dynamic routing and threshold-based approval chains.</p>
          </Card>
          <Card className="p-6 glass-card cursor-pointer hover:border-primary/50 transition-colors">
            <Sliders className="w-8 h-8 text-blue-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">System Preferences</h3>
            <p className="text-sm text-muted-foreground">Manage API keys, integrations, and global UI preferences.</p>
          </Card>
        </main>
      </div>
    </DashboardLayout>
  );
}
