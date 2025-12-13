import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Search, LogOut } from 'lucide-react';
import { Input } from '@/components/ui/input';
import Sidebar from './Sidebar';
import Footer from './Footer';

interface SidebarLayoutProps {
  children: ReactNode;
}

const SidebarLayout = ({ children }: SidebarLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Header */}
      <header className="sticky top-0 z-50 w-full bg-background border-b border-border">
        <div className="flex h-14 items-center justify-between px-4">
          <Link to="/" className="font-display text-2xl font-bold text-foreground tracking-wide">
            SHOP
          </Link>
          
          <div className="flex items-center gap-4">
            <div className="relative">
              <Input
                type="search"
                placeholder="Search"
                className="w-64 bg-muted/50 border border-border rounded-full pl-4 pr-10"
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
            
            <Link to="/login" className="hover:opacity-80 transition-opacity">
              <LogOut className="h-5 w-5 text-foreground" />
            </Link>
          </div>
        </div>
      </header>
      
      <div className="flex flex-1">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default SidebarLayout;
