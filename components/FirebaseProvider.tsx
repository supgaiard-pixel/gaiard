'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { initializeFirebase } from '@/lib/firebase';

interface FirebaseContextType {
  isInitialized: boolean;
  error: string | null;
}

const FirebaseContext = createContext<FirebaseContextType>({
  isInitialized: false,
  error: null,
});

export function FirebaseProvider({ children }: { children: ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        await initializeFirebase();
        setIsInitialized(true);
      } catch (err) {
        console.error('Erreur d\'initialisation Firebase:', err);
        setError(err instanceof Error ? err.message : 'Erreur inconnue');
      }
    };

    init();
  }, []);

  return (
    <FirebaseContext.Provider value={{ isInitialized, error }}>
      {children}
    </FirebaseContext.Provider>
  );
}

export function useFirebase() {
  const context = useContext(FirebaseContext);
  if (!context) {
    throw new Error('useFirebase doit être utilisé dans un FirebaseProvider');
  }
  return context;
}
