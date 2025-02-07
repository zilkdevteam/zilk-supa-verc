'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Store, BarChart2, Info } from 'lucide-react';

export default function BusinessNavigation() {
  const pathname = usePathname();

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
    <nav className="bg-retro-accent/10 border-b-2 border-retro-accent/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16">
          <div className="flex space-x-4">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group inline-flex items-center px-4 py-2 text-sm font-bold rounded-lg
                    transition-all duration-200 ${
                    isActive
                      ? 'bg-retro-accent/20 text-retro-primary shadow-retro'
                      : 'text-retro-primary hover:text-retro-primary/80 hover:bg-retro-accent/20'
                  }`}
                >
                  <Icon className={`h-5 w-5 mr-2 transition-colors duration-200 ${
                    isActive 
                      ? 'text-retro-primary'
                      : 'text-retro-primary group-hover:text-retro-primary/80'
                  }`} />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
} 