import { useEffect } from 'react';
import { WEBTRADER_URL } from '../../config/externalLinks';

const ExternalRedirect = () => {
  useEffect(() => {
    window.location.replace(WEBTRADER_URL);
  }, []);

  return (
    <main className="min-h-screen bg-navy flex items-center justify-center text-white">
      <p className="font-semibold">Opening TikTrades WebTrader…</p>
    </main>
  );
};

export default ExternalRedirect;
