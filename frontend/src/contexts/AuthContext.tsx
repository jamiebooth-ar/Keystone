import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';

interface AuthContextType {
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<boolean>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const auth = localStorage.getItem('keystone_auth');
        if (auth === 'true') {
            setIsAuthenticated(true);
        }
    }, []);

    const login = async (email: string, password: string) => {
        try {
            // Using the new Backend API
            const response = await api.post('/auth/login', { email, password });

            if (response.data && response.data.token) {
                setIsAuthenticated(true);
                localStorage.setItem('keystone_auth', 'true');
                localStorage.setItem('keystone_user', JSON.stringify(response.data));
                return true;
            }
            return false;
        } catch (error) {
            console.error("Login failed", error);
            return false;
        }
    };

    const logout = () => {
        setIsAuthenticated(false);
        localStorage.removeItem('keystone_auth');
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
