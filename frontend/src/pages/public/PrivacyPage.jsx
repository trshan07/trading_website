import React from 'react';
import Container from '../../components/layout/Container';
import SectionTitle from '../../components/ui/SectionTitle';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';

const PrivacyPage = () => {
  return (
    <main className="bg-navy min-h-screen">
      <Navbar />
      <div className="pt-32 pb-24">
        <Container>
          <SectionTitle subtitle="Legal & Privacy" title="Privacy Policy" />
          <div className="max-w-4xl mx-auto glass-card p-12 rounded-3xl border-white/5">
            <div className="prose prose-invert max-w-none">
              <p className="text-white/60 mb-8 leading-relaxed">
                At Rizals Trade, we are committed to protecting the privacy and security of our clients' personal and financial information. This Privacy Policy outlines how we collect, use, and safeguard your data.
              </p>

              <h3 className="text-2xl font-display font-bold text-gold mb-6">1. Information Collection</h3>
              <p className="text-white/60 mb-8 leading-relaxed">
                We collect information necessary to provide you with our services, including but not limited to identification data, contact information, financial historical data, and technical data related to your trading activities.
              </p>

              <h3 className="text-2xl font-display font-bold text-gold mb-6">2. Use of Information</h3>
              <p className="text-white/60 mb-8 leading-relaxed">
                Your data is used to verify your identity, process trading transactions, maintain your account, improve our services, and comply with regulatory requirements.
              </p>

              <h3 className="text-2xl font-display font-bold text-gold mb-6">3. Data Protection</h3>
              <p className="text-white/60 mb-8 leading-relaxed">
                We implement robust technical and organizational measures, including encryption and secure servers, to protect your personal information from unauthorized access, loss, or disclosure.
              </p>

              <h3 className="text-2xl font-display font-bold text-gold mb-6">4. Third-Party Disclosure</h3>
              <p className="text-white/60 mb-8 leading-relaxed">
                We do not sell your data. We only share information with third-party service providers or regulators as required to facilitate our services and comply with applicable laws.
              </p>
            </div>
          </div>
        </Container>
      </div>
      <Footer />
    </main>
  );
};

export default PrivacyPage;
