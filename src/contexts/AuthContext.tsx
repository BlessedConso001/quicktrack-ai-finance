
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<any>;
  signUp: (email: string, password: string, businessName?: string) => Promise<any>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        setSession(session);
        setUser(session?.user ?? null);
        
        // If user just signed up, ensure their profile exists
        if (event === 'SIGNED_IN' && session?.user) {
          try {
            // Check if business profile exists
            const { data: profile, error } = await supabase
              .from('business_profiles')
              .select('id')
              .eq('user_id', session.user.id)
              .single();
            
            // If no profile exists, create one
            if (!profile && !error?.message?.includes('Multiple rows')) {
              console.log('Creating business profile for user:', session.user.id);
              await supabase
                .from('business_profiles')
                .insert({
                  user_id: session.user.id,
                  business_name: session.user.user_metadata?.business_name || 'My Business',
                  currency: 'KSH'
                });
              
              // Also create default categories
              const defaultCategories = [
                { user_id: session.user.id, name: 'Sales', type: 'income' },
                { user_id: session.user.id, name: 'Services', type: 'income' },
                { user_id: session.user.id, name: 'Other Income', type: 'income' },
                { user_id: session.user.id, name: 'Supplies', type: 'expense' },
                { user_id: session.user.id, name: 'Marketing', type: 'expense' },
                { user_id: session.user.id, name: 'Transport', type: 'expense' },
                { user_id: session.user.id, name: 'Utilities', type: 'expense' },
                { user_id: session.user.id, name: 'Other', type: 'expense' }
              ];
              
              await supabase
                .from('categories')
                .insert(defaultCategories);
            }
          } catch (profileError) {
            console.log('Profile creation handled by trigger or already exists');
          }
        }
        
        setLoading(false);
      }
    );

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Sign in error:', error);
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, businessName = 'My Business') => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            business_name: businessName,
          },
        },
      });
      
      if (error) throw error;
      
      // If user is immediately confirmed (like in development), create profile manually
      if (data.user && !data.user.email_confirmed_at) {
        console.log('User signup successful, profile will be created on confirmation');
      }
      
      return { data, error: null };
    } catch (error) {
      console.error('Sign up error:', error);
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Reset password error:', error);
      return { data: null, error };
    }
  };

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
