import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSupabase } from './SupabaseContext';
import { User } from '@supabase/supabase-js';
import { getUserCredits } from '../services/supabase';

type UserContextType = {
  user: User | null;
  loading: boolean;
  credits: number | null;
  planType: string | null;
  refreshCredits: () => Promise<void>;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

type UserProviderProps = {
  children: ReactNode;
};

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const { supabase } = useSupabase();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [credits, setCredits] = useState<number | null>(null);
  const [planType, setPlanType] = useState<string | null>(null);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        setUser(data.session?.user || null);
        
        if (data.session?.user) {
          await fetchUserCredits(data.session.user.id);
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user || null);
        
        if (session?.user) {
          await fetchUserCredits(session.user.id);
        } else {
          setCredits(null);
          setPlanType(null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  const fetchUserCredits = async (userId: string) => {
    try {
      const userData = await getUserCredits(userId);
      setCredits(userData.credits_remaining);
      setPlanType(userData.plan_type);
    } catch (error) {
      console.error('Error fetching user credits:', error);
    }
  };

  const refreshCredits = async () => {
    if (user) {
      await fetchUserCredits(user.id);
    }
  };

  return (
    <UserContext.Provider value={{ user, loading, credits, planType, refreshCredits }}>
      {children}
    </UserContext.Provider>
  );
};