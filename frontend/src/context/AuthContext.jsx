import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { toast } from 'react-hot-toast';

export const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const getInitialToken = () => {
        const storedToken = localStorage.getItem('token');
        return storedToken === 'undefined' || storedToken === 'null' ? null : storedToken;
    };

    const [token, setToken] = useState(getInitialToken());
    const [selectedAccountType, setSelectedAccountType] = useState(
        localStorage.getItem('trading_mode') || 'demo'
    );

    useEffect(() => {
        if (token) {
            loadUser();
        } else {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        const handleSessionExpired = () => {
            console.warn('[AUTH] Session expired event received. Logging out.');
            toast.error('Your session has expired. Please sign in again.');
            logout();
            window.location.href = '/login';
        };

        window.addEventListener('auth:session-expired', handleSessionExpired);
        return () => window.removeEventListener('auth:session-expired', handleSessionExpired);
    }, []);

    const loadUser = async (tokenOverride = token, accountTypeOverride = selectedAccountType) => {
        if (!tokenOverride || tokenOverride === 'undefined' || tokenOverride === 'null') {
            setUser(null);
            setLoading(false);
            return null;
        }

        try {
            let role = 'client';

            try {
                const payload = JSON.parse(atob(tokenOverride.split('.')[1]));
                role = payload.role || 'client';
            } catch (_) {}

            const endpoint =
                role === 'admin' || role === 'super_admin' ? '/admin/profile' : '/users/profile';

            const response = await api.get(endpoint);
            const userData = response?.data?.data;

            if (!userData) {
                throw new Error('Malformed profile data received');
            }

            const normalizedUser = {
                id: userData.id || userData._id,
                email: userData.email,
                firstName: userData.firstName || userData.first_name,
                lastName: userData.lastName || userData.last_name,
                phone: userData.phone,
                country: userData.country,
                role: userData.role,
                accounts: userData.accounts || [],
                selectedAccountType: accountTypeOverride,
            };

            setUser(normalizedUser);
            return normalizedUser;
        } catch (error) {
            const status = error.response?.status;
            console.error(`[AUTH] Profile load failed (HTTP ${status}):`, error.message);

            if (status === 401) {
                toast.error('Session expired. Please sign in again.');
                logout();
            } else if (status >= 500) {
                // Server error: keep the token intact in case the session is still valid.
                toast.error('Unable to load your profile. Please refresh the page.');
            } else if (!status) {
                toast.error('Network error. Please check your connection.');
            }

            return null;
        } finally {
            setLoading(false);
        }
    };

    const login = async (userData, authToken) => {
        try {
            setLoading(true);
            localStorage.setItem('token', authToken);
            const mode = userData.selectedAccountType || 'demo';
            localStorage.setItem('trading_mode', mode);

            setToken(authToken);
            setSelectedAccountType(mode);

            setUser({
                id: userData._id || userData.id,
                email: userData.email,
                firstName: userData.firstName,
                lastName: userData.lastName,
                role: userData.role,
                accounts: userData.accounts || [],
                selectedAccountType: mode,
            });

            const verifiedUser = await loadUser(authToken, mode);
            if (!verifiedUser) {
                return { success: false, error: 'Unable to verify your session' };
            }

            return { success: true, user: verifiedUser };
        } catch (error) {
            console.error('Context login error:', error);
            setLoading(false);
            return { success: false, error: 'Login failed' };
        }
    };

    const switchAccountType = async (newType) => {
        localStorage.setItem('trading_mode', newType);
        setSelectedAccountType(newType);

        setUser((prev) =>
            prev
                ? {
                      ...prev,
                      selectedAccountType: newType,
                  }
                : null
        );

        await loadUser();
        toast.success(`Switched to ${newType.toUpperCase()} mode.`);
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('trading_mode');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
        setSelectedAccountType('demo');
    };

    const value = {
        user,
        setUser,
        loading,
        token,
        login,
        logout,
        refreshUser: loadUser,
        selectedAccountType,
        switchAccountType,
        isAdmin: user?.role === 'admin' || user?.role === 'super_admin',
        isSuperAdmin: user?.role === 'super_admin',
        isClient: user?.role === 'client',
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
