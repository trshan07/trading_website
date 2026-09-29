// frontend/src/components/common/ProtectedRoute.js
import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user, loading } = useContext(AuthContext);
    
    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                background: '#00143D'
            }}>
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gold">Loading your dashboard...</p>
                </div>
            </div>
        );
    }
    
    if (!user) {
        const isAdminRoute = allowedRoles?.some((role) => role === 'admin' || role === 'super_admin');
        return <Navigate to={isAdminRoute ? "/admin/login" : "/webtrader"} replace />;
    }
    
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        // Redirect to appropriate dashboard based on role
        if (user.role === 'admin' || user.role === 'super_admin') {
            return <Navigate to="/admin" replace />;
        } else {
            return <Navigate to="/dashboard" replace />;
        }
    }
    
    return children;
};

export default ProtectedRoute;
