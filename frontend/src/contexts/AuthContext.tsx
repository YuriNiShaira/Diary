import React, { createContext, useContext, useState, useEffect } from 'react';

interface UserData {
  username: string;
  display_name: string;
  couple_name: string;
  couple_id: number;
  anniversary_date: string;
  partner_name: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: UserData | null;
  login: (userData: UserData) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  login: () => {},
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserData | null>(null);

  // Check localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('coupleUser');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('coupleUser');
      }
    }
  }, []);

  const login = (userData: UserData) => {
    setUser(userData);
    localStorage.setItem('coupleUser', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('coupleUser');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated: !!user, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};