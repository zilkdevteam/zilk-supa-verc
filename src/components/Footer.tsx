import {NavLink} from 'react-router';
import { Facebook, Twitter, Instagram, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-retro-dark text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="text-2xl font-display">Zilk</h3>
            <p className="text-sm text-gray-400 max-w-xs">
              Discover amazing local deals and exclusive offers with our innovative spin-to-win platform.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-bold">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <NavLink to="/deals" className="text-gray-400 hover:text-white transition-colors inline-block py-1">
                  Browse Deals
                </NavLink>
              </li>
              <li>
                <NavLink to="/spin" className="text-gray-400 hover:text-white transition-colors inline-block py-1">
                  Spin & Win
                </NavLink>
              </li>
              <li>
                <NavLink to="/business" className="text-gray-400 hover:text-white transition-colors inline-block py-1">
                  For Business
                </NavLink>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <h4 className="text-lg font-bold">Legal</h4>
            <ul className="space-y-3">
              <li>
                <NavLink to="/privacy" className="text-gray-400 hover:text-white transition-colors inline-block py-1">
                  Privacy Policy
                </NavLink>
              </li>
              <li>
                <NavLink to="/terms" className="text-gray-400 hover:text-white transition-colors inline-block py-1">
                  Terms & Conditions
                </NavLink>
              </li>
              <li>
                <NavLink to="/cookies" className="text-gray-400 hover:text-white transition-colors inline-block py-1">
                  Cookie Policy
                </NavLink>
              </li>
            </ul>
          </div>

          {/* Contact & Social */}
          <div className="space-y-4">
            <h4 className="text-lg font-bold">Connect With Us</h4>
            <div className="flex flex-wrap gap-4">
              <a 
                href="#" 
                className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
                aria-label="Facebook"
              >
                <Facebook className="h-6 w-6" />
              </a>
              <a 
                href="#" 
                className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
                aria-label="Twitter"
              >
                <Twitter className="h-6 w-6" />
              </a>
              <a 
                href="#" 
                className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
                aria-label="Instagram"
              >
                <Instagram className="h-6 w-6" />
              </a>
              <a 
                href="mailto:contact@zilk.com" 
                className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
                aria-label="Email us"
              >
                <Mail className="h-6 w-6" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-800">
          <p className="text-center text-gray-400 text-sm">
            © {new Date().getFullYear()} Zilk. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
} 