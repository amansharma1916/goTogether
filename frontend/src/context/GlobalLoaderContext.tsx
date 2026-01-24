import { createContext, useContext, useState, useCallback} from 'react';
type ReactNode = import('react').ReactNode;

interface GlobalLoaderContextValue {
  isLoading: boolean;
  message: string;
  show: (message?: string) => void;
  hide: () => void;
}

const GlobalLoaderContext = createContext<GlobalLoaderContextValue | null>(null);

export const GlobalLoaderProvider = ({ children }: { children: ReactNode }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('Please wait...');

  const show = useCallback((customMessage = 'Please wait...') => {
    setMessage(customMessage);
    setIsLoading(true);
  }, []);

  const hide = useCallback(() => {
    setIsLoading(false);
  }, []);

  return (
    <GlobalLoaderContext.Provider value={{ isLoading, message, show, hide }}>
      {children}
    </GlobalLoaderContext.Provider>
  );
};

export const useGlobalLoader = () => {
  const context = useContext(GlobalLoaderContext);
  if (!context) {
    throw new Error('useGlobalLoader must be used within GlobalLoaderProvider');
  }
  return context;
};
