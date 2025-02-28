import { auth, db } from '@/lib/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut as firebaseSignOut, Auth } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { User } from '@/types/user';
import { v4 as uuidv4 } from 'uuid';

export type SignInCredentials = {
  email: string;
  password: string;
};

export type SignUpCredentials = {
  email: string;
  password: string;
  fullName: string;
  userType: 'participant' | 'partner';
  organization?: string;
  position?: string;
  status?: 'pending' | 'approved';
};

export const signIn = async ({ email, password }: SignInCredentials) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    const userDoc = await getDoc(doc(db, 'profiles', user.uid));
    const profile = userDoc.data();
    return { user: { ...user, role: profile?.user_type || 'participant', status: profile?.status || 'pending' } };
  } catch (error) {
    console.error('SignIn error:', error);
    throw error;
  }
};

export const AdminSignIn = async ({ email, password }: SignInCredentials) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    const userDoc = await getDoc(doc(db, 'profiles', user.uid));
    const profile = userDoc.data();
    if (profile?.user_type !== 'admin') {
      throw new Error('Unauthorized access');
    }
    return { user: { ...user, role: profile?.user_type} };
  } catch (error) {
    console.error('SignIn error:', error);
    throw error;
  }
};

export const signUp = async ({ 
  email, 
  password, 
  fullName, 
  userType, 
  organization, 
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
        logo_url: '',
        type: 'Company',
        address: '',
        email: email,
        phone: '',
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: user.uid
      });
    }

    // Create user profile with org reference
    await setDoc(doc(db, 'profiles', user.uid), {
      full_name: fullName,
      user_type: userType,
      status: userType === 'partner' ? 'pending' : 'approved',
      ...(organizationId && { organization_id: organizationId }),
      ...(organization && { organization }),
      ...(position && { position }),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

    return { 
      ...user, 
      userType,
      ...(organizationId && { organizationId })
    };
  } catch (error) {
    console.error('SignUp error:', error);
    throw error;
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
  const userDoc = await getDoc(doc(db, 'profiles', user.uid));
  const profile = userDoc.data();
  return {
    id: user.uid,
    email: user.email || '',
    fullName: profile?.full_name,
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