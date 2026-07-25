import React, { createContext, useState, useContext, useCallback, useMemo } from 'react';

export type User = { id: number; email: string; token: string } | null;

interface AuthContextType {
  user: User;
  setUser: (user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User>(null);

  const logout = useCallback(() => setUser(null), []);

  const value = useMemo(
    () => ({ user, setUser, logout }),
    [user, logout]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
