import { Link, useLocation } from 'react-router-dom';
import { Search, ShoppingBag, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useCartStore } from '@/lib/store';

const Navbar = () => {
  const location = useLocation();
  const totalItems = useCartStore((state) => state.getTotalItems());
  const setDrawerOpen = useCartStore((state) => state.setDrawerOpen);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Products', path: '/products' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
    { name: 'Sales', path: '/sales' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-background border-b border-border">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="font-display text-2xl font-bold text-foreground tracking-wide">
          SHOP
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`text-sm font-medium transition-colors hover:text-primary ${location.pathname === link.path ? 'text-primary' : 'text-foreground/70'
                }`}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center relative">
            <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search"
              className="pl-9 w-48 bg-muted/50 border-0 focus-visible:ring-1"
            />
          </div>

          <Link to="/login" className="flex items-center gap-2 text-sm text-foreground/70 hover:text-primary transition-colors">
            <User className="h-5 w-5" />
            <span className="hidden sm:inline">Sign In</span>
          </Link>

          <button onClick={() => setDrawerOpen(true)} className="relative hover:opacity-80 transition-opacity">
            <ShoppingBag className="h-5 w-5 text-foreground/70 hover:text-primary transition-colors" />
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center bg-primary text-primary-foreground text-xs rounded-full">
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
