'use client';

import { useState, useEffect } from 'react';
import {NavLink} from 'react-router'
import { X, Settings } from 'lucide-react';

interface CookieSettings {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
}

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState<CookieSettings>({
    necessary: true, // Always true and can't be changed
    analytics: true,
    marketing: false,
    preferences: true,
  });

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      setIsVisible(true);
    } else {
      // Load saved settings
      try {
        const savedSettings = JSON.parse(consent);
        setSettings(savedSettings);
      } catch (error) {
        console.error('Error parsing cookie settings:', error);
      }
    }
  }, []);

  const handleAcceptAll = () => {
    const allSettings: CookieSettings = {
      necessary: true,
      analytics: true,
      marketing: true,
      preferences: true,
    };
    localStorage.setItem('cookie-consent', JSON.stringify(allSettings));
    setSettings(allSettings);
    setIsVisible(false);
    setShowSettings(false);
  };

  const handleSaveSettings = () => {
    localStorage.setItem('cookie-consent', JSON.stringify(settings));
    setIsVisible(false);
    setShowSettings(false);
  };

  const handleReject = () => {
    const minimalSettings: CookieSettings = {
      necessary: true,
      analytics: false,
      marketing: false,
      preferences: false,
    };
    localStorage.setItem('cookie-consent', JSON.stringify(minimalSettings));
    setSettings(minimalSettings);
    setIsVisible(false);
    setShowSettings(false);
  };

  if (!isVisible && !showSettings) return null;

  return (
    <>
      {/* Cookie Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-display text-retro-dark">Cookie Settings</h2>
                <button
                  onClick={() => setShowSettings(false)}
                  className="text-retro-muted hover:text-retro-dark transition-colors"
                  aria-label="Close cookie settings"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Necessary Cookies */}
                <div className="flex items-start justify-between p-4 bg-retro-light rounded-lg">
                  <div>
                    <h3 className="font-bold text-retro-dark">Necessary Cookies</h3>
                    <p className="text-sm text-retro-muted mt-1">
                      These cookies are required for the website to function and cannot be disabled.
                    </p>
                  </div>
                  <div className="ml-4">
                    <input
                      type="checkbox"
                      id="necessary-cookies"
                      checked={settings.necessary}
                      disabled
                      className="h-4 w-4 text-retro-primary rounded border-retro-dark/20"
                      aria-label="Necessary cookies (required)"
                    />
                  </div>
                </div>

                {/* Analytics Cookies */}
                <div className="flex items-start justify-between p-4 bg-retro-light rounded-lg">
                  <div>
                    <h3 className="font-bold text-retro-dark">Analytics Cookies</h3>
                    <p className="text-sm text-retro-muted mt-1">
                      Help us understand how visitors interact with our website.
                    </p>
                  </div>
                  <div className="ml-4">
                    <input
                      type="checkbox"
                      id="analytics-cookies"
                      checked={settings.analytics}
                      onChange={(e) => setSettings({ ...settings, analytics: e.target.checked })}
                      className="h-4 w-4 text-retro-primary rounded border-retro-dark/20"
                      aria-label="Analytics cookies"
                    />
                  </div>
                </div>

                {/* Marketing Cookies */}
                <div className="flex items-start justify-between p-4 bg-retro-light rounded-lg">
                  <div>
                    <h3 className="font-bold text-retro-dark">Marketing Cookies</h3>
                    <p className="text-sm text-retro-muted mt-1">
                      Used to track visitors across websites to display relevant advertisements.
                    </p>
                  </div>
                  <div className="ml-4">
                    <input
                      type="checkbox"
                      id="marketing-cookies"
                      checked={settings.marketing}
                      onChange={(e) => setSettings({ ...settings, marketing: e.target.checked })}
                      className="h-4 w-4 text-retro-primary rounded border-retro-dark/20"
                      aria-label="Marketing cookies"
                    />
                  </div>
                </div>

                {/* Preferences Cookies */}
                <div className="flex items-start justify-between p-4 bg-retro-light rounded-lg">
                  <div>
                    <h3 className="font-bold text-retro-dark">Preferences Cookies</h3>
                    <p className="text-sm text-retro-muted mt-1">
                      Enable the website to remember your preferences and customize your experience.
                    </p>
                  </div>
                  <div className="ml-4">
                    <input
                      type="checkbox"
                      id="preferences-cookies"
                      checked={settings.preferences}
                      onChange={(e) => setSettings({ ...settings, preferences: e.target.checked })}
                      className="h-4 w-4 text-retro-primary rounded border-retro-dark/20"
                      aria-label="Preferences cookies"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-end gap-4">
                <button
                  onClick={handleReject}
                  className="px-4 py-2 text-sm font-medium text-retro-muted hover:text-retro-dark transition-colors"
                >
                  Reject All
                </button>
                <button
                  onClick={handleAcceptAll}
                  className="px-4 py-2 text-sm font-medium text-retro-muted hover:text-retro-dark transition-colors"
                >
                  Accept All
                </button>
                <button
                  onClick={handleSaveSettings}
                  className="px-6 py-2 bg-retro-primary text-white text-sm font-medium rounded-lg hover:bg-retro-primary/90 transition-colors"
                >
                  Save Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cookie Consent Banner */}
      {isVisible && !showSettings && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-retro-dark/10 p-4 shadow-lg z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex-1 pr-8 sm:pr-4">
                <p className="text-sm text-retro-dark">
                  We use cookies to enhance your experience. By continuing to visit this site you agree to our use of cookies.{' '}
                  <NavLink to="/cookies" className="text-retro-primary hover:text-retro-primary/80 underline">
                    Learn more
                  </NavLink>
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={() => setShowSettings(true)}
                  className="inline-flex items-center justify-center px-4 py-2.5 text-sm font-medium text-retro-muted hover:text-retro-dark transition-colors border-2 border-retro-dark/10 rounded-lg gap-2"
                >
                  <Settings className="h-4 w-4" />
                  Cookie Settings
                </button>
                <button
                  onClick={handleAcceptAll}
                  className="px-6 py-2.5 bg-retro-primary text-white text-sm font-medium rounded-lg hover:bg-retro-primary/90 transition-colors"
                >
                  Accept All
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 