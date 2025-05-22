
import { Sidebar } from "@/components/Sidebar";
import { useIsMobile } from "@/hooks/use-mobile";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const isMobile = useIsMobile();
  
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className={`transition-all duration-200 ${isMobile ? "pl-0" : "pl-64"}`}>
        <div className="container mx-auto py-6 px-4 sm:px-6 md:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}
