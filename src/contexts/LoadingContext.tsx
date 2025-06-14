
import React, { createContext, useContext, useState } from 'react';

interface LoadingContextType {
  isLoading: (key: string) => boolean;
  setLoading: (key: string, loading: boolean) => void;
  loadingStates: Record<string, boolean>;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const LoadingProvider = ({ children }: { children: React.ReactNode }) => {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});

  const setLoading = (key: string, loading: boolean) => {
    setLoadingStates(prev => ({ ...prev, [key]: loading }));
  };

  const isLoading = (key: string) => loadingStates[key] || false;

  return (
    <LoadingContext.Provider value={{ isLoading, setLoading, loadingStates }}>
      {children}
    </LoadingContext.Provider>
  );
};

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};
