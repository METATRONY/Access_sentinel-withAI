import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/use-toast';

interface AppContextType {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  user: any;
  isAuthenticated: boolean;
  loading: boolean;
}

const defaultAppContext: AppContextType = {
  sidebarOpen: false,
  toggleSidebar: () => {},
  user: null,
  isAuthenticated: false,
  loading: true,
};

const AppContext = createContext<AppContextType>(defaultAppContext);

export const useAppContext = () => useContext(AppContext);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check current auth state
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
      setUser(session?.user || null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setIsAuthenticated(!!session);
        setUser(session?.user || null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev);
  };

  return (
    <AppContext.Provider
      value={{
        sidebarOpen,
        toggleSidebar,
        user,
        isAuthenticated,
        loading,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
