import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { toast } from 'react-hot-toast';

// Create context
export const AuthContext = createContext();

// Custom hook for using auth context
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
    
    // Guard against 'undefined' string in localStorage
    const getInitialToken = () => {
        const storedToken = localStorage.getItem('token');
        return (storedToken === 'undefined' || storedToken === 'null') ? null : storedToken;
    };
    
    const [token, setToken] = useState(getInitialToken());
    const [selectedAccountType, setSelectedAccountType] = useState(localStorage.getItem('trading_mode') || 'demo');

    useEffect(() => {
        if (token) {
            loadUser();
        } else {
            setLoading(false);
        }
    }, [token]);

    const loadUser = async () => {
        if (!token || token === 'undefined' || token === 'null') {
            setLoading(false);
            return;
        }

        try {
            const response = await api.get('/users/profile');
            // Safe access to nested data
            const userData = response?.data?.data;
            
            if (userData) {
                setUser({
                    id: userData.id || userData._id,
                    email: userData.email,
                    firstName: userData.firstName || userData.first_name, // Mapping snake_case
                    lastName: userData.lastName || userData.last_name,   // Mapping snake_case
                    phone: userData.phone,
                    country: userData.country,
                    role: userData.role,
                    accounts: userData.accounts || [],
                    selectedAccountType: selectedAccountType
                });
            } else {
                throw new Error("Malformed profile data received");
            }
        } catch (error) {
            console.error('[AUTH] Profile load failed:', error.message);
            // On 401, logout will be handled by api.js interceptor or here
            if (error.response?.status === 401) {
                toast.error("Session expired. Please sign in again.");
                logout();
            }
        } finally {
            setLoading(false);
        }
    };

    const login = async (userData, token) => {
        try {
            // Store token and mode
            localStorage.setItem('token', token);
            const mode = userData.selectedAccountType || 'demo';
            localStorage.setItem('trading_mode', mode);
            
            setToken(token);
            setSelectedAccountType(mode);
            
            // Set user data
            setUser({
                id: userData._id || userData.id,
                email: userData.email,
                firstName: userData.firstName,
                lastName: userData.lastName,
                role: userData.role,
                accounts: userData.accounts || [],
                selectedAccountType: mode
            });
            
            return { success: true };
        } catch (error) {
            console.error('Context login error:', error);
            return { success: false, error: 'Login failed' };
        }
    };

    const switchAccountType = async (newType) => {
        localStorage.setItem('trading_mode', newType);
        setSelectedAccountType(newType);
        
        // Update user state before reload for instant UI feedback
        setUser(prev => prev ? ({
            ...prev,
            selectedAccountType: newType
        }) : null);
        
        // Trigger a fresh profile fetch to synchronize with the backend balances
        await loadUser();
        
        toast.success(`Switched to ${newType.toUpperCase()} mode.`);
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('trading_mode');
        localStorage.removeItem('user'); // Just in case
        setToken(null);
        setUser(null);
        setSelectedAccountType('demo');
        // Optional: window.location.href = '/login'; 
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
        isAdmin: user?.role === 'admin',
        isClient: user?.role === 'client'
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};