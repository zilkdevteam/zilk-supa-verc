import { useLocation,NavLink } from 'react-router';
import { Store, BarChart2, Info } from 'lucide-react';

export default function BusinessNavigation() {
  const location = useLocation();

  const navItems = [
    {
      name: 'Deals',
      href: '/business/deals',
      icon: Store,
    },
    {
      name: 'Analytics',
      href: '/business/analytics',
      icon: BarChart2,
    },
    {
      name: 'Business Info',
      href: '/business/info',
      icon: Info,
    },
  ];

  return (
      <div className="bg-white border-b-2 border-retro-dark/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8" aria-label="Business Navigation">
            {navItems.map((item) => {
              const isActive = location.pathname === item.href;
              const Icon = item.icon;

              return (
                  <NavLink
                      key={item.name}
                      to={item.href}
                      className={`group relative pb-2 pt-4 px-1 ${
                          isActive
                              ? 'text-retro-primary'
                              : 'text-retro-muted hover:text-retro-dark'
                      }`}
                  >
                    <div className="flex items-center space-x-2">
                      <Icon className="h-5 w-5" />
                      <span className="font-medium">{item.name}</span>
                    </div>

                    {/* Active indicator line */}
                    <span
                        className={`absolute inset-x-0 bottom-0 h-0.5 transition-colors duration-200 ${
                            isActive ? 'bg-retro-primary' : 'bg-transparent group-hover:bg-retro-dark/10'
                        }`}
                        aria-hidden="true"
                    />
                  </NavLink>
              );
            })}
          </nav>
        </div>
      </div>
  );
}