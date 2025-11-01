import { auth, db } from '@/lib/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut as firebaseSignOut, Auth, AuthError } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { User } from '@/types/user';
import { v4 as uuidv4 } from 'uuid';
import { sendEmailVerification } from './authActions';

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
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;
    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
    const profile = userDoc.data();
    return { 
      user: { ...firebaseUser, role: profile?.user_type || 'participant', status: profile?.status || 'pending', emailVerified: firebaseUser.emailVerified }
    };
  } catch (error) {
    console.error('SignIn error:', error);
    throw new Error(getAuthErrorMessage(error));
  }
};

export const AdminSignIn = async ({ email, password }: SignInCredentials) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    const profile = userDoc.data();
    if (profile?.user_type !== 'admin') {
      throw new Error('Unauthorized access');
    }
    return { user: { ...user, role: profile?.user_type} };
  } catch (error) {
    console.error('SignIn error:', error);
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
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    let organizationId: string | undefined;

    if (userType === 'partner' && organization) {
      // Generate org ID
      organizationId = uuidv4();
      
      // Create organization record
      await setDoc(doc(db, 'organizations', organizationId), {
        id: organizationId,
        name: organization,
        type: organizationType || 'Company',
        address: '',
        email: email,
        phone: '',
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: user.uid
      });

      // Create staff document for partner
      await setDoc(doc(db, 'organizations', organizationId, 'staff', user.uid), {
        userId: user.uid,
        firstName: firstName,
        lastName: lastName,
        email: email,
        phone: '',
        position: position || '',
        permissions: ['owner', 'admin', 'create_challenges', 'manage_submissions', 'view_analytics'],
        role: 'owner',
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    }

    // Create user profile with org reference
    await setDoc(doc(db, 'users', user.uid), {
      user_type: userType,
      status: userType === 'partner' ? 'pending' : 'approved',
      ...(organizationId && { organization_id: organizationId }),
      ...(userType === 'participant' && { onboardingComplete: false }),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

    // Create public profile for participants (used for teams, challenges, community)
    if (userType === 'participant') {
      await setDoc(doc(db, 'profiles', user.uid), {
        userId: user.uid,
        firstName: firstName,
        lastName: lastName,
        email: email,
        photo: '',
        title: '',
        location: '',
        about: '',
        skills: [],
        experience: [],
        education: [],
        projects: [],
        certifications: [],
        social: {
          github: '',
          twitter: '',
          linkedin: ''
        },
        // Stats fields
        total_active_challenges: 0,
        total_submissions: 0,
        total_active_team_members: 0,
        projectsCount: 0,
        contributions: 0,
        success_rate: 0,
        badges: [],
        submissions: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }

    // Send email verification for both participants and partners
    try {
      await sendEmailVerification();
    } catch (error) {
      console.error('Failed to send verification email:', error);
      // Don't throw error, user can request it later
    }

    return { 
      ...user, 
      userType,
      ...(organizationId && { organizationId })
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

export const getCurrentUser = async (): Promise<User | null> => {
  const user = auth.currentUser;
  if (!user) return null;
  const userDoc = await getDoc(doc(db, 'users', user.uid));
  const profile = userDoc.data();
  
  // Get additional profile info based on user type
  let firstName, lastName, phone, fieldType;
  if (profile?.user_type === 'participant') {
    const participantProfile = await getDoc(doc(db, 'profiles', user.uid));
    const participantData = participantProfile.data();
    firstName = participantData?.firstName;
    lastName = participantData?.lastName;
    phone = participantData?.phone;
    fieldType = participantData?.fieldType;
  } else if (profile?.user_type === 'partner' && profile?.organization_id) {
    const staffDoc = await getDoc(doc(db, 'organizations', profile.organization_id, 'staff', user.uid));
    const staffData = staffDoc.data();
    firstName = staffData?.firstName;
    lastName = staffData?.lastName;
    phone = staffData?.phone;
  }
  
  return {
    id: user.uid,
    email: user.email || '',
    firstName,
    lastName,
    phone,
    fieldType,
    userType: profile?.user_type || 'participant',
    status: profile?.status || 'pending',
    organization: profile?.organization,
    createdAt: user.metadata.creationTime,
  } as User;
};

export const isAuthenticated = async (): Promise<boolean> => {
  const user = await getCurrentUser();
  return !!user;
};