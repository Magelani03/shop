import { Edit2, ChevronRight } from 'lucide-react';
import SidebarLayout from '@/components/layout/SidebarLayout';
import { useUserStore } from '@/lib/store';

const Profile = () => {
  const user = useUserStore((state) => state.user);
  const isAuthenticated = useUserStore((state) => state.isAuthenticated);

  const mockUser = {
    name: user?.name || 'Stephanus Sylvanus',
    displayName: 'Magelani',
    email: user?.email || 'ssylvanus516@gmail.com',
    phone: user?.phone || '+264815673978',
  };

  const menuItems = [
    { name: 'Orders', count: 3 },
    { name: 'History', count: 12 },
    { name: 'Messages', count: 5 },
  ];

  return (
    <SidebarLayout>
      <div className="p-6">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Profile Card */}
          <div className="bg-primary rounded-2xl p-6 text-primary-foreground">
            <div className="flex items-start gap-6">
              <div className="w-20 h-20 rounded-full bg-sage-light overflow-hidden flex-shrink-0">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=face"
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-2xl font-bold">{mockUser.displayName}</h2>
                  <button className="p-2 hover:bg-sage-dark/20 rounded-lg transition-colors">
                    <Edit2 className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-1 text-sm">
                  <p>
                    <span className="font-medium">Name:</span> {mockUser.name}
                  </p>
                  <p>
                    <span className="font-medium">Email:</span> {mockUser.email}
                  </p>
                  <p>
                    <span className="font-medium">Phone:</span> {mockUser.phone}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* More Section */}
          <div className="bg-primary rounded-2xl p-6 text-primary-foreground space-y-4">
            <h3 className="font-display text-xl font-bold text-center">More</h3>
            <div className="space-y-3">
              {menuItems.map((item) => (
                <button
                  key={item.name}
                  className="w-full bg-muted text-muted-foreground rounded-xl p-4 flex items-center justify-between hover:bg-muted/90 transition-colors"
                >
                  <span className="font-medium">{item.name}</span>
                  <div className="flex items-center gap-2">
                    {item.count > 0 && (
                      <span className="bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
                        {item.count}
                      </span>
                    )}
                    <ChevronRight className="w-5 h-5" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
};

export default Profile;
