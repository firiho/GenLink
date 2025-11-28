import { 
  sendPasswordResetEmail, 
  confirmPasswordReset, 
  applyActionCode,
  verifyPasswordResetCode,
  checkActionCode,
  sendEmailVerification as firebaseSendEmailVerification,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider
} from 'firebase/auth';
import { auth } from '@/lib/firebase';

/**
 * Centralized Firebase authentication action handlers
 * Handles password reset, email verification, and other auth actions
 */

// Action code settings for email links
const actionCodeSettings = {
  url: `${window.location.origin}/signin`, // Redirect URL after action
  handleCodeInApp: false,
};

/**
 * Send password reset email
 */
export const sendPasswordReset = async (email: string): Promise<void> => {
  try {
    await sendPasswordResetEmail(auth, email, {
      url: `${window.location.origin}/signin`,
      handleCodeInApp: false,
    });
  } catch (error: any) {
    console.error('Error sending password reset email:', error);
    throw new Error(getAuthErrorMessage(error.code));
  }
};

/**
 * Verify password reset code
 */
export const verifyResetCode = async (oobCode: string): Promise<string> => {
  try {
    const email = await verifyPasswordResetCode(auth, oobCode);
    return email;
  } catch (error: any) {
    console.error('Error verifying reset code:', error);
    throw new Error(getAuthErrorMessage(error.code));
  }
};

/**
 * Confirm password reset with new password
 */
export const resetPassword = async (oobCode: string, newPassword: string): Promise<void> => {
  try {
    await confirmPasswordReset(auth, oobCode, newPassword);
  } catch (error: any) {
    console.error('Error resetting password:', error);
    throw new Error(getAuthErrorMessage(error.code));
  }
};

/**
 * Send email verification to current user
 */
export const sendEmailVerification = async (): Promise<void> => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('No user is currently signed in');
  }

  try {
    await firebaseSendEmailVerification(user, {
      url: `${window.location.origin}/dashboard`,
      handleCodeInApp: false,
    });
  } catch (error: any) {
    console.error('Error sending verification email:', error);
    throw new Error(getAuthErrorMessage(error.code));
  }
};

/**
 * Verify email with action code
 */
export const verifyEmail = async (oobCode: string): Promise<void> => {
  try {
    await applyActionCode(auth, oobCode);
  } catch (error: any) {
    console.error('Error verifying email:', error);
    throw new Error(getAuthErrorMessage(error.code));
  }
};

/**
 * Update user password
 */
export const updateUserPassword = async (currentPassword: string, newPassword: string): Promise<void> => {
  const user = auth.currentUser;
  if (!user || !user.email) {
    throw new Error('No user is currently signed in');
  }

  try {
    // Re-authenticate user first
    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, credential);
    
    // Update password
    await updatePassword(user, newPassword);
  } catch (error: any) {
    console.error('Error updating password:', error);
    throw new Error(getAuthErrorMessage(error.code));
  }
};

/**
 * Check what type of action the code is for
 */
export const checkActionCodeInfo = async (oobCode: string) => {
  try {
    const info = await checkActionCode(auth, oobCode);
    return {
      operation: info.operation,
      email: info.data.email,
    };
  } catch (error: any) {
    console.error('Error checking action code:', error);
    throw new Error(getAuthErrorMessage(error.code));
  }
};

/**
 * Helper function to get user-friendly error messages
 */
function getAuthErrorMessage(errorCode: string): string {
  switch (errorCode) {
    case 'auth/expired-action-code':
      return 'This link has expired. Please request a new one.';
    case 'auth/invalid-action-code':
      return 'This link is invalid or has already been used.';
    case 'auth/user-disabled':
      return 'This account has been disabled.';
    case 'auth/user-not-found':
      return 'No account found with this email address.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters.';
    case 'auth/invalid-email':
      return 'Invalid email address.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please try again later.';
    default:
      return 'An error occurred. Please try again.';
  }
}
