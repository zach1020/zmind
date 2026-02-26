import Sidebar from "./Sidebar";
import CyberGlobe from "@/components/background/CyberGlobe";

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-bg-primary">
      <CyberGlobe />
      <Sidebar />
      <main className="relative z-10 flex h-full flex-1 flex-col overflow-hidden">
        {children}
      </main>
    </div>
  );
}
