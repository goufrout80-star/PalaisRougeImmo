'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { User, Role } from '@/types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAdmin: boolean;
  isAgent: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  checkAuth: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ROLE_REDIRECTS: Record<Role, string> = {
  admin: '/admin/dashboard',
  agent: '/agent/dashboard',
  user: '/dashboard',
};

function supabaseUserToAppUser(sbUser: import('@supabase/supabase-js').User): User {
  const meta = sbUser.user_metadata ?? {};
  return {
    id: sbUser.id,
    username: sbUser.email ?? '',
    email: sbUser.email ?? '',
    name: meta.name ?? meta.full_name ?? sbUser.email ?? '',
    role: (meta.role as Role) ?? 'user',
    phone: meta.phone,
    avatar: meta.avatar_url,
    bio: meta.bio,
    listings: meta.listings ?? 0,
    soldProperties: meta.soldProperties ?? 0,
    createdAt: sbUser.created_at,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  const checkAuth = useCallback(async () => {
    try {
      const { data: { user: sbUser } } = await supabase.auth.getUser();
      setUser(sbUser ? supabaseUserToAppUser(sbUser) : null);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    checkAuth();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ? supabaseUserToAppUser(session.user) : null);
      setIsLoading(false);
    });
    return () => subscription.unsubscribe();
  }, [supabase, checkAuth]);

  // deprecated — login is handled directly via Supabase in login/page.tsx
  const login = async (email: string, password: string): Promise<boolean> => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.user) return false;
    const appUser = supabaseUserToAppUser(data.user);
    setUser(appUser);
    router.push(ROLE_REDIRECTS[appUser.role] ?? '/dashboard');
    return true;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push('/');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        isAdmin: user?.role === 'admin',
        isAgent: user?.role === 'agent',
        login,
        logout,
        checkAuth,
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

export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  allowedRoles?: Role[]
) {
  return function ProtectedComponent(props: P) {
    const { user, isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!isLoading) {
        if (!isAuthenticated) {
          router.push('/login');
        } else if (allowedRoles && user && !allowedRoles.includes(user.role)) {
          router.push('/');
        }
      }
    }, [isLoading, isAuthenticated, user, router]);

    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--gold-light)]" />
        </div>
      );
    }

    if (!isAuthenticated) return null;
    if (allowedRoles && user && !allowedRoles.includes(user.role)) return null;

    return <Component {...props} />;
  };
}
