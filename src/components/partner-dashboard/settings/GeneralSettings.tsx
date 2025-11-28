import { useState, useEffect } from 'react';
import { User as UserIcon, Palette, Key, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { User } from '@/types/user';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { updateUserPassword } from '@/services/authActions';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface GeneralSettingsProps {
  user: User | null;
}

const RequirementItem = ({ met, text }: { met: boolean; text: string }) => (
  <li className="flex items-center space-x-2 text-xs">
    {met ? (
      <Check className="h-3 w-3 text-emerald-500" />
    ) : (
      <div className="h-3 w-3 rounded-full border border-slate-300 dark:border-slate-600" />
    )}
    <span className={met ? "text-emerald-600 dark:text-emerald-400" : "text-slate-500 dark:text-slate-400"}>
      {text}
    </span>
  </li>
);

export const GeneralSettings = ({ user }: GeneralSettingsProps) => {
  const { theme, setTheme, actualTheme } = useTheme();
  const { refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);

  // Profile state
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [isProfileChanged, setIsProfileChanged] = useState(false);

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [passwordRequirements, setPasswordRequirements] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false
  });

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      setIsProfileChanged(
        firstName !== (user.firstName || '') || 
        lastName !== (user.lastName || '')
      );
    }
  }, [firstName, lastName, user]);

  useEffect(() => {
    setPasswordRequirements({
      length: newPassword.length >= 8,
      uppercase: /[A-Z]/.test(newPassword),
      lowercase: /[a-z]/.test(newPassword),
      number: /\d/.test(newPassword),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword)
    });
  }, [newPassword]);

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
  };

  const handleProfileUpdate = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      toast.error('First name and last name are required');
      return;
    }

    if (!user?.id) return;

    // Get organization ID from user object
    const orgId = (user as any).organization?.id;

    if (!orgId) {
        toast.error('Organization ID not found');
        return;
    }

    setLoading(true);
    try {
      const staffRef = doc(db, 'organizations', orgId, 'staff', user.id);
      await updateDoc(staffRef, {
        firstName,
        lastName
      });
      
      toast.success('Profile updated successfully');
      setIsProfileChanged(false);
      await refreshUser();
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
        toast.error('Please fill in all password fields');
        return;
    }

    if (newPassword !== confirmPassword) {
        toast.error('New passwords do not match');
        return;
    }

    if (!Object.values(passwordRequirements).every(Boolean)) {
        toast.error('Please meet all password requirements');
        return;
    }

    setLoading(true);
    try {
        await updateUserPassword(currentPassword, newPassword);
        toast.success('Password updated successfully');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
    } catch (error: any) {
        console.error('Failed to update password:', error);
        toast.error(error.message || 'Failed to update password');
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
      <div className="space-y-4 sm:space-y-6">
        {/* Account Information */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 sm:p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-blue-500/10 rounded-xl">
              <UserIcon className="h-5 w-5 text-blue-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Account Information</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Email Address</label>
              <Input 
                value={user?.email || ''} 
                className="w-full bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600"
                disabled
              />
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Contact support to change your email</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">First Name</label>
                <Input 
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600"
                  placeholder="Enter your first name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Last Name</label>
                <Input 
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600"
                  placeholder="Enter your last name"
                />
              </div>
            </div>

            <div className="pt-2">
              <Button 
                onClick={handleProfileUpdate}
                disabled={loading || !isProfileChanged}
                className="w-full bg-slate-900 dark:bg-slate-100 text-slate-100 dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200"
              >
                {loading ? 'Updating...' : 'Update Profile'}
              </Button>
            </div>
          </div>
        </div>

        {/* Appearance Settings */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 sm:p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-emerald-500/10 rounded-xl">
              <Palette className="h-5 w-5 text-emerald-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Appearance</h3>
          </div>
          
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-700/50">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">Theme</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Choose your preferred theme</p>
                </div>
                <Badge variant="outline" className="border-emerald-200 text-emerald-700 bg-emerald-50 dark:border-emerald-800 dark:text-emerald-300 dark:bg-emerald-900/20">
                  {theme === 'system' ? 'System' : theme === 'dark' ? 'Dark' : 'Light'}
                  {theme === 'system' && (
                    <span className="ml-1 text-xs opacity-75">
                      ({actualTheme === 'dark' ? 'Dark' : 'Light'})
                    </span>
                  )}
                </Badge>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'light', label: 'Light' },
                  { value: 'dark', label: 'Dark' },
                  { value: 'system', label: 'System' }
                ].map((themeOption) => (
                  <button
                    key={themeOption.value}
                    onClick={() => handleThemeChange(themeOption.value as 'light' | 'dark' | 'system')}
                    className={`p-2 rounded-lg text-xs font-medium transition-colors duration-200 ${
                      theme === themeOption.value
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300' 
                        : 'bg-white dark:bg-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-500'
                    }`}
                  >
                    {themeOption.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Change Password */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 sm:p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-amber-500/10 rounded-xl">
            <Key className="h-5 w-5 text-amber-600" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Change Password</h3>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Current Password</label>
            <Input 
              type="password"
              className="w-full bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600"
              placeholder="Enter current password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">New Password</label>
            <Input 
              type="password"
              className="w-full bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <div className="mt-3 space-y-2 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-700">
                <p className="text-xs font-medium text-slate-700 dark:text-slate-300">Password requirements:</p>
                <ul className="space-y-1.5">
                    <RequirementItem met={passwordRequirements.length} text="At least 8 characters" />
                    <RequirementItem met={passwordRequirements.uppercase} text="One uppercase letter" />
                    <RequirementItem met={passwordRequirements.lowercase} text="One lowercase letter" />
                    <RequirementItem met={passwordRequirements.number} text="One number" />
                    <RequirementItem met={passwordRequirements.special} text="One special character" />
                </ul>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Confirm New Password</label>
            <Input 
              type="password"
              className="w-full bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
            <Button 
              className="w-full bg-slate-900 dark:bg-slate-100 text-slate-100 dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200"
              onClick={handlePasswordChange}
              disabled={loading || !currentPassword || !newPassword || !confirmPassword || !Object.values(passwordRequirements).every(Boolean)}
            >
              {loading ? 'Updating...' : (
                <>
                  <Key className="h-4 w-4 mr-2" />
                  Update Password
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
