import { useState, useEffect } from 'react';
import { Building2, Upload, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from '@/components/ui/badge';
import { User } from '@/types/user';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { doc, updateDoc } from 'firebase/firestore';
import { db, storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

interface OrganizationSettingsProps {
  user: User | null;
}

export const OrganizationSettings = ({ user }: OrganizationSettingsProps) => {
  const { refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Organization state
  const [orgName, setOrgName] = useState('');
  const [orgWebsite, setOrgWebsite] = useState('');
  const [orgDescription, setOrgDescription] = useState('');
  const [orgIndustry, setOrgIndustry] = useState('technology');
  const [orgType, setOrgType] = useState('Company');
  const [isOrgChanged, setIsOrgChanged] = useState(false);

  useEffect(() => {
    if (user) {
      const org = (user as any).organization || {};
      setOrgName(org.name || '');
      setOrgWebsite(org.website || '');
      setOrgDescription(org.description || '');
      setOrgIndustry(org.industry || 'technology');
      setOrgType(org.type || 'Company');
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      const org = (user as any).organization || {};
      setIsOrgChanged(
        orgName !== (org.name || '') ||
        orgWebsite !== (org.website || '') ||
        orgDescription !== (org.description || '') ||
        orgIndustry !== (org.industry || 'technology') ||
        orgType !== (org.type || 'Company') ||
        logoFile !== null
      );
    }
  }, [orgName, orgWebsite, orgDescription, orgIndustry, orgType, logoFile, user]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleOrganizationUpdate = async () => {
    if (!orgName.trim()) {
      toast.error('Organization name is required');
      return;
    }

    const orgId = (user as any).organization?.id;
    if (!orgId) {
      toast.error('Organization ID not found');
      return;
    }

    setLoading(true);
    try {
      let logoUrl = (user as any).organization?.logo;

      if (logoFile) {
        // Delete old logo if it exists
        const oldLogoUrl = (user as any).organization?.logo || (user as any).organization?.logo_url;
        if (oldLogoUrl) {
          try {
            const oldLogoRef = ref(storage, oldLogoUrl);
            await deleteObject(oldLogoRef);
          } catch (error) {
            console.warn('Failed to delete old logo:', error);
            // Continue even if delete fails
          }
        }

        const storageRef = ref(storage, `organizations/${orgId}/logo/${logoFile.name}`);
        await uploadBytes(storageRef, logoFile);
        logoUrl = await getDownloadURL(storageRef);
      }
      
      const orgRef = doc(db, 'organizations', orgId);
      await updateDoc(orgRef, {
        name: orgName,
        website: orgWebsite,
        description: orgDescription,
        industry: orgIndustry,
        type: orgType,
        logo: logoUrl,
        updatedAt: new Date().toISOString()
      });
      
      toast.success('Organization profile updated successfully');
      setIsOrgChanged(false);
      setLogoFile(null); // Reset logo file after upload
      await refreshUser();
    } catch (error) {
      console.error('Failed to update organization:', error);
      toast.error('Failed to update organization profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Organization Profile */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-4 sm:p-6">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-1 text-slate-900 dark:text-white">Organization Profile</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Update your organization's public information
            </p>
          </div>
          <Badge variant="outline" className="text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-600">
            Partner
          </Badge>
        </div>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Organization Logo
              </label>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={previewUrl || (user as any)?.organization?.logo || ''} />
                    <AvatarFallback>
                      <Building2 className="h-8 w-8 text-slate-400 dark:text-slate-500" />
                    </AvatarFallback>
                  </Avatar>
                  <label 
                    htmlFor="logo-upload" 
                    className="absolute -bottom-2 -right-2 p-1.5 rounded-full bg-slate-900 dark:bg-slate-100 text-slate-100 dark:text-slate-900 cursor-pointer hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors"
                  >
                    <Upload className="h-4 w-4" />
                  </label>
                  <input
                    id="logo-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleLogoChange}
                  />
                </div>
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  <p>Upload a new organization logo</p>
                  <p>PNG, JPG up to 2MB</p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Organization Name
              </label>
              <Input 
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                className="max-w-md bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                placeholder="Enter organization name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Organization Type
              </label>
              <select 
                value={orgType}
                onChange={(e) => setOrgType(e.target.value)}
                className="max-w-md w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white p-2"
              >
                <option value="Company">Company</option>
                <option value="Startup">Startup</option>
                <option value="Non-Profit">Non-Profit</option>
                <option value="Government">Government</option>
                <option value="Educational Institution">Educational Institution</option>
                <option value="Research Organization">Research Organization</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Website
              </label>
              <div className="relative max-w-md">
                <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
                <Input 
                  type="url"
                  value={orgWebsite}
                  onChange={(e) => setOrgWebsite(e.target.value)}
                  placeholder="https://example.com"
                  className="pl-10 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Description
              </label>
              <textarea 
                value={orgDescription}
                onChange={(e) => setOrgDescription(e.target.value)}
                className="w-full min-h-[150px] rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white p-3"
                placeholder="Describe your organization"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Industry
              </label>
              <select 
                value={orgIndustry}
                onChange={(e) => setOrgIndustry(e.target.value)}
                className="w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white p-2"
              >
                <option value="technology">Technology</option>
                <option value="finance">Finance</option>
                <option value="healthcare">Healthcare</option>
                <option value="education">Education</option>
                <option value="retail">Retail</option>
                <option value="manufacturing">Manufacturing</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <Button 
            onClick={handleOrganizationUpdate}
            disabled={loading || !isOrgChanged}
            className="bg-slate-900 dark:bg-slate-100 text-slate-100 dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </div>
  );
};
