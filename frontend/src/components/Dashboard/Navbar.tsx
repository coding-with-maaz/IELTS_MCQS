
import { useState } from 'react';
import { Bell, Search, User, Menu } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';

export function DashboardNavbar({ title }: { title: string }) {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header className="bg-white border-b h-16 flex items-center px-4 sticky top-0 z-10">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="md:hidden" />
        <h1 className="font-semibold text-xl">{title}</h1>
      </div>
      
      <div className="ml-auto flex items-center space-x-4">
        <div className={`relative transition-all duration-300 ${searchOpen ? 'w-64' : 'w-10'}`}>
          {searchOpen ? (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
          ) : (
            <button 
              onClick={() => setSearchOpen(true)}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Search"
            >
              <Search className="h-4 w-4 text-gray-600" />
            </button>
          )}
          
          {searchOpen && (
            <Input
              type="search"
              placeholder="Search..."
              className="pl-10 w-full"
              autoFocus
              onBlur={() => setSearchOpen(false)}
            />
          )}
        </div>
        
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
            3
          </span>
        </Button>
        
        <Button variant="ghost" size="icon">
          <User className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}

export default DashboardNavbar;
