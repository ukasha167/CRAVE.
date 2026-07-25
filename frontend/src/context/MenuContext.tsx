import React, { createContext, useState, useContext, useCallback, useMemo, useEffect, useRef } from 'react';
import { API_URL } from '../constants/api';

export type MenuItem = {
  id: number;
  name: string;
  description: string;
  price: string;
  category: string;
  image_url: string;
};

interface MenuContextType {
  menu: MenuItem[];
  isLoading: boolean;
  error: string | null;
  refreshMenu: () => Promise<void>;
  getItemById: (id: number) => MenuItem | undefined;
}

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const MenuContext = createContext<MenuContextType | undefined>(undefined);

export const MenuProvider = ({ children }: { children: React.ReactNode }) => {
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const cacheTimestampRef = useRef(0);

  const fetchMenu = useCallback(async (force = false) => {
    const now = Date.now();
    if (!force && cacheTimestampRef.current > 0 && now - cacheTimestampRef.current < CACHE_TTL) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/menu`);
      if (!res.ok) throw new Error('Failed to fetch menu');
      const data: MenuItem[] = await res.json();
      setMenu(data);
      cacheTimestampRef.current = Date.now();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMenu();
  }, [fetchMenu]);

  const refreshMenu = useCallback(() => fetchMenu(true), [fetchMenu]);

  const getItemById = useCallback(
    (id: number) => menu.find(i => i.id === id),
    [menu]
  );

  const value = useMemo(
    () => ({ menu, isLoading, error, refreshMenu, getItemById }),
    [menu, isLoading, error, refreshMenu, getItemById]
  );

  return (
    <MenuContext.Provider value={value}>
      {children}
    </MenuContext.Provider>
  );
};

export const useMenu = () => {
  const context = useContext(MenuContext);
  if (!context) throw new Error('useMenu must be used within MenuProvider');
  return context;
};
