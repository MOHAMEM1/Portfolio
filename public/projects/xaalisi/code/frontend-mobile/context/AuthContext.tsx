import React, { createContext, useContext, useState, useEffect } from 'react';
import { getSecureItem, setSecureItem, deleteSecureItem } from '@/config/storage';

type AuthContextType = {
  token: string | null;
  username: string | null;
  login: (token: string, username: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType>({
  token: null,
  username: null,
  login: async () => {},
  logout: async () => {},
  isLoading: true,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing token when app loads
    const loadToken = async () => {
      try {
        const storedToken = await getSecureItem('userToken');
        const storedUsername = await getSecureItem('username');
        if (storedToken && storedUsername) {
          setToken(storedToken);
          setUsername(storedUsername);
        }
      } catch (error) {
        console.error("Error loading secure store data", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadToken();
  }, []);

  const login = async (newToken: string, newUsername: string) => {
    try {
      await setSecureItem('userToken', newToken);
      await setSecureItem('username', newUsername);
      setToken(newToken);
      setUsername(newUsername);
    } catch (error) {
      console.error("Error saving secure store data", error);
    }
  };

  const logout = async () => {
    try {
      await deleteSecureItem('userToken');
      await deleteSecureItem('username');
      setToken(null);
      setUsername(null);
    } catch (error) {
      console.error("Error deleting secure store data", error);
    }
  };

  return (
    <AuthContext.Provider value={{ token, username, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
