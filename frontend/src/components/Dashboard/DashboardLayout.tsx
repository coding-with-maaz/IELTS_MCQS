
import { ReactNode } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import DashboardSidebar from './Sidebar';
import DashboardNavbar from './Navbar';

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
}

export function DashboardLayout({ children, title }: DashboardLayoutProps) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-gray-50">
        <DashboardSidebar />
        <main className="flex-1 flex flex-col">
          <DashboardNavbar title={title} />
          <div className="flex-1 p-6">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}

export default DashboardLayout;
