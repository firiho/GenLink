import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { User } from '@/types/user';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface AuthUser extends User {
  uid: any;
  userType: 'partner' | 'participant' | 'admin';
  status?: 'pending' | 'approved';
  fullName?: string;
  role?: 'partner' | 'participant' | 'admin';
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("AuthProvider mounted");
    
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('Auth state changed:', { firebaseUser });
      
      try {
        if (firebaseUser) {
          const docRef = doc(db, 'profiles', firebaseUser.uid);
          const docSnap = await getDoc(docRef);
          const profileData = docSnap.data();
          
          console.log('Profile data:', profileData);

          const authUser: AuthUser = {
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            id: firebaseUser.uid,
            userType: profileData?.user_type || 'partner',
            status: profileData?.status,
            fullName: profileData?.full_name,
            aud: '',
            created_at: '',
            app_metadata: {},
            user_metadata: {},
            role: profileData?.user_type || 'partner'
          };

          setUser(authUser);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Auth error:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const value = { user, loading };
  console.log("AuthProvider state:", value);

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