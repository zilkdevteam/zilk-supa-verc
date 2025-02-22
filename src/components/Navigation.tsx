'use client';

import { NavLink, useLocation, useNavigate } from 'react-router';
import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { supabase } from '../lib/supabase';

export function Navigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();

    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/');
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/deals', label: 'Deals' },
    { href: '/business', label: 'For Business' },
  ];

  return (
      <nav className="bg-white border-b-2 border-retro-accent/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <NavLink
                    to="/"
                    className="text-2xl font-display text-retro-primary hover:text-glow transition-all duration-200"
                >
                  Zilk
                </NavLink>
              </div>
              <div className="hidden sm:ml-8 sm:flex sm:space-x-4">
                {navLinks.map((link) => (
                    <NavLink
                        key={link.href}
                        to={link.href}
                        className={`inline-flex items-center px-4 py-2 text-sm font-bold text-retro-primary hover:text-retro-primary/80 hover:bg-retro-accent/10 rounded-lg transition-colors duration-200 ${
                            isActive(link.href) ? 'bg-retro-accent/10' : ''
                        }`}
                    >
                      {link.label}
                    </NavLink>
                ))}
              </div>
            </div>

            <div className="hidden sm:ml-6 sm:flex sm:items-center">
              {loading ? (
                  <div className="w-24 h-9 bg-retro-dark-700/10 animate-pulse rounded-lg"></div>
              ) : isAuthenticated ? (
                  <button
                      onClick={handleSignOut}
                      className="btn-secondary"
                  >
                    Sign Out
                  </button>
              ) : (
                  <NavLink
                      to="/auth"
                      className="btn-primary"
                  >
                    Sign In
                  </NavLink>
              )}
            </div>

            <div className="flex items-center sm:hidden">
              <button
                  type="button"
                  className="inline-flex items-center justify-center p-3 rounded-lg text-retro-muted
                         hover:text-retro-dark hover:bg-retro-accent/10
                         focus:outline-none focus:ring-2 focus:ring-inset focus:ring-retro-accent"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                <span className="sr-only">Open main menu</span>
                {isMobileMenuOpen ? (
                    <X className="block h-7 w-7" aria-hidden="true" />
                ) : (
                    <Menu className="block h-7 w-7" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
            <div className="sm:hidden border-t-2 border-retro-accent/20 bg-white shadow-lg">
              <div className="px-4 pt-2 pb-3 space-y-2">
                {navLinks.map((link) => (
                    <NavLink
                        key={link.href}
                        to={link.href}
                        className={`block px-4 py-3 rounded-lg text-base font-medium ${
                            isActive(link.href)
                                ? 'bg-retro-accent/10 text-retro-primary font-bold'
                                : 'text-retro-primary font-bold hover:text-retro-primary/80 hover:bg-retro-accent/10'
                        }`}
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {link.label}
                    </NavLink>
                ))}
                <div className="px-3 py-3">
                  {loading ? (
                      <div className="w-full h-12 bg-retro-dark-700/10 animate-pulse rounded-lg"></div>
                  ) : isAuthenticated ? (
                      <button
                          onClick={handleSignOut}
                          className="w-full btn-secondary py-3"
                      >
                        Sign Out
                      </button>
                  ) : (
                      <NavLink
                          to="/auth"
                          className="block w-full btn-primary py-3 text-center"
                          onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Sign In
                      </NavLink>
                  )}
                </div>
              </div>
            </div>
        )}
      </nav>
  );
}

export default Navigation;