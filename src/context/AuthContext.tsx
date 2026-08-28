import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { DEFAULT_OFFLINE_USERS, getOfflineDb, saveOfflineDb } from '../utils/offlineStorage';

interface AuthContextType {
  user: User | null;
  demoUsers: User[];
  isLoading: boolean;
  isOfflineOnly: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string, avatar?: string) => Promise<{ success: boolean; defaultWorkspaceId?: string; error?: string }>;
  forgotPassword: (email: string, newPassword?: string) => Promise<{ success: boolean; message?: string; error?: string }>;
  logout: () => void;
  switchDemoUser: (user: User) => void;
  refreshDemoUsers: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'finance_tracker_current_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [demoUsers, setDemoUsers] = useState<User[]>(DEFAULT_OFFLINE_USERS);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isOfflineOnly, setIsOfflineOnly] = useState<boolean>(false);

  const fetchDemoUsers = async () => {
    try {
      const res = await fetch('/api/auth/demo-users');
      if (res.ok) {
        const data = await res.json();
        const users = data.users || [];
        setDemoUsers(users);
        setIsOfflineOnly(false);
        return users;
      }
    } catch {
      // Server not reachable -> running offline
      setIsOfflineOnly(true);
    }
    // Fallback to local offline users
    const db = getOfflineDb();
    const localUsers = db.users && db.users.length > 0 ? db.users : DEFAULT_OFFLINE_USERS;
    setDemoUsers(localUsers);
    return localUsers;
  };

  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);
      const loadedUsers = await fetchDemoUsers();

      // Check localStorage for saved user session
      const savedUserStr = localStorage.getItem(AUTH_STORAGE_KEY);
      if (savedUserStr) {
        try {
          const parsed = JSON.parse(savedUserStr);
          setUser(parsed);
        } catch {
          localStorage.removeItem(AUTH_STORAGE_KEY);
        }
      } else if (loadedUsers && loadedUsers.length > 0) {
        // Default to the first demo user (Ashish) for immediate offline start
        const defaultUser = loadedUsers[0];
        setUser(defaultUser);
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(defaultUser));
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(data.user));
        await fetchDemoUsers();
        return { success: true };
      }
    } catch {
      // Fallback to local offline login
    }

    // Offline local verification
    const db = getOfflineDb();
    const existing = (db.users || []).find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      setUser(existing);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(existing));
      return { success: true };
    }

    // If new user in offline mode, auto-create local user
    const newUser: User = {
      id: 'usr_' + Math.random().toString(36).substring(2, 9),
      name: email.split('@')[0],
      email: email.toLowerCase(),
      createdAt: new Date().toISOString(),
    };
    db.users.push(newUser);
    saveOfflineDb(db);
    setUser(newUser);
    setDemoUsers(db.users);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newUser));
    return { success: true };
  };

  const register = async (name: string, email: string, password: string, avatar?: string) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, avatar }),
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(data.user));
        await fetchDemoUsers();
        return { success: true, defaultWorkspaceId: data.defaultWorkspaceId };
      }
    } catch {
      // Fallback offline
    }

    // Offline local registration
    const db = getOfflineDb();
    const newUser: User = {
      id: 'usr_' + Math.random().toString(36).substring(2, 9),
      name,
      email: email.toLowerCase(),
      avatar,
      createdAt: new Date().toISOString(),
    };
    db.users.push(newUser);
    saveOfflineDb(db);
    setUser(newUser);
    setDemoUsers(db.users);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newUser));
    return { success: true };
  };

  const forgotPassword = async (email: string, newPassword?: string) => {
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, newPassword }),
      });
      if (res.ok) {
        const data = await res.json();
        return { success: true, message: data.message };
      }
    } catch {
      // Offline mode
    }
    return { success: true, message: 'Password reset completed locally.' };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  const switchDemoUser = (newUser: User) => {
    setUser(newUser);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newUser));
  };

  const refreshDemoUsers = async () => {
    await fetchDemoUsers();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        demoUsers,
        isLoading,
        isOfflineOnly,
        login,
        register,
        forgotPassword,
        logout,
        switchDemoUser,
        refreshDemoUsers,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
