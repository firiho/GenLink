import { useEffect, useState } from 'react';
import { Plus, ChevronRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from '@/components/ui/badge';
import { AddMemberDialog } from './AddMemberDialog';
import { useAuth } from '@/contexts/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { PERMISSION_LABELS, Permission } from '@/constants/permissions';

interface StaffMember {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  position: string;
  permissions: Permission[];
  avatar?: string;
}

export const TeamSettings = () => {
  const { user } = useAuth();
  const { canManageTeam } = usePermissions();
  const [members, setMembers] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMembers = async () => {
    if (!user?.organization?.id) return;
    
    try {
      const querySnapshot = await getDocs(collection(db, 'organizations', user.organization.id, 'staff'));
      const staffData = querySnapshot.docs.map(doc => doc.data() as StaffMember);
      setMembers(staffData);
    } catch (error) {
      console.error("Error fetching members:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [user?.organization?.id]);

  const formatPermission = (p: string) => {
    // @ts-ignore
    if (PERMISSION_LABELS[p]) return PERMISSION_LABELS[p as Permission];
    return p.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
      <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Team Members</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Manage your team members and their roles</p>
          </div>
          {canManageTeam && (
            <AddMemberDialog onMemberAdded={fetchMembers} />
          )}
        </div>
      </div>

      <div className="divide-y divide-slate-200 dark:divide-slate-700">
        {loading ? (
          <div className="p-8 flex justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
          </div>
        ) : members.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            No team members found.
          </div>
        ) : (
          members.map((member) => (
            <div key={member.userId} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50">
              <div className="flex items-center space-x-4">
                <Avatar>
                  <AvatarImage src={member.avatar} />
                  <AvatarFallback className="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100">
                    {member.firstName?.[0]}{member.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">{member.firstName} {member.lastName}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{member.email}</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500">{member.position}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex flex-col items-end gap-1">
                    <div className="flex gap-1 flex-wrap justify-end max-w-[300px]">
                        {member.permissions?.slice(0, 3).map(p => (
                          <Badge key={p} variant="secondary" className="text-[10px]">
                            {formatPermission(p)}
                          </Badge>
                        ))}
                        {member.permissions?.length > 3 && (
                          <Badge variant="secondary" className="text-[10px]">
                            +{member.permissions.length - 3} more
                          </Badge>
                        )}
                    </div>
                </div>
                
                <Button variant="ghost" size="sm" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
