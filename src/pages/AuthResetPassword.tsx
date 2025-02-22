import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { supabase } from '../lib/supabase';
import { Eye, EyeOff, Check, X } from 'lucide-react';
import Navigation from '../components/Navigation';

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

export default function ResetPasswordPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [formData, setFormData] = useState({
        password: '',
        confirmPassword: '',
    });

    const [showRequirements, setShowRequirements] = useState(false);

    const passwordMeetsAllRequirements = (password: string) => {
        return passwordRequirements.every(req => req.validator(password));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (!passwordMeetsAllRequirements(formData.password)) {
                throw new Error('Password does not meet all requirements.');
            }

            if (formData.password !== formData.confirmPassword) {
                throw new Error('Passwords do not match.');
            }

            const { error: updateError } = await supabase.auth.updateUser({
                password: formData.password,
            });

            if (updateError) throw updateError;

            setSuccess(true);
            setTimeout(() => {
                navigate('/auth');
            }, 3000);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
            setLoading(false);
        }
    };

    return (
        <>
            <Navigation />
            <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="max-w-md w-full">
                    <div className="bg-white rounded-lg shadow p-8">
                        <h1 className="text-2xl font-bold text-center mb-2">Reset Your Password</h1>
                        <p className="text-sm text-gray-600 text-center mb-8">
                            Enter your new password below
                        </p>

                        {error && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm">
                                {error}
                            </div>
                        )}

                        {success ? (
                            <div className="text-center">
                                <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-600 rounded-md">
                                    Password successfully reset! Redirecting to login...
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                        New Password
                                    </label>
                                    <div className="relative mt-1">
                                        <input
                                            id="password"
                                            type={showPassword ? 'text' : 'password'}
                                            required
                                            value={formData.password}
                                            onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                                            onFocus={() => setShowRequirements(true)}
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
                                    {showRequirements && (
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

                                <div>
                                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                                        Confirm New Password
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

                                <button
                                    type="submit"
                                    disabled={loading || !passwordMeetsAllRequirements(formData.password) || formData.password !== formData.confirmPassword}
                                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? 'Resetting...' : 'Reset Password'}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </main>
        </>
    );
}