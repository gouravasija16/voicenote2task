import React, { createContext, useContext, useState, useEffect } from 'react';
import avatarAlex from '../assets/avatar_alex.jpg';
import avatarMarcus from '../assets/avatar_marcus.jpg';

export const DEMO_USERS = [
  {
    id: 'user_alex',
    name: 'Alex Morgan',
    email: 'alex.morgan@ambient.design',
    role: 'Senior Product Lead',
    avatar: avatarAlex,
    plan: 'Pro Plan',
    workspace: 'Design Ops & Roadmaps',
    stats: { notesProcessed: 18, tasksCreated: 64, syncStatus: 'Cloud Active' }
  },
  {
    id: 'user_marcus',
    name: 'Marcus Vance',
    email: 'marcus.vance@techcorp.io',
    role: 'Staff Systems Architect',
    avatar: avatarMarcus,
    plan: 'Enterprise',
    workspace: 'Core Infrastructure',
    stats: { notesProcessed: 42, tasksCreated: 147, syncStatus: 'Cloud Active' }
  }
];

const AUTH_STORAGE_KEY = 'voicenote2task_auth_user';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Initialize with persisted user or default to Alex Morgan for an immediate rich experience
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed === null) return null;
        // Fix avatar if it points to demo user
        if (parsed.id === 'user_alex') return { ...parsed, avatar: avatarAlex };
        if (parsed.id === 'user_marcus') return { ...parsed, avatar: avatarMarcus };
        return parsed;
      }
    } catch (e) {
      console.warn('Failed reading auth state from localStorage', e);
    }
    // Default: not authenticated — user must log in
    return null;
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState('signin'); // 'signin' | 'signup' | 'switch'

  // Persist user state changes
  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
      } else {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(null));
      }
    } catch (e) {
      console.error('Failed saving auth state', e);
    }
  }, [user]);

  const login = async (email, password) => {
    // Simulate real auth handshake delay
    await new Promise((r) => setTimeout(r, 600));

    // Match existing demo user or generate custom user profile
    const matched = DEMO_USERS.find(
      (u) => u.email.toLowerCase() === email.trim().toLowerCase()
    );

    if (matched) {
      setUser(matched);
      return { success: true, user: matched };
    }

    // Custom user login
    const newUser = {
      id: `user_${Date.now()}`,
      name: email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      email: email.trim(),
      role: 'Product Strategist',
      avatar: avatarAlex,
      plan: 'Pro Plan',
      workspace: 'Personal Workspace',
      stats: { notesProcessed: 1, tasksCreated: 5, syncStatus: 'Cloud Active' }
    };
    setUser(newUser);
    return { success: true, user: newUser };
  };

  const loginAs = (userId) => {
    const selected = DEMO_USERS.find((u) => u.id === userId) || DEMO_USERS[0];
    setUser(selected);
    setIsAuthModalOpen(false);
  };

  const signup = async ({ name, email, role = 'Product Manager' }) => {
    await new Promise((r) => setTimeout(r, 600));
    const newUser = {
      id: `user_${Date.now()}`,
      name: name.trim() || 'New Creator',
      email: email.trim(),
      role: role.trim() || 'Innovator',
      avatar: avatarAlex,
      plan: 'Pro Plan',
      workspace: `${name.split(' ')[0]}'s Workspace`,
      stats: { notesProcessed: 0, tasksCreated: 0, syncStatus: 'Cloud Active' }
    };
    setUser(newUser);
    return { success: true, user: newUser };
  };

  const logout = () => {
    setUser(null);
  };

  const openAuthModal = (tab = 'signin') => {
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        demoUsers: DEMO_USERS,
        login,
        loginAs,
        signup,
        logout,
        isAuthModalOpen,
        authModalTab,
        setAuthModalTab,
        openAuthModal,
        closeAuthModal
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
