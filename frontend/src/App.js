// frontend/src/App.js
import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Context Providers
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';

// Routes
import AppRoutes from './router/AppRoutes';

function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <ThemeProvider>
          <NotificationProvider>
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#00143D',
                  color: '#EBB900',
                  fontFamily: 'Raleway, sans-serif',
                },
              }}
            />
            <AppRoutes />
          </NotificationProvider>
        </ThemeProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;