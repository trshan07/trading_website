import React from 'react';
import Container from '../../components/layout/Container';
import SectionTitle from '../../components/ui/SectionTitle';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';

const RiskDisclaimerPage = () => {
  return (
    <main className="bg-navy min-h-screen">
      <Navbar />
      <div className="pt-32 pb-24">
        <Container>
          <SectionTitle subtitle="Important Warning" title="Risk Disclaimer" />
          <div className="max-w-4xl mx-auto glass-card p-12 rounded-3xl border-gold/20 shadow-gold-glow-sm bg-navy-dark/40">
            <div className="prose prose-invert max-w-none">
              <div className="bg-gold/10 border-l-4 border-gold p-6 mb-10 rounded-r-xl">
                <p className="text-gold font-bold uppercase tracking-widest text-sm mb-2">High Risk Investment Warning:</p>
                <p className="text-white/80 leading-relaxed font-medium italic">
                  "Trading foreign exchange and CFDs on margin carries a high level of risk and may not be suitable for all investors."
                </p>
              </div>

              <h3 className="text-2xl font-display font-bold text-gold mb-6 uppercase tracking-widest">1. Leverage Risk</h3>
              <p className="text-white/60 mb-8 leading-relaxed">
                The high degree of leverage available in trading can work against you as well as for you. Before deciding to trade, you should carefully consider your investment objectives, level of experience, and risk appetite.
              </p>

              <h3 className="text-2xl font-display font-bold text-gold mb-6 uppercase tracking-widest">2. Market Volatility</h3>
              <p className="text-white/60 mb-8 leading-relaxed">
                Markets are subject to unpredictable shifts in sentiment and price. Rapid price movements can lead to substantial losses that can exceed your initial deposit in some circumstances.
              </p>

              <h3 className="text-2xl font-display font-bold text-gold mb-6 uppercase tracking-widest">3. Technical Risks</h3>
              <p className="text-white/60 mb-8 leading-relaxed">
                System failures, connectivity issues, and execution delays are inherent risks of online trading. Rizals Trade utilizes institutional-grade technology to minimize these risks, but they cannot be entirely eliminated.
              </p>

              <div className="mt-12 pt-8 border-t border-white/10 text-center">
                <p className="text-white/40 text-xs italic">
                  By using our services, you acknowledge that you have read and understood these risks and are capable of assuming the financial consequences of your trading decisions.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </div>
      <Footer />
    </main>
  );
};

export default RiskDisclaimerPage;
