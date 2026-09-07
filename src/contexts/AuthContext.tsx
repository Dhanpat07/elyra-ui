import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../supabase';
import type { User, Session } from '@supabase/supabase-js';
import { requestEmailOTP, verifyEmailOTP as verifyEmailOTPAPI } from '../api';

// Types
export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  tenant_id: string;
  role: 'owner' | 'admin' | 'member';
  phone?: string;
  phone_verified: boolean;
  email_verified: boolean;
  onboarding_completed: boolean;
  created_at: string;
  last_login?: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  logo_url?: string;
  plan: 'free' | 'starter' | 'growth' | 'enterprise';
  industry?: string;
  website?: string;
  created_at: string;
}

interface AuthState {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  organization: Organization | null;
  initialized: boolean;
  loading: boolean;
}

interface AuthContextType extends AuthState {
  // Email/Password
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string, name: string, tenantId?: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  
  // OTP
  sendOTP: (phone: string) => Promise<{ error?: string }>;
  verifyOTP: (phone: string, otp: string) => Promise<{ error?: string }>;
  
  // Magic Link
  sendMagicLink: (email: string) => Promise<{ error?: string }>;
  
  // Email OTP (via LAALI backend)
  sendEmailOTP: (email: string) => Promise<{ error?: string }>;
  verifyEmailOTP: (email: string, otp: string, name?: string) => Promise<{ error?: string }>;
  
  // Google OAuth
  signInWithGoogle: () => Promise<{ error?: string }>;
  
  // GitHub OAuth
  signInWithGitHub: () => Promise<{ error?: string }>;
  
  // Password Reset
  resetPassword: (email: string) => Promise<{ error?: string }>;
  updatePassword: (newPassword: string) => Promise<{ error?: string }>;
  
  // Profile
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error?: string }>;
  uploadAvatar: (file: File) => Promise<{ url?: string; error?: string }>;
  
  // Organization
  createOrganization: (name: string, slug: string) => Promise<{ error?: string }>;
  
  // Utils
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    profile: null,
    organization: null,
    initialized: false,
    loading: false,
  });

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Get current session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          const profile = await fetchProfile(session.user.id);
          const org = profile?.tenant_id ? await fetchOrganization(profile.tenant_id) : null;
          
          setState({
            user: session.user,
            session,
            profile,
            organization: org,
            initialized: true,
            loading: false,
          });
        } else {
          setState(s => ({ ...s, initialized: true }));
        }
      } catch (error) {
        console.error('Auth init error:', error);
        setState(s => ({ ...s, initialized: true }));
      }
    };

    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth event:', event);
      
      if (event === 'SIGNED_IN' && session?.user) {
        const profile = await fetchProfile(session.user.id);
        const org = profile?.tenant_id ? await fetchOrganization(profile.tenant_id) : null;
        
        setState({
          user: session.user,
          session,
          profile,
          organization: org,
          initialized: true,
          loading: false,
        });
      } else if (event === 'SIGNED_OUT') {
        setState({
          user: null,
          session: null,
          profile: null,
          organization: null,
          initialized: true,
          loading: false,
        });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch user profile
  const fetchProfile = async (userId: string): Promise<UserProfile | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        // If profile doesn't exist, create a basic one
        console.log('Profile not found, will be created on signup');
        return null;
      }
      return data;
    } catch {
      return null;
    }
  };

  // Fetch organization
  const fetchOrganization = async (tenantId: string): Promise<Organization | null> => {
    try {
      const { data } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', tenantId)
        .single();
      return data;
    } catch {
      return null;
    }
  };

  // Email/Password Sign In
  const signIn = useCallback(async (email: string, password: string) => {
    setState(s => ({ ...s, loading: true }));
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { error: error.message };
      return {};
    } catch (e: any) {
      return { error: e.message };
    } finally {
      setState(s => ({ ...s, loading: false }));
    }
  }, []);

  // Email/Password Sign Up
  const signUp = useCallback(async (email: string, password: string, name: string, tenantId?: string) => {
    setState(s => ({ ...s, loading: true }));
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            tenant_id: tenantId || 'demo',
          },
        },
      });
      
      if (error) return { error: error.message };
      
      // Create profile
      if (data.user) {
        await supabase.from('profiles').upsert({
          id: data.user.id,
          email,
          full_name: name,
          tenant_id: tenantId || 'demo',
          role: 'owner',
          email_verified: false,
          phone_verified: false,
          onboarding_completed: false,
          created_at: new Date().toISOString(),
        });
      }
      
      return {};
    } catch (e: any) {
      return { error: e.message };
    } finally {
      setState(s => ({ ...s, loading: false }));
    }
  }, []);

  // Sign Out
  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  // Send OTP to phone
  const sendOTP = useCallback(async (phone: string) => {
    setState(s => ({ ...s, loading: true }));
    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone,
        options: {
          channel: 'sms',
        },
      });
      if (error) return { error: error.message };
      return {};
    } catch (e: any) {
      return { error: e.message };
    } finally {
      setState(s => ({ ...s, loading: false }));
    }
  }, []);

  // Verify OTP
  const verifyOTP = useCallback(async (phone: string, otp: string) => {
    setState(s => ({ ...s, loading: true }));
    try {
      const { error } = await supabase.auth.verifyOtp({
        phone,
        token: otp,
        type: 'sms',
      });
      if (error) return { error: error.message };
      
      // Update profile phone verification
      if (state.profile?.id) {
        await supabase.from('profiles').update({
          phone,
          phone_verified: true,
        }).eq('id', state.profile.id);
      }
      
      return {};
    } catch (e: any) {
      return { error: e.message };
    } finally {
      setState(s => ({ ...s, loading: false }));
    }
  }, [state.profile]);

  // Send Magic Link
  const sendMagicLink = useCallback(async (email: string) => {
    setState(s => ({ ...s, loading: true }));
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) return { error: error.message };
      return {};
    } catch (e: any) {
      return { error: e.message };
    } finally {
      setState(s => ({ ...s, loading: false }));
    }
  }, []);

  // Email OTP - Send (via LAALI backend with Resend)
  const sendEmailOTP = useCallback(async (email: string) => {
    setState(s => ({ ...s, loading: true }));
    try {
      const result = await requestEmailOTP(email);
      if (!result.success) {
        return { error: result.message };
      }
      return {};
    } catch (e: any) {
      return { error: e.message || 'Failed to send verification code' };
    } finally {
      setState(s => ({ ...s, loading: false }));
    }
  }, []);

  // Email OTP - Verify (via LAALI backend)
  const verifyEmailOTP = useCallback(async (email: string, otp: string, name?: string) => {
    setState(s => ({ ...s, loading: true }));
    try {
      const result = await verifyEmailOTPAPI(email, otp, name);
      if (!result.success || result.error) {
        return { error: result.error || result.message };
      }
      
      // On success, we have a token from our backend
      // Create a pseudo-session for the UI to recognize
      // Note: This bypasses Supabase auth since we're using our own backend
      const pseudoUser = {
        id: result.user_id,
        email: result.email,
      } as User;
      
      const pseudoProfile: UserProfile = {
        id: result.user_id,
        email: result.email,
        full_name: name || result.user_id,
        tenant_id: result.tenant_id,
        role: 'member',
        phone_verified: false,
        email_verified: true,
        onboarding_completed: false,
        created_at: new Date().toISOString(),
      };
      
      setState(s => ({
        ...s,
        user: pseudoUser,
        profile: pseudoProfile,
        initialized: true,
        loading: false,
      }));
      
      return {};
    } catch (e: any) {
      return { error: e.message || 'Verification failed' };
    } finally {
      setState(s => ({ ...s, loading: false }));
    }
  }, []);

  // Google OAuth
  const signInWithGoogle = useCallback(async () => {
    setState(s => ({ ...s, loading: true }));
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });
      if (error) return { error: error.message };
      return {};
    } catch (e: any) {
      return { error: e.message };
    } finally {
      setState(s => ({ ...s, loading: false }));
    }
  }, []);

  // GitHub OAuth
  const signInWithGitHub = useCallback(async () => {
    setState(s => ({ ...s, loading: true }));
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          scopes: 'read:user user:email',
        },
      });
      if (error) return { error: error.message };
      return {};
    } catch (e: any) {
      return { error: e.message };
    } finally {
      setState(s => ({ ...s, loading: false }));
    }
  }, []);

  // Reset Password
  const resetPassword = useCallback(async (email: string) => {
    setState(s => ({ ...s, loading: true }));
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      if (error) return { error: error.message };
      return {};
    } catch (e: any) {
      return { error: e.message };
    } finally {
      setState(s => ({ ...s, loading: false }));
    }
  }, []);

  // Update Password
  const updatePassword = useCallback(async (newPassword: string) => {
    setState(s => ({ ...s, loading: true }));
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) return { error: error.message };
      return {};
    } catch (e: any) {
      return { error: e.message };
    } finally {
      setState(s => ({ ...s, loading: false }));
    }
  }, []);

  // Update Profile
  const updateProfile = useCallback(async (updates: Partial<UserProfile>) => {
    if (!state.user) return { error: 'Not authenticated' };
    
    setState(s => ({ ...s, loading: true }));
    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', state.user.id);
      
      if (error) return { error: error.message };
      
      setState(s => ({
        ...s,
        profile: s.profile ? { ...s.profile, ...updates } : null,
      }));
      
      return {};
    } catch (e: any) {
      return { error: e.message };
    } finally {
      setState(s => ({ ...s, loading: false }));
    }
  }, [state.user]);

  // Upload Avatar
  const uploadAvatar = useCallback(async (file: File) => {
    if (!state.user) return { error: 'Not authenticated' };
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${state.user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);
      
      if (uploadError) return { error: uploadError.message };
      
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);
      
      await updateProfile({ avatar_url: publicUrl });
      
      return { url: publicUrl };
    } catch (e: any) {
      return { error: e.message };
    }
  }, [state.user, updateProfile]);

  // Create Organization
  const createOrganization = useCallback(async (name: string, slug: string) => {
    if (!state.user) return { error: 'Not authenticated' };
    
    setState(s => ({ ...s, loading: true }));
    try {
      const orgId = crypto.randomUUID();
      
      const { error: orgError } = await supabase
        .from('organizations')
        .insert({
          id: orgId,
          name,
          slug,
          plan: 'free',
          created_at: new Date().toISOString(),
        });
      
      if (orgError) return { error: orgError.message };
      
      // Update user profile with new org
      await supabase
        .from('profiles')
        .update({ tenant_id: orgId })
        .eq('id', state.user.id);
      
      return {};
    } catch (e: any) {
      return { error: e.message };
    } finally {
      setState(s => ({ ...s, loading: false }));
    }
  }, [state.user]);

  // Refresh Session
  const refreshSession = useCallback(async () => {
    const { data: { session } } = await supabase.auth.refreshSession();
    if (session) {
      setState(s => ({ ...s, session }));
    }
  }, []);

  return (
    <AuthContext.Provider value={{
      ...state,
      signIn,
      signUp,
      signOut,
      sendOTP,
      verifyOTP,
      sendMagicLink,
      sendEmailOTP,
      verifyEmailOTP,
      signInWithGoogle,
      signInWithGitHub,
      resetPassword,
      updatePassword,
      updateProfile,
      uploadAvatar,
      createOrganization,
      refreshSession,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }
  return context;
}
