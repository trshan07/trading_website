import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

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
    const [token, setToken] = useState(localStorage.getItem('token'));

    useEffect(() => {
        if (token) {
            loadUser();
        } else {
            setLoading(false);
        }
    }, [token]);

    const loadUser = async () => {
        try {
            const response = await api.get('/user/profile');
            const userData = response.data.data.user;
            
            setUser({
                id: userData.id || userData._id,
                email: userData.email,
                firstName: userData.firstName || userData.first_name,
                lastName: userData.lastName || userData.last_name,
                role: userData.role,
                accounts: userData.accounts || [],
                selectedAccountType: userData.selectedAccountType || 'demo'
            });
        } catch (error) {
            console.error('Error loading user:', error);
            logout();
        } finally {
            setLoading(false);
        }
    };

    
const login = async (userData, token) => {
  try {
    // Store token
    localStorage.setItem('token', token);
    setToken(token);
    
    // Set user data
    setUser({
      id: userData._id || userData.id,
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      role: userData.role,
      accounts: userData.accounts || [],
      selectedAccountType: userData.selectedAccountType || 'demo'
    });
    
    return { success: true };
  } catch (error) {
    console.error('Context login error:', error);
    return { success: false, error: 'Login failed' };
  }
};

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
    };

    const value = {
        user,
        loading,
        login,
        logout,
        isAdmin: user?.role === 'admin',
        isClient: user?.role === 'client'
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};