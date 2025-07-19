
// hooks/use-user.ts
import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { supabase } from '../integrations/supabase/client';
import type { User as SupabaseUser, Session as SupabaseSession } from '@supabase/supabase-js';

interface User extends SupabaseUser {
  // Add custom properties if you extend the user profile in your public table
  // For example:
  // nome?: string;
  // funcao?: string;
  // role is part of SupabaseUser via app_metadata or user_metadata
}

interface UserContextType {
  user: User | null;
  session: SupabaseSession | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setSession: (session: SupabaseSession | null) => void;
  logout: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUserState] = useState<User | null>(null);
  const [session, setSessionState] = useState<SupabaseSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Remove Supabase configuration check since it's always configured

    const getSessionData = async () => {
      const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        console.error("Error getting session:", sessionError.message);
      } else {
        setSessionState(currentSession);
        setUserState(currentSession?.user as User ?? null);
      }
      setIsLoading(false);
    };

    getSessionData();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setSessionState(newSession);
      setUserState(newSession?.user as User ?? null);
      // No need to setIsLoading(false) here again unless it's a very long-running listener init
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const setUser = (newUser: User | null) => {
    setUserState(newUser);
  };

  const setSession = (newSession: SupabaseSession | null) => {
    setSessionState(newSession);
  };

  const logout = async () => {
    // Remove Supabase configuration check since it's always configured
    {
      await supabase.auth.signOut();
    }
    setUserState(null);
    setSessionState(null);
  };

  const value = { user, session, isLoading, setUser, setSession, logout };

  return React.createElement(UserContext.Provider, { value: value }, children);
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
