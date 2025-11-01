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
  firstName?: string;
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
          const docRef = doc(db, 'users', firebaseUser.uid);
          const docSnap = await getDoc(docRef);
          const profileData = docSnap.data();
          
          console.log('Profile data:', profileData);

          // Get additional profile info based on user type
          let firstName;
          if (profileData?.user_type === 'participant') {
            const participantProfile = await getDoc(doc(db, 'profiles', firebaseUser.uid));
            const participantData = participantProfile.data();
            firstName = participantData?.firstName;
          } else if (profileData?.user_type === 'partner' && profileData?.organization_id) {
            const staffDoc = await getDoc(doc(db, 'organizations', profileData.organization_id, 'staff', firebaseUser.uid));
            const staffData = staffDoc.data();
            firstName = staffData?.firstName;
          }

          const authUser: AuthUser = {
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            id: firebaseUser.uid,
            userType: profileData?.user_type || 'partner',
            status: profileData?.status,
            firstName,
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
        // Only set loading to false on the first auth state change
        if (isFirstAuthState) {
          setLoading(false);
          isFirstAuthState = false;
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const value = { user, loading };
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