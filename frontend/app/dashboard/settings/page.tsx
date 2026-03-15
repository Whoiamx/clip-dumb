import { Settings } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
        <Settings className="h-7 w-7 text-primary" />
      </div>
      <h2 className="font-display text-xl font-semibold">Settings</h2>
      <p className="text-sm text-muted-foreground">Coming soon — manage your account and preferences.</p>
    </div>
  );
}
