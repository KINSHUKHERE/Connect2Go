import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../services/supabase.js';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('connect2go_user');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.id) return parsed;
      }
    } catch (e) {}
    return null;
  });

  const [isAdmin, setIsAdmin] = useState(() => {
    try {
      const stored = localStorage.getItem('connect2go_user');
      if (stored) {
        const parsed = JSON.parse(stored);
        return Boolean(parsed?.isAdmin);
      }
    } catch (e) {}
    return false;
  });

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState(null);

  // Update user avatar across the entire application and persist in localStorage
  const updateUserAvatar = async (newAvatarUrl, publicId = null) => {
    const oldPublicId = user?.avatarPublicId;
    const oldAvatar = user?.avatar;

    // Clean up old Cloudinary photo if replacing with a different image
    if (oldPublicId && oldPublicId !== publicId) {
      try {
        await fetch(`${API_BASE}/upload`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ public_id: oldPublicId, url: oldAvatar })
        });
      } catch (e) {}
    } else if (oldAvatar && oldAvatar.includes('cloudinary.com') && oldAvatar !== newAvatarUrl) {
      try {
        await fetch(`${API_BASE}/upload`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: oldAvatar })
        });
      } catch (e) {}
    }

    setUser((prev) => {
      if (!prev) return prev;
      const updated = { 
        ...prev, 
        avatar: newAvatarUrl,
        avatarPublicId: publicId !== undefined ? publicId : prev.avatarPublicId
      };
      try {
        localStorage.setItem('connect2go_user', JSON.stringify(updated));
      } catch (e) {
        console.warn('Failed to save avatar to localStorage', e);
      }
      return updated;
    });
  };

  // Permanently delete user avatar from Cloudinary and reset to default person image according to gender
  const removeUserAvatar = async () => {
    const currentAvatar = user?.avatar;
    const currentPublicId = user?.avatarPublicId;
    const userGender = String(user?.gender || '').trim().toLowerCase();
    const defaultAvatar = (userGender === 'female' || userGender === 'f') ? '/avatars/female.png' : '/avatars/male.png';

    // 1. Trigger backend deletion if hosted on Cloudinary or custom upload
    if (currentPublicId || (currentAvatar && (currentAvatar.includes('cloudinary.com') || currentAvatar.includes('data:image')))) {
      try {
        await fetch(`${API_BASE}/upload`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            public_id: currentPublicId,
            url: currentAvatar
          })
        });
      } catch (err) {
        console.warn('[Avatar Delete] Backend Cloudinary delete request notice:', err);
      }
    }

    // 2. Sync DB profile with default gender avatar
    if (user?.id) {
      try {
        await fetch(`${API_BASE}/auth/update-profile`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            avatar_url: defaultAvatar
          })
        });
      } catch (e) {}
    }

    // 3. Reset user avatar to default person image according to gender
    setUser((prev) => {
      if (!prev) return prev;
      const updated = {
        ...prev,
        avatar: defaultAvatar,
        avatarPublicId: null
      };
      try {
        localStorage.setItem('connect2go_user', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    return { success: true, avatar: defaultAvatar };
  };

  // Generic profile updater
  const updateUserProfile = (fields) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, ...fields };
      try {
        localStorage.setItem('connect2go_user', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  // Sync Supabase Auth session on mount
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase.auth) return;

    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        mapSupabaseUser(session.user);
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        mapSupabaseUser(session.user);
      } else if (event === 'SIGNED_OUT' || !session) {
        setUser(null);
        setIsAdmin(false);
        try {
          localStorage.removeItem('connect2go_user');
          localStorage.removeItem('connect2go_token');
          localStorage.removeItem('connect2go_last_active');
        } catch (e) {}
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  // 7-Day Inactivity Auto Logout & JWT Expiration Guard
  useEffect(() => {
    const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

    const checkInactivityAndJWT = () => {
      try {
        const lastActiveStr = localStorage.getItem('connect2go_last_active');
        const token = localStorage.getItem('connect2go_token');
        const now = Date.now();

        if (lastActiveStr) {
          const lastActive = Number(lastActiveStr);
          if (!isNaN(lastActive) && (now - lastActive > SEVEN_DAYS_MS)) {
            console.warn('⚠️ Auto-logged out: 7 days of inactivity reached.');
            logout();
            return true;
          }
        }

        if (token) {
          try {
            const parts = token.split('.');
            if (parts.length === 3) {
              const payload = JSON.parse(atob(parts[1]));
              if (payload.exp && payload.exp * 1000 < now) {
                console.warn('⚠️ Auto-logged out: 7-day JWT token expired.');
                logout();
                return true;
              }
            }
          } catch (e) {}
        }
      } catch (e) {}
      return false;
    };

    const expired = checkInactivityAndJWT();

    if (!expired && user) {
      if (!localStorage.getItem('connect2go_last_active')) {
        localStorage.setItem('connect2go_last_active', String(Date.now()));
      }

      let timeoutId = null;
      const handleUserActivity = () => {
        if (timeoutId) return;
        timeoutId = setTimeout(() => {
          localStorage.setItem('connect2go_last_active', String(Date.now()));
          timeoutId = null;
        }, 5000);
      };

      window.addEventListener('mousemove', handleUserActivity);
      window.addEventListener('keydown', handleUserActivity);
      window.addEventListener('click', handleUserActivity);
      window.addEventListener('scroll', handleUserActivity);
      window.addEventListener('touchstart', handleUserActivity);

      const interval = setInterval(checkInactivityAndJWT, 5 * 60 * 1000);

      return () => {
        if (timeoutId) clearTimeout(timeoutId);
        clearInterval(interval);
        window.removeEventListener('mousemove', handleUserActivity);
        window.removeEventListener('keydown', handleUserActivity);
        window.removeEventListener('click', handleUserActivity);
        window.removeEventListener('scroll', handleUserActivity);
        window.removeEventListener('touchstart', handleUserActivity);
      };
    }
  }, [user?.id]);

  const mapSupabaseUser = (sbUser) => {
    let cachedUser = null;
    try {
      const stored = localStorage.getItem('connect2go_user');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.id === sbUser.id) cachedUser = parsed;
      }
    } catch (e) {}

    const meta = sbUser.user_metadata || {};
    const email = sbUser.email || '';
    const isMasterAdmin = email.toLowerCase() === 'herekinshuk@gmail.com' || email.toLowerCase().includes('admin');
    const userGender = cachedUser?.gender || meta.gender || 'Male';
    const defaultAvatar = userGender.toLowerCase() === 'female' ? '/avatars/female.png' : '/avatars/male.png';

    const newUser = {
      id: sbUser.id,
      name: cachedUser?.name || meta.name || meta.full_name || (isMasterAdmin ? 'Kinshuk Khandelwal' : email.split('@')[0]),
      username: cachedUser?.username || meta.username || (isMasterAdmin ? 'kinshuk_admin' : email.split('@')[0]),
      gender: userGender,
      email: email || cachedUser?.email,
      phone: cachedUser?.phone || meta.phone || '',
      role: isMasterAdmin ? 'admin' : (meta.role || 'user'),
      avatar: cachedUser?.avatar || meta.avatar_url || defaultAvatar,
      bio: cachedUser?.bio || meta.bio || (isMasterAdmin ? 'Platform Administrator & Creator of Connect2Go.' : 'Ready to explore activities nearby!'),
      location: cachedUser?.location || meta.location || 'Campus Hub, Jaipur',
      interests: cachedUser?.interests || meta.interests || ['Badminton', 'Study', 'Fitness'],
      stats: cachedUser?.stats || meta.stats || { activities: 0, matches: 0, connections: 0 },
      isAdmin: isMasterAdmin,
    };

    setUser(newUser);
    setIsAdmin(newUser.isAdmin);
    try {
      localStorage.setItem('connect2go_user', JSON.stringify(newUser));
    } catch (e) {}
  };

  // Live Service-Role Registration (Bypasses email rate limit completely & returns JWT)
  const signUpWithEmail = async (email, password, name, username, gender, avatar) => {
    setAuthLoading(true);
    setAuthError(null);

    // Password Validation: 8-16 chars, 1 capital, 1 small, 1 number
    const hasCapital = /[A-Z]/.test(password);
    const hasSmall = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasValidLength = password.length >= 8 && password.length <= 16;

    if (!hasValidLength || !hasCapital || !hasSmall || !hasNumber) {
      const pending = [];
      if (password.length < 8) pending.push('minimum 8 characters');
      else if (password.length > 16) pending.push('maximum 16 characters');
      if (!hasCapital) pending.push('at least 1 uppercase letter');
      if (!hasSmall) pending.push('at least 1 lowercase letter');
      if (!hasNumber) pending.push('at least 1 number');

      const errorMsg = `Password requirement not filled: ${pending.join(', ')}.`;
      setAuthError(errorMsg);
      setAuthLoading(false);
      return { success: false, error: errorMsg };
    }

    try {
      // Service Role Backend Registration (bypasses rate limit and issues JWT)
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name, username, gender, avatar })
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Registration failed.');
      }

      if (data.token) {
        try {
          localStorage.setItem('connect2go_token', data.token);
        } catch (e) {}
      }

      if (data.user) {
        // Sign in user session on client
        if (isSupabaseConfigured && supabase.auth) {
          try {
            await supabase.auth.signInWithPassword({ email, password });
          } catch (e) {}
        }
        setUser(data.user);
        setIsAdmin(Boolean(data.user.isAdmin));
        setAuthModalOpen(false);
        try {
          localStorage.setItem('connect2go_user', JSON.stringify(data.user));
        } catch (e) {}
        return { success: true, user: data.user, token: data.token };
      }
      return { success: true };
    } catch (err) {
      setAuthError(err.message);
      return { success: false, error: err.message };
    } finally {
      setAuthLoading(false);
    }
  };

  // Live Email/Password Signin with Master Administrator Support
  const signInWithEmail = async (email, password) => {
    setAuthLoading(true);
    setAuthError(null);

    const normEmail = (email || '').trim().toLowerCase();

    // Master Administrator Login: herekinshuk@gmail.com / 123456
    if (normEmail === 'herekinshuk@gmail.com') {
      if (password === '123456') {
        if (isSupabaseConfigured && supabase.auth) {
          try {
            await supabase.auth.signInWithPassword({
              email: 'herekinshuk@gmail.com',
              password: '123456'
            });
          } catch (e) {
            console.warn('Supabase auth sign in notice:', e.message);
          }
        }
        const adminUser = {
          id: 'ae6be659-8914-43ef-bf43-7d6dff91f5f0',
          name: 'Kinshuk Khandelwal',
          username: 'kinshuk_admin',
          email: 'herekinshuk@gmail.com',
          avatar: '/avatars/male.png',
          isAdmin: true,
          role: 'admin',
          stats: { activities: 0, matches: 0, connections: 0 },
          bio: 'Platform Administrator & Creator of Connect2Go.',
          interests: ['Safety', 'Campus Community', 'Operations', 'Tech'],
          location: 'Campus Hub, Jaipur'
        };
        setUser(adminUser);
        setIsAdmin(true);
        setAuthModalOpen(false);
        setAuthLoading(false);
        try {
          localStorage.setItem('connect2go_user', JSON.stringify(adminUser));
        } catch (e) {}
        return { success: true, user: adminUser, isAdmin: true };
      } else {
        setAuthLoading(false);
        const err = 'Incorrect password for Administrator account.';
        setAuthError(err);
        return { success: false, error: err };
      }
    }

    try {
      if (isSupabaseConfigured && supabase.auth) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: normEmail,
          password
        });

        if (error) throw error;
        if (data?.user) {
          mapSupabaseUser(data.user);
          setAuthModalOpen(false);
        }
        return { success: true };
      } else {
        // Fallback local signin for test accounts
        const loggedUser = {
          id: 'usr-' + Date.now(),
          name: normEmail.split('@')[0],
          username: normEmail.split('@')[0],
          email: normEmail,
          avatar: '/avatars/male.png',
          bio: 'Ready to explore activities nearby!',
          location: 'Jaipur, Rajasthan',
          interests: ['Badminton', 'Study', 'Fitness'],
          stats: { activities: 1, matches: 0, connections: 1 },
          isAdmin: false,
        };
        setUser(loggedUser);
        setIsAdmin(false);
        setAuthModalOpen(false);
        return { success: true, user: loggedUser };
      }
    } catch (err) {
      setAuthError(err.message);
      return { success: false, error: err.message };
    } finally {
      setAuthLoading(false);
    }
  };

  // Instant Demo Switchers for rapid testing
  const loginAsUser = () => {
    const demoUser = {
      id: 'usr-demo-1',
      name: 'Kinshuk Khandelwal',
      username: 'kinshuk',
      email: 'kinshuk@example.com',
      avatar: '/avatars/male.png',
      bio: 'Tech enthusiast. Love sports, travel, and meeting active people nearby!',
      location: 'Jaipur, Rajasthan',
      interests: ['Badminton', 'Running', 'Gaming', 'Music', 'Travel', 'Photography'],
      stats: { activities: 12, matches: 8, connections: 24 },
      isAdmin: false,
    };
    setUser(demoUser);
    setIsAdmin(false);
    setAuthModalOpen(false);
    try {
      localStorage.setItem('connect2go_user', JSON.stringify(demoUser));
    } catch (e) {}
    return demoUser;
  };

  const loginAsAdmin = () => {
    const adminUser = {
      id: 'admin-kinshuk-1',
      name: 'Kinshuk Khandelwal',
      username: 'kinshuk_admin',
      email: 'herekinshuk@gmail.com',
      avatar: '/avatars/male.png',
      isAdmin: true,
      stats: { activities: 0, matches: 0, connections: 0 },
      bio: 'Platform Administrator & Creator of Connect2Go.',
      interests: ['Safety', 'Campus Community', 'Operations', 'Tech'],
      location: 'Jaipur, HQ'
    };
    setUser(adminUser);
    setIsAdmin(true);
    setAuthModalOpen(false);
    try {
      localStorage.setItem('connect2go_user', JSON.stringify(adminUser));
    } catch (e) {}
    return adminUser;
  };

  const logout = async () => {
    try {
      localStorage.removeItem('connect2go_user');
    } catch (e) {}
    setUser(null);
    setIsAdmin(false);
    if (isSupabaseConfigured && supabase.auth) {
      await supabase.auth.signOut().catch(() => {});
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        isGuest: !user,
        isAdmin,
        setIsAdmin,
        loginAsUser,
        loginAsAdmin,
        signUpWithEmail,
        signInWithEmail,
        updateUserAvatar,
        removeUserAvatar,
        updateUserProfile,
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
