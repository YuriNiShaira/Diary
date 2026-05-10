import React, { createContext, useContext, useState, useEffect } from 'react';

interface UserData {
  username: string;
  display_name: string;
  couple_name: string;
  couple_id: number;
  anniversary_date: string;
  partner_name: string;
  invite_code?: string; 
  has_partner?: boolean;  
}


interface AuthContextType {
  isAuthenticated: boolean;
  user: UserData | null;
  login: (userData: UserData, accessToken: string, refreshToken: string) => void;
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

  useEffect(() => {
    const storedUser = localStorage.getItem('coupleUser');
    const accessToken = localStorage.getItem('accessToken');
    
    if (storedUser && accessToken) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        // Invalid data - clear everything
        localStorage.removeItem('coupleUser');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      }
    }
  }, []);

  const login = (userData: UserData, accessToken: string, refreshToken: string) => {
    const hasPartner = userData.partner_name !== 'Waiting for partner to join...' && 
                      userData.partner_name !== 'Waiting for partner...';
    
    const fullUserData = {
      ...userData,
      has_partner: hasPartner,
    };
    
    setUser(fullUserData);
    localStorage.setItem('coupleUser', JSON.stringify(fullUserData));
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('coupleUser');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated: !!user, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};