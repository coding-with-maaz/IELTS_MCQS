import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { Toaster } from './ui/toaster';

export function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-background font-sans antialiased">
      <Navbar />
      <main className="container mx-auto flex-1 py-6">
        <Outlet />
      </main>
      <Footer />
      <Toaster />
    </div>
  );
} 