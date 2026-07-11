import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../../services/api';

const MaintenanceScreen = () => (
  <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24, background: '#07111f', color: '#f6d58d' }}>
    <section style={{ width: 'min(560px, 100%)', padding: '48px 32px', textAlign: 'center', border: '1px solid #22324a', borderRadius: 18, background: '#0b1726' }}>
      <div style={{ fontSize: 42, marginBottom: 18 }}>⚙</div>
      <h1 style={{ margin: '0 0 12px', fontSize: 30 }}>Scheduled maintenance</h1>
      <p style={{ margin: 0, color: '#91acd0', lineHeight: 1.7 }}>
        The platform is temporarily unavailable while we make improvements. Please check back shortly.
      </p>
    </section>
  </main>
);

export default function MaintenanceGate({ children }) {
  const location = useLocation();
  const [state, setState] = useState({ loading: true, maintenance: false });

  useEffect(() => {
    let active = true;
    api.get('/public/platform-status')
      .then((response) => {
        if (active) setState({ loading: false, maintenance: response.data?.data?.maintenance_mode === true });
      })
      .catch(() => {
        if (active) setState({ loading: false, maintenance: false });
      });
    return () => { active = false; };
  }, [location.pathname]);

  const isAdminPath = location.pathname === '/admin' || location.pathname.startsWith('/admin/');
  if (!isAdminPath && state.maintenance) return <MaintenanceScreen />;
  return children;
}
