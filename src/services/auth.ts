import { auth, db, functions } from '@/lib/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut as firebaseSignOut } from 'firebase/auth';
import { httpsCallable } from 'firebase/functions';
import { doc, getDoc } from 'firebase/firestore';
import { User } from '@/types/user';
import { sendEmailVerification } from './authActions';

// Cloud function references
const signUpFunction = httpsCallable(functions, 'signUp');
const signInFunction = httpsCallable(functions, 'signIn');
const adminSignInFunction = httpsCallable(functions, 'adminSignIn');

export type SignInCredentials = {
  email: string;
  password: string;
};

export type SignUpCredentials = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  userType: 'participant' | 'partner';
  organization?: string;
  organizationType?: string;
  position?: string;
  status?: 'pending' | 'approved';
};

/**
 * Convert Firebase auth error codes to user-friendly messages
 */
const getAuthErrorMessage = (error: any): string => {
  const errorCode = error?.code || '';
  
  switch (errorCode) {
    case 'auth/email-already-in-use':
      return 'This email address is already registered. Please sign in or use a different email.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/operation-not-allowed':
      return 'Email/password accounts are not enabled. Please contact support.';
    case 'auth/weak-password':
      return 'Password is too weak. Please use a stronger password.';
    case 'auth/user-disabled':
      return 'This account has been disabled. Please contact support.';
    case 'auth/user-not-found':
      return 'No account found with this email address.';
    case 'auth/wrong-password':
      return 'Incorrect password. Please try again.';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again later.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your internet connection.';
    case 'auth/popup-closed-by-user':
      return 'Sign-in was cancelled. Please try again.';
    case 'auth/invalid-credential':
      return 'Invalid email or password. Please try again.';
    default:
      return error?.message || 'An error occurred. Please try again.';
  }
};

export const signIn = async ({ email, password }: SignInCredentials) => {
  try {
    // Step 1: Authenticate with Firebase Auth
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;
    
    // Step 2: Call cloud function to get user profile and validate
    const result = await signInFunction({ uid: firebaseUser.uid });
    const data = result.data as any;
    
    // Step 3: Check email verification
    if (!data.emailVerified) {
      throw new Error('Please verify your email before signing in. Check your inbox for the verification link.');
    }
    
    if (!data.success) {
      throw new Error(data.message || 'Failed to sign in');
    }
    
    // Return user data
    return { 
      user: {
        ...firebaseUser,
        role: data.userData.userType,
        status: data.userData.status,
        emailVerified: firebaseUser.emailVerified,
        ...data.userData
      }
    };
  } catch (error) {
    console.error('SignIn error:', error);
    throw new Error(getAuthErrorMessage(error));
  }
};

export const AdminSignIn = async ({ email, password }: SignInCredentials) => {
  try {
    // Step 1: Authenticate with Firebase Auth
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Step 2: Validate admin access via cloud function
    const result = await adminSignInFunction({ uid: user.uid });
    const data = result.data as any;
    
    if (!data.success) {
      throw new Error(data.message || 'Unauthorized access');
    }
    
    return { 
      user: { 
        ...user, 
        role: data.userData.userType,
        ...data.userData
      } 
    };
  } catch (error) {
    console.error('Admin SignIn error:', error);
    throw new Error(getAuthErrorMessage(error));
  }
};

export const signUp = async ({ 
  email, 
  password, 
  firstName,
  lastName,
  userType, 
  organization,
  organizationType,
  position 
}: SignUpCredentials) => {
  try {
    // Step 1: Create Firebase Auth user
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Step 2: Call cloud function to create user profile and related documents
    const result = await signUpFunction({
      uid: user.uid,
      email,
      firstName,
      lastName,
      userType,
      ...(userType === 'partner' && {
        organization,
        organizationType,
        position
      })
    });
    
    const data = result.data as any;
    
    if (!data.success) {
      // If cloud function fails, delete the auth user to keep things clean
      try {
        await user.delete();
      } catch (deleteError) {
        console.error('Failed to delete auth user after profile creation failure:', deleteError);
      }
      throw new Error(data.message || 'Failed to complete signup');
    }
    
    // Step 3: Send email verification
    try {
      await sendEmailVerification();
    } catch (error) {
      console.error('Failed to send verification email:', error);
      // Don't throw error, user can request it later
    }

    return { 
      ...user, 
      userType,
      organizationId: data.organizationId
    };
  } catch (error) {
    console.error('SignUp error:', error);
    throw new Error(getAuthErrorMessage(error));
  }
};

export const signOut = async () => {
  try {
    await firebaseSignOut(auth);
    console.log('Signed out successfully');
  } catch (error) {
    console.error('Error during sign out:', error);
  }
};

// Export centralized user functions
export { getCurrentUser, isAuthenticated, getUserType } from './user';