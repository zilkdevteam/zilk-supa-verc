'use client';

import { Navigation } from '@/components/Navigation';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Eye, EyeOff, Check, X, Mail } from 'lucide-react';

interface PasswordRequirement {
  text: string;
  validator: (password: string) => boolean;
}

const passwordRequirements: PasswordRequirement[] = [
  {
    text: 'At least 8 characters long',
    validator: (password) => password.length >= 8,
  },
  {
    text: 'Contains at least one uppercase letter',
    validator: (password) => /[A-Z]/.test(password),
  },
  {
    text: 'Contains at least one lowercase letter',
    validator: (password) => /[a-z]/.test(password),
  },
  {
    text: 'Contains at least one number',
    validator: (password) => /\d/.test(password),
  },
  {
    text: 'Contains at least one special character (!@#$%^&*)',
    validator: (password) => /[!@#$%^&*]/.test(password),
  },
];

export default function AuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get('returnTo');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    adminPassword: '',
  });

  const [showRequirements, setShowRequirements] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetStatus, setResetStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string | null;
  }>({ type: null, message: null });

  const passwordMeetsAllRequirements = (password: string) => {
    return passwordRequirements.every(req => req.validator(password));
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event) => {
      if (event === 'SIGNED_IN') {
        // Check if business exists
        const { data: business } = await supabase
          .from('businesses')
          .select('id')
          .eq('id', (await supabase.auth.getUser()).data.user?.id)
          .single();

        if (returnTo) {
          router.push(returnTo);
        } else if (!business) {
          router.push('/business/onboarding');
        } else {
          router.push('/business/dashboard');
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router, returnTo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isRegistering) {
        // Registration mode
        // Check password requirements
        if (!passwordMeetsAllRequirements(formData.password)) {
          throw new Error('Password does not meet all requirements.');
        }

        // First verify the admin password
        if (formData.adminPassword !== process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
          throw new Error('Invalid admin password. Please contact Zilk support.');
        }

        // Verify passwords match
        if (formData.password !== formData.confirmPassword) {
          throw new Error('Passwords do not match.');
        }

        const { error: signUpError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
        });

        if (signUpError) throw signUpError;
      } else {
        // Sign in mode
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (signInError) throw signInError;
      }

      // Auth was successful, navigation will be handled by the auth state change listener
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResetStatus({ type: null, message: null });

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) throw error;

      setResetStatus({
        type: 'success',
        message: 'Check your email for the password reset link',
      });
      setResetEmail('');
    } catch (err) {
      setResetStatus({
        type: 'error',
        message: err instanceof Error ? err.message : 'An error occurred',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-lg shadow p-8">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {isRegistering ? 'Register Your Business' : 'Sign In to Zilk Business'}
              </h1>
              <p className="text-sm text-gray-600">
                {isRegistering ? 'Create your business account' : 'Manage your deals and view analytics'}
              </p>
            </div>

            {/* Auth Mode Toggle */}
            <div className="flex justify-center mb-8">
              <div className="bg-gray-100 p-1 rounded-lg inline-flex">
                <button
                  onClick={() => setIsRegistering(false)}
                  className={`px-4 py-2 text-sm font-medium rounded-md ${
                    !isRegistering
                      ? 'bg-white text-gray-900 shadow'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => setIsRegistering(true)}
                  className={`px-4 py-2 text-sm font-medium rounded-md ${
                    isRegistering
                      ? 'bg-white text-gray-900 shadow'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  Register
                </button>
              </div>
            </div>

            {!showForgotPassword ? (
              <>
                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Business Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                      placeholder="your@business.com"
                    />
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                      Password
                    </label>
                    <div className="relative mt-1">
                      <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={formData.password}
                        onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                        onFocus={() => isRegistering && setShowRequirements(true)}
                        className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3"
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5 text-gray-400" />
                        ) : (
                          <Eye className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                    {isRegistering && showRequirements && (
                      <div className="mt-2 space-y-2">
                        {passwordRequirements.map((req, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            {req.validator(formData.password) ? (
                              <Check className="h-4 w-4 text-green-500" />
                            ) : (
                              <X className="h-4 w-4 text-red-500" />
                            )}
                            <span className={`text-sm ${
                              req.validator(formData.password) ? 'text-green-600' : 'text-gray-600'
                            }`}>
                              {req.text}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {isRegistering && (
                    <>
                      <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                          Confirm Password
                        </label>
                        <div className="relative mt-1">
                          <input
                            id="confirmPassword"
                            type={showConfirmPassword ? 'text' : 'password'}
                            required
                            value={formData.confirmPassword}
                            onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                            className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute inset-y-0 right-0 flex items-center pr-3"
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="h-5 w-5 text-gray-400" />
                            ) : (
                              <Eye className="h-5 w-5 text-gray-400" />
                            )}
                          </button>
                        </div>
                        {formData.confirmPassword && (
                          <div className="mt-1">
                            {formData.password === formData.confirmPassword ? (
                              <div className="flex items-center space-x-1 text-green-600">
                                <Check className="h-4 w-4" />
                                <span className="text-sm">Passwords match</span>
                              </div>
                            ) : (
                              <div className="flex items-center space-x-1 text-red-600">
                                <X className="h-4 w-4" />
                                <span className="text-sm">Passwords do not match</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <div>
                        <label htmlFor="adminPassword" className="block text-sm font-medium text-gray-700">
                          Zilk Admin Password
                        </label>
                        <div className="relative mt-1">
                          <input
                            id="adminPassword"
                            type={showAdminPassword ? 'text' : 'password'}
                            required
                            value={formData.adminPassword}
                            onChange={(e) => setFormData(prev => ({ ...prev, adminPassword: e.target.value }))}
                            className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                            placeholder="Contact Zilk support for this password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowAdminPassword(!showAdminPassword)}
                            className="absolute inset-y-0 right-0 flex items-center pr-3"
                          >
                            {showAdminPassword ? (
                              <EyeOff className="h-5 w-5 text-gray-400" />
                            ) : (
                              <Eye className="h-5 w-5 text-gray-400" />
                            )}
                          </button>
                        </div>
                        <p className="mt-1 text-sm text-gray-500">
                          Required for business registration. Contact Zilk support to get access.
                        </p>
                      </div>
                    </>
                  )}

                  {!isRegistering && (
                    <div className="flex items-center justify-end">
                      <button
                        type="button"
                        onClick={() => setShowForgotPassword(true)}
                        className="text-sm font-medium text-primary-600 hover:text-primary-500"
                      >
                        Forgot your password?
                      </button>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading || (isRegistering && (!passwordMeetsAllRequirements(formData.password) || formData.password !== formData.confirmPassword))}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Please wait...' : (isRegistering ? 'Register' : 'Sign In')}
                  </button>
                </form>
              </>
            ) : (
              <div>
                <button
                  onClick={() => {
                    setShowForgotPassword(false);
                    setResetStatus({ type: null, message: null });
                  }}
                  className="mb-6 text-sm font-medium text-gray-500 hover:text-gray-700 flex items-center"
                >
                  ← Back to sign in
                </button>

                <h2 className="text-xl font-bold text-gray-900 mb-2">Reset your password</h2>
                <p className="text-sm text-gray-600 mb-6">
                  Enter your business email address and we'll send you instructions to reset your password.
                </p>

                {resetStatus.type && (
                  <div
                    className={`mb-4 p-3 rounded-md text-sm ${
                      resetStatus.type === 'success'
                        ? 'bg-green-50 border border-green-200 text-green-600'
                        : 'bg-red-50 border border-red-200 text-red-600'
                    }`}
                  >
                    {resetStatus.message}
                  </div>
                )}

                <form onSubmit={handleForgotPassword} className="space-y-6">
                  <div>
                    <label htmlFor="resetEmail" className="block text-sm font-medium text-gray-700">
                      Business Email
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="email"
                        id="resetEmail"
                        required
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        className="block w-full pl-10 rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                        placeholder="your@business.com"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Sending...' : 'Send reset instructions'}
                  </button>
                </form>
              </div>
            )}
          </div>
          <p className="mt-4 text-center text-sm text-gray-600">
            By {isRegistering ? 'registering' : 'signing in'}, you agree to our{' '}
            <a href="/terms" className="text-primary-600 hover:text-primary-500">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="/privacy" className="text-primary-600 hover:text-primary-500">
              Privacy Policy
            </a>
          </p>
        </div>
      </main>
    </>
  );
} 