'use client';

import Navigation from '../components/Navigation';
import Footer from '../components/Footer';

export default function PrivacyPolicyPage() {
    return (
        <>
            <Navigation />
            <main className="min-h-screen bg-retro-light py-12">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-white rounded-lg shadow-retro p-8 border-2 border-retro-dark/10">
                        <h1 className="text-4xl font-display text-retro-dark mb-8">Privacy Policy</h1>

                        <div className="prose prose-lg">
                            <p className="text-retro-muted">Last updated: {new Date().toLocaleDateString()}</p>

                            <section className="mt-8">
                                <h2 className="text-2xl font-display text-retro-dark mb-4">1. Introduction</h2>
                                <p>
                                    Welcome to Zilk. We respect your privacy and are committed to protecting your personal data.
                                    This privacy policy will inform you about how we look after your personal data when you visit
                                    our website and tell you about your privacy rights and how the law protects you.
                                </p>
                            </section>

                            <section className="mt-8">
                                <h2 className="text-2xl font-display text-retro-dark mb-4">2. Data We Collect</h2>
                                <p>We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows:</p>
                                <ul className="list-disc pl-6 mt-4 space-y-2">
                                    <li>Identity Data: name, username</li>
                                    <li>Contact Data: email address, phone number</li>
                                    <li>Technical Data: IP address, browser type, location</li>
                                    <li>Usage Data: information about how you use our website and services</li>
                                    <li>Marketing Data: your preferences in receiving marketing from us</li>
                                </ul>
                            </section>

                            <section className="mt-8">
                                <h2 className="text-2xl font-display text-retro-dark mb-4">3. How We Use Your Data</h2>
                                <p>We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:</p>
                                <ul className="list-disc pl-6 mt-4 space-y-2">
                                    <li>To provide our services to you</li>
                                    <li>To improve our website and services</li>
                                    <li>To communicate with you about deals and offers</li>
                                    <li>To comply with legal obligations</li>
                                </ul>
                            </section>

                            <section className="mt-8">
                                <h2 className="text-2xl font-display text-retro-dark mb-4">4. Data Security</h2>
                                <p>
                                    We have put in place appropriate security measures to prevent your personal data from being
                                    accidentally lost, used, or accessed in an unauthorized way, altered, or disclosed.
                                </p>
                            </section>

                            <section className="mt-8">
                                <h2 className="text-2xl font-display text-retro-dark mb-4">5. Your Rights</h2>
                                <p>Under certain circumstances, you have rights under data protection laws in relation to your personal data, including the right to:</p>
                                <ul className="list-disc pl-6 mt-4 space-y-2">
                                    <li>Request access to your personal data</li>
                                    <li>Request correction of your personal data</li>
                                    <li>Request erasure of your personal data</li>
                                    <li>Object to processing of your personal data</li>
                                    <li>Request restriction of processing your personal data</li>
                                    <li>Request transfer of your personal data</li>
                                    <li>Right to withdraw consent</li>
                                </ul>
                            </section>

                            <section className="mt-8">
                                <h2 className="text-2xl font-display text-retro-dark mb-4">6. Contact Us</h2>
                                <p>
                                    If you have any questions about this privacy policy or our privacy practices, please contact us at:{' '}
                                    <a href="mailto:privacy@zilk.com" className="text-retro-primary hover:text-retro-primary/80">
                                        privacy@zilk.com
                                    </a>
                                </p>
                            </section>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}