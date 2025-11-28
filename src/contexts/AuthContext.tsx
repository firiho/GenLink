import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { User } from '@/types/user';
import { getCurrentUser } from '@/services/user';

export interface AuthUser extends User {
  uid: any;
  userType: 'partner' | 'participant' | 'admin';
  status?: 'pending' | 'approved';
  firstName?: string;
  lastName?: string;
  role?: 'partner' | 'participant' | 'admin';
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserData = async (firebaseUser: any) => {
    try {
        // Use centralized user data fetch
        const userData = await getCurrentUser();
        
        console.log('User data fetched:', userData);

        if (userData) {
          const authUser: AuthUser = {
            uid: firebaseUser.uid,
            email: userData.email || '',
            id: userData.id,
            userType: userData.userType || 'partner',
            status: userData.status,
            firstName: userData.firstName,
            lastName: userData.lastName,
            aud: '',
            created_at: userData.createdAt || '',
            app_metadata: {},
            user_metadata: {},
            role: userData.userType || 'partner',
            onboardingComplete: userData.onboardingComplete
          };

          setUser(authUser);
        } else {
          setUser(null);
        }
    } catch (error) {
      console.error('Auth error:', error);
      setUser(null);
    }
  };

  const refreshUser = async () => {
    if (auth.currentUser) {
      await fetchUserData(auth.currentUser);
    }
  };

  useEffect(() => {
    console.log("AuthProvider mounted");
    
    let isFirstAuthState = true;
    let currentUserUid: string | null = null;
    
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('Auth state changed:', { firebaseUser, isFirstAuthState });
      
      // Prevent unnecessary updates if the user hasn't changed
      if (firebaseUser && currentUserUid === firebaseUser.uid) {
        console.log('User unchanged, skipping update');
        return;
      }
      
      currentUserUid = firebaseUser?.uid || null;
      
      try {
        if (firebaseUser) {
          await fetchUserData(firebaseUser);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Auth error:', error);
        setUser(null);
      } finally {
        // Only set loading to false on the first auth state change
        if (isFirstAuthState) {
          setLoading(false);
          isFirstAuthState = false;
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const value = { user, loading, refreshUser };
  // Only log the final state, not intermediate states
  if (!loading) {
    console.log("AuthProvider state:", value);
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};