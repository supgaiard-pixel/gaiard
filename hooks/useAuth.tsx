'use client';

import { useState, useEffect, useContext, createContext, ReactNode } from 'react';
import { authService, AuthUser } from '@/services/authService';

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string, role?: 'admin' | 'manager' | 'agent') => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: 'admin' | 'manager' | 'agent') => boolean;
  isAdmin: () => boolean;
  isManager: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const setupAuth = async () => {
      try {
        const unsubscribe = await authService.onAuthStateChanged((user) => {
          setUser(user);
          setLoading(false);
        });
        
        // Stocker la fonction de nettoyage
        return unsubscribe;
      } catch (error) {
        console.error('Erreur de configuration de l\'authentification:', error);
        setLoading(false);
        return null;
      }
    };
    
    let cleanup: (() => void) | null = null;
    
    setupAuth().then((unsubscribe) => {
      cleanup = unsubscribe;
    });

    return () => {
      if (cleanup) {
        cleanup();
      }
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const user = await authService.signIn(email, password);
      setUser(user);
    } catch (error) {
      console.error('Erreur de connexion:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, displayName: string, role: 'admin' | 'manager' | 'agent' = 'agent') => {
    setLoading(true);
    try {
      const user = await authService.signUp(email, password, displayName, role);
      setUser(user);
    } catch (error) {
      console.error('Erreur d\'inscription:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await authService.signOut();
      setUser(null);
    } catch (error) {
      console.error('Erreur de déconnexion:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await authService.resetPassword(email);
    } catch (error) {
      console.error('Erreur de réinitialisation:', error);
      throw error;
    }
  };

  const hasPermission = (permission: string) => {
    return authService.hasPermission(user, permission);
  };

  const hasRole = (role: 'admin' | 'manager' | 'agent') => {
    return authService.hasRole(user, role);
  };

  const isAdmin = () => {
    return authService.isAdmin(user);
  };

  const isManager = () => {
    return authService.isManager(user);
  };

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    hasPermission,
    hasRole,
    isAdmin,
    isManager
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider');
  }
  return context;
}
