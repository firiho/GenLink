/**
 * Centralized User Data Service
 * 
 * SECURITY: Users can ONLY access their own data.
 * This service fetches only the authenticated user's data.
 */

import { auth, functions, db } from '@/lib/firebase';
import { httpsCallable } from 'firebase/functions';
import { doc, updateDoc } from 'firebase/firestore';
import { User } from '@/types/user';

// Cloud function reference
const getUserFunction = httpsCallable(functions, 'getUser');

/**
 * Get current user's own data
 * SECURITY: Can ONLY access your own data, never another user's
 */
export const getCurrentUser = async (): Promise<User | null> => {
  const firebaseUser = auth.currentUser;
  
  if (!firebaseUser) {
    return null;
  }
  
  try {
    // No uid parameter needed - backend uses authenticated user's ID
    const result = await getUserFunction({});
    const data = result.data as any;
    
    if (!data.success) {
      console.error('Failed to get user data:', data.message);
      return null;
    }
    
    return {
      id: data.userData.id,
      email: data.userData.email,
      firstName: data.userData.firstName,
      lastName: data.userData.lastName,
      phone: data.userData.phone,
      userType: data.userData.userType,
      status: data.userData.status,
      organization: data.userData.organization,
      profileVisibility: data.userData.profileVisibility,
      ...data.userData,
    } as User;
  } catch (error) {
    console.error('Error fetching user data:', error);
    return null;
  }
};

/**
 * Update user data
 */
export const updateUser = async (data: Partial<User>): Promise<boolean> => {
  const user = auth.currentUser;
  if (!user) return false;

  try {
    // Update profile visibility in profiles collection
    if (data.profileVisibility) {
      const profileRef = doc(db, 'profiles', user.uid);
      await updateDoc(profileRef, {
        visibility: data.profileVisibility,
        updated_at: new Date().toISOString()
      });
    }
    
    return true;
  } catch (error) {
    console.error('Error updating user:', error);
    return false;
  }
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  return !!auth.currentUser;
};

/**
 * Get user type quickly
 */
export const getUserType = async (): Promise<'participant' | 'partner' | 'admin' | null> => {
  const user = await getCurrentUser();
  return user?.userType || null;
};

