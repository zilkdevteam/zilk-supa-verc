'use client';

import Navigation from '../components/Navigation';
import Footer from '../components/Footer';

export default function TermsPage() {
    return (
        <>
            <Navigation />
            <main className="min-h-screen bg-retro-light py-12">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-white rounded-lg shadow-retro p-8 border-2 border-retro-dark/10">
                        <h1 className="text-4xl font-display text-retro-dark mb-8">Terms & Conditions</h1>

                        <div className="prose prose-lg">
                            <p className="text-retro-muted">Last updated: {new Date().toLocaleDateString()}</p>

                            <section className="mt-8">
                                <h2 className="text-2xl font-display text-retro-dark mb-4">1. Agreement to Terms</h2>
                                <p>
                                    By accessing and using Zilk, you agree to be bound by these Terms and Conditions and our Privacy Policy.
                                    If you disagree with any part of these terms, you may not access our service.
                                </p>
                            </section>

                            <section className="mt-8">
                                <h2 className="text-2xl font-display text-retro-dark mb-4">2. Use License</h2>
                                <p>Permission is granted to temporarily access the materials (information or software) on Zilk for personal,
                                    non-commercial transitory viewing only.</p>
                                <p className="mt-4">This license shall automatically terminate if you violate any of these restrictions and may be
                                    terminated by Zilk at any time.</p>
                            </section>

                            <section className="mt-8">
                                <h2 className="text-2xl font-display text-retro-dark mb-4">3. Deals and Promotions</h2>
                                <ul className="list-disc pl-6 mt-4 space-y-2">
                                    <li>All deals are subject to availability and may be changed or withdrawn without notice</li>
                                    <li>Deals cannot be used in conjunction with other offers unless explicitly stated</li>
                                    <li>We reserve the right to refuse service to anyone for any reason at any time</li>
                                    <li>Spinning wheel prizes are randomly generated and final</li>
                                </ul>
                            </section>

                            <section className="mt-8">
                                <h2 className="text-2xl font-display text-retro-dark mb-4">4. User Responsibilities</h2>
                                <p>As a user of the Service, you agree not to:</p>
                                <ul className="list-disc pl-6 mt-4 space-y-2">
                                    <li>Use the service for any unlawful purpose</li>
                                    <li>Attempt to gain unauthorized access to any portion of the platform</li>
                                    <li>Interfere with or disrupt the service or servers</li>
                                    <li>Share account credentials with others</li>
                                    <li>Submit false or misleading information</li>
                                </ul>
                            </section>

                            <section className="mt-8">
                                <h2 className="text-2xl font-display text-retro-dark mb-4">5. Disclaimer</h2>
                                <p>
                                    The materials on Zilk's website are provided on an 'as is' basis. Zilk makes no warranties,
                                    expressed or implied, and hereby disclaims and negates all other warranties including, without
                                    limitation, implied warranties or conditions of merchantability, fitness for a particular purpose,
                                    or non-infringement of intellectual property or other violation of rights.
                                </p>
                            </section>

                            <section className="mt-8">
                                <h2 className="text-2xl font-display text-retro-dark mb-4">6. Limitations</h2>
                                <p>
                                    In no event shall Zilk or its suppliers be liable for any damages (including, without limitation,
                                    damages for loss of data or profit, or due to business interruption) arising out of the use or
                                    inability to use the materials on Zilk's website.
                                </p>
                            </section>

                            <section className="mt-8">
                                <h2 className="text-2xl font-display text-retro-dark mb-4">7. Governing Law</h2>
                                <p>
                                    These terms and conditions are governed by and construed in accordance with the laws and you
                                    irrevocably submit to the exclusive jurisdiction of the courts in that location.
                                </p>
                            </section>

                            <section className="mt-8">
                                <h2 className="text-2xl font-display text-retro-dark mb-4">8. Changes to Terms</h2>
                                <p>
                                    We reserve the right, at our sole discretion, to modify or replace these Terms at any time. By
                                    continuing to access or use our Service after those revisions become effective, you agree to be
                                    bound by the revised terms.
                                </p>
                            </section>

                            <section className="mt-8">
                                <h2 className="text-2xl font-display text-retro-dark mb-4">9. Contact Us</h2>
                                <p>
                                    If you have any questions about these Terms, please contact us at:{' '}
                                    <a href="mailto:legal@zilk.com" className="text-retro-primary hover:text-retro-primary/80">
                                        legal@zilk.com
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