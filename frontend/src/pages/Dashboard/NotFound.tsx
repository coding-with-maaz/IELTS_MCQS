
import { Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/Dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Home, ArrowLeft } from 'lucide-react';

export default function DashboardNotFound() {
  return (
    <DashboardLayout title="Page Not Found">
      <div className="flex flex-col items-center justify-center h-[70vh] text-center">
        <h1 className="text-9xl font-bold text-gray-200 mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-6">Page Not Found</h2>
        <p className="text-muted-foreground mb-8 max-w-md">
          The dashboard page you are looking for doesn't exist or has been moved to another location.
        </p>
        <div className="flex gap-4">
          <Button asChild variant="outline">
            <Link to="/dashboard">
              <Home className="mr-2 h-4 w-4" />
              Dashboard Home
            </Link>
          </Button>
          <Button asChild>
            <Link to="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Website
            </Link>
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
