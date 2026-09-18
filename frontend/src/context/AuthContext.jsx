import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../services/supabase.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState({
    id: 'usr-demo-1',
    name: 'Kinshuk Khandelwal',
    username: 'kinshuk',
    email: 'kinshuk@example.com',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
    bio: 'Tech enthusiast. Love sports, travel, and meeting active people nearby!',
    location: 'Jaipur, Rajasthan',
    interests: ['Badminton', 'Running', 'Gaming', 'Music', 'Travel', 'Photography'],
    stats: { activities: 12, matches: 8, connections: 24 },
    isAdmin: false,
  });

  const [isAdmin, setIsAdmin] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState(null);

  // Sync Supabase Auth session on mount
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase.auth) return;

    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        mapSupabaseUser(session.user);
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        mapSupabaseUser(session.user);
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const mapSupabaseUser = (sbUser) => {
    const meta = sbUser.user_metadata || {};
    const newUser = {
      id: sbUser.id,
      name: meta.name || meta.full_name || sbUser.email.split('@')[0],
      username: meta.username || sbUser.email.split('@')[0],
      email: sbUser.email,
      avatar: meta.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
      bio: meta.bio || 'Ready to explore activities nearby!',
      location: meta.location || 'Jaipur, Rajasthan',
      interests: meta.interests || ['Badminton', 'Study', 'Fitness'],
      stats: { activities: 1, matches: 0, connections: 1 },
      isAdmin: sbUser.email.includes('admin'),
    };
    setUser(newUser);
    setIsAdmin(newUser.isAdmin);
  };

  // Live Supabase Email/Password Signup
  const signUpWithEmail = async (email, password, name, username) => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            username: username || email.split('@')[0],
            avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80'
          }
        }
      });

      if (error) throw error;
      if (data?.user) {
        mapSupabaseUser(data.user);
        setAuthModalOpen(false);
      }
      return { success: true };
    } catch (err) {
      setAuthError(err.message);
      return { success: false, error: err.message };
    } finally {
      setAuthLoading(false);
    }
  };

  // Live Supabase Email/Password Signin
  const signInWithEmail = async (email, password) => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
      if (data?.user) {
        mapSupabaseUser(data.user);
        setAuthModalOpen(false);
      }
      return { success: true };
    } catch (err) {
      setAuthError(err.message);
      return { success: false, error: err.message };
    } finally {
      setAuthLoading(false);
    }
  };

  // Instant Demo Switchers for rapid testing
  const loginAsUser = () => {
    setUser({
      id: 'usr-demo-1',
      name: 'Kinshuk Khandelwal',
      username: 'kinshuk',
      email: 'kinshuk@example.com',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
      bio: 'Tech enthusiast. Love sports, travel, and meeting active people nearby!',
      location: 'Jaipur, Rajasthan',
      interests: ['Badminton', 'Running', 'Gaming', 'Music', 'Travel', 'Photography'],
      stats: { activities: 12, matches: 8, connections: 24 },
      isAdmin: false,
    });
    setIsAdmin(false);
    setAuthModalOpen(false);
  };

  const loginAsAdmin = () => {
    setUser({
      id: 'admin-demo-1',
      name: 'Platform Administrator',
      username: 'admin',
      email: 'admin@connect2go.com',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&auto=format&fit=crop&q=80',
      isAdmin: true,
      stats: { activities: 24, matches: 15, connections: 52 },
      bio: 'System Administrator managing safe community spaces.',
      interests: ['Safety', 'Campus Community', 'Operations'],
      location: 'Jaipur, HQ'
    });
    setIsAdmin(true);
    setAuthModalOpen(false);
  };

  const logout = async () => {
    if (isSupabaseConfigured && supabase.auth) {
      await supabase.auth.signOut().catch(() => {});
    }
    setUser(null);
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin,
        setIsAdmin,
        loginAsUser,
        loginAsAdmin,
        signUpWithEmail,
        signInWithEmail,
        logout,
        authModalOpen,
        setAuthModalOpen,
        authLoading,
        authError,
        setAuthError,
        isSupabaseConfigured,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
