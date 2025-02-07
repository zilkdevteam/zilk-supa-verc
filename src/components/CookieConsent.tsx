import { useState, useEffect } from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    setIsVisible(false);
  };

  const handleReject = () => {
    localStorage.setItem('cookie-consent', 'rejected');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-retro-dark/10 p-4 shadow-lg z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex-1 pr-8 sm:pr-4">
            <p className="text-sm text-retro-dark">
              We use cookies to enhance your experience. By continuing to visit this site you agree to our use of cookies.{' '}
              <Link href="/cookies" className="text-retro-primary hover:text-retro-primary/80 underline inline-flex items-center">
                Learn more
              </Link>
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
            <button
              onClick={handleReject}
              className="px-4 py-2.5 text-sm font-medium text-retro-muted hover:text-retro-dark transition-colors border-2 border-retro-dark/10 rounded-lg w-full sm:w-auto"
            >
              Reject All
            </button>
            <button
              onClick={handleAccept}
              className="px-4 py-2.5 bg-retro-primary text-white text-sm font-medium rounded-lg hover:bg-retro-primary/90 transition-colors w-full sm:w-auto"
            >
              Accept All
            </button>
          </div>
          <button
            onClick={handleReject}
            className="absolute top-4 right-4 sm:hidden text-retro-muted hover:text-retro-dark transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
} 