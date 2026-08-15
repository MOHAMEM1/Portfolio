import React, { createContext, useContext, useState, useEffect } from 'react';

type AuthContextType = {
  token: string | null;
  username: string | null;
  login: (token: string, username: string) => void;
  logout: () => void;
  isLoading: boolean;
  role: string | null;
};

const AuthContext = createContext<AuthContextType>({
  token: null,
  username: null,
  login: () => {},
  logout: () => {},
  isLoading: true,
  role: null,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('userToken');
    const storedUsername = localStorage.getItem('username');
    if (storedToken && storedUsername) {
      setToken(storedToken);
      setUsername(storedUsername);
      try {
        const payload = JSON.parse(atob(storedToken.split('.')[1]));
        setRole(payload.role || 'USER');
      } catch (e) {
        setRole('USER');
      }
    }
    setIsLoading(false);
  }, []);

  const login = (newToken: string, newUsername: string) => {
    localStorage.setItem('userToken', newToken);
    localStorage.setItem('username', newUsername);
    setToken(newToken);
    setUsername(newUsername);
    try {
      const payload = JSON.parse(atob(newToken.split('.')[1]));
      setRole(payload.role || 'USER');
    } catch (e) {
      setRole('USER');
    }
  };

  const logout = () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('username');
    setToken(null);
    setUsername(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider value={{ token, username, role, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
