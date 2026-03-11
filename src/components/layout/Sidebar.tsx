import { Link, useLocation } from 'react-router-dom';
import { User, Home, Package, Info, Mail, Tag, LayoutDashboard } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/lib/store';

interface SidebarProps {
  className?: string;
}

const Sidebar = ({ className }: SidebarProps) => {
  const location = useLocation();
  const isAdmin = useAuthStore((state) => state.isAdmin);

  const navLinks: { name: string; path: string; icon: React.ComponentType<any> }[] = [
    { name: 'Profile', path: '/profile', icon: User },
    { name: 'Home', path: '/', icon: Home },
    { name: 'Products', path: '/products', icon: Package },
    { name: 'About', path: '/about', icon: Info },
    { name: 'Contact', path: '/contact', icon: Mail },
    { name: 'Sales', path: '/sales', icon: Tag },
  ];

  if (isAdmin()) {
    // Insert Admin link after Profile
    navLinks.splice(1, 0, { name: 'Admin', path: '/admin', icon: LayoutDashboard });
  }

  return (
    <aside className={cn("w-40 min-h-screen bg-sage-light py-8", className)}>
      <nav className="flex flex-col gap-1 px-3">
        {navLinks.map((link) => {
          const isActive = location.pathname === link.path;
          const Icon = link.icon;
          
          return (
            <Link
              key={link.path}
              to={link.path}
              className={cn(
                "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200",
                isActive
                  ? "bg-background text-sage-dark shadow-sm"
                  : "text-sage-dark/70 hover:bg-background/50"
              )}
            >
              <Icon className="h-4 w-4" />
              {link.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
