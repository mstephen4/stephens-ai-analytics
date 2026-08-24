import { SiteHeader } from "@/components/site/SiteHeader";

export default function OfflinePage() {
  return (
    <div>
      <SiteHeader />
      <main className="empty-floor">
        <div className="torch-mark large" />
        <h1 className="brand-title">OFFLINE</h1>
        <p>The stadium lights are out. Reconnect to deploy athletes. Local history stays on this device.</p>
      </main>
    </div>
  );
}
