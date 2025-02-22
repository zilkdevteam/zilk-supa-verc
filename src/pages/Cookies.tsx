'use client';

import Navigation from "../components/Navigation.tsx";
import Footer from '../components/Footer.tsx';
import { Settings } from 'lucide-react';

export default function CookiePolicyPage() {
    return (
        <div className="min-h-screen flex flex-col">
            <Navigation />
            <main className="flex-grow bg-retro-light py-12">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-white rounded-lg shadow-retro p-8 border-2 border-retro-dark/10">
                        <h1 className="text-4xl font-display text-retro-dark mb-8">Cookie Policy</h1>

                        <div className="prose prose-lg">
                            <p className="text-retro-muted">Last updated: {new Date().toLocaleDateString()}</p>

                            <section className="mt-8">
                                <h2 className="text-2xl font-display text-retro-dark mb-4">What Are Cookies?</h2>
                                <p>
                                    Cookies are small text files that are stored on your computer or mobile device when you visit a website.
                                    They are widely used to make websites work more efficiently and provide valuable information to website owners.
                                </p>
                            </section>

                            <section className="mt-8">
                                <h2 className="text-2xl font-display text-retro-dark mb-4">How We Use Cookies</h2>
                                <p>
                                    We use different types of cookies for different purposes. Some cookies are necessary for technical reasons,
                                    while others enable a personalized experience for both visitors and registered users.
                                </p>

                                <div className="mt-6 space-y-6">
                                    <div className="p-4 bg-retro-light rounded-lg">
                                        <h3 className="font-bold text-retro-dark">Necessary Cookies</h3>
                                        <p className="text-sm text-retro-muted mt-1">
                                            Required for the website to function properly. They enable basic functions like page navigation,
                                            access to secure areas, and form submissions. The website cannot function properly without these cookies.
                                        </p>
                                    </div>

                                    <div className="p-4 bg-retro-light rounded-lg">
                                        <h3 className="font-bold text-retro-dark">Analytics Cookies</h3>
                                        <p className="text-sm text-retro-muted mt-1">
                                            Help us understand how visitors interact with our website by collecting and reporting information
                                            anonymously. This helps us improve our website's structure and content.
                                        </p>
                                    </div>

                                    <div className="p-4 bg-retro-light rounded-lg">
                                        <h3 className="font-bold text-retro-dark">Marketing Cookies</h3>
                                        <p className="text-sm text-retro-muted mt-1">
                                            Used to track visitors across websites to display relevant advertisements. They are used by
                                            third-party advertisers to build a profile of your interests and show relevant ads on other sites.
                                        </p>
                                    </div>

                                    <div className="p-4 bg-retro-light rounded-lg">
                                        <h3 className="font-bold text-retro-dark">Preferences Cookies</h3>
                                        <p className="text-sm text-retro-muted mt-1">
                                            Enable the website to remember information that changes how the website behaves or looks,
                                            like your preferred language or the region you are in.
                                        </p>
                                    </div>
                                </div>
                            </section>

                            <section className="mt-8">
                                <h2 className="text-2xl font-display text-retro-dark mb-4">Managing Cookies</h2>
                                <p>
                                    You can manage your cookie preferences at any time by clicking the "Cookie Settings" button below.
                                    You can choose to accept or reject specific categories of cookies.
                                </p>
                                <p className="mt-4">
                                    Most web browsers also allow you to manage cookies through their settings. You can:
                                </p>
                                <ul className="list-disc pl-6 mt-4 space-y-2">
                                    <li>View cookies stored on your computer</li>
                                    <li>Delete all or specific cookies</li>
                                    <li>Block third-party cookies</li>
                                    <li>Block cookies from particular sites</li>
                                    <li>Block all cookies</li>
                                    <li>Delete all cookies when you close your browser</li>
                                </ul>
                                <p className="mt-4 text-retro-muted">
                                    Please note that if you choose to block certain cookies, some features of our website may not function correctly.
                                </p>
                            </section>

                            <section className="mt-8">
                                <h2 className="text-2xl font-display text-retro-dark mb-4">Updates to This Policy</h2>
                                <p>
                                    We may update this Cookie Policy from time to time to reflect changes in technology, legislation,
                                    or our data practices. When we make changes, we will update the "Last updated" date at the top
                                    of this policy.
                                </p>
                            </section>

                            <section className="mt-8">
                                <h2 className="text-2xl font-display text-retro-dark mb-4">Contact Us</h2>
                                <p>
                                    If you have any questions about our use of cookies, please contact us at:{' '}
                                    <a href="mailto:privacy@zilk.com" className="text-retro-primary hover:text-retro-primary/80">
                                        privacy@zilk.com
                                    </a>
                                </p>
                            </section>

                            <div className="mt-12 flex justify-center">
                                <button
                                    onClick={() => {
                                        // This will trigger the cookie settings modal by clearing the localStorage
                                        localStorage.removeItem('cookie-consent');
                                        window.location.reload();
                                    }}
                                    className="inline-flex items-center justify-center px-6 py-3 text-base font-medium text-white bg-retro-primary hover:bg-retro-primary/90 transition-colors rounded-lg shadow-retro gap-2"
                                >
                                    <Settings className="h-5 w-5" />
                                    Manage Cookie Settings
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}