import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for a logged-in user in session storage to persist login
    try {
        const storedUser = sessionStorage.getItem('currentUser');
        const token = sessionStorage.getItem('authToken');
        if (storedUser && token) {
            setUser(JSON.parse(storedUser));
        }
    } catch (error) {
        console.error("Could not parse user from session storage", error);
        sessionStorage.removeItem('currentUser');
        sessionStorage.removeItem('authToken');
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    try {
        const response = await fetch('http://127.0.0.1:8000/user/auth/login/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: email,
                password: password,
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            const errorMessage = data.non_field_errors?.[0] || 'An unknown error occurred.';
            throw new Error(errorMessage);
        }
        
        const loggedInUser: User = {
            id: data.user.id,
            email: data.user.email,
            role: data.user.role,
            name: data.user.email.split('@')[0], // Derive name from email as API doesn't provide it
        };

        setUser(loggedInUser);
        sessionStorage.setItem('currentUser', JSON.stringify(loggedInUser));
        sessionStorage.setItem('authToken', data.token);
        
        return loggedInUser;

    } catch (error: any) {
        console.error("Login failed:", error);
        // Rethrow the error so the component can catch it and display it
        throw error;
    }
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem('currentUser');
    sessionStorage.removeItem('authToken');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
