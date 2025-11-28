import { useAuth } from '@/contexts/AuthContext';
import { Permission, PERMISSIONS } from '@/constants/permissions';

export const usePermissions = () => {
  const { user } = useAuth();

  const hasPermission = (permission: Permission) => {
    if (!user || !user.permissions) return false;
    return user.permissions.includes(permission);
  };

  const hasAnyPermission = (permissions: Permission[]) => {
    if (!user || !user.permissions) return false;
    return permissions.some(p => user.permissions!.includes(p));
  };

  const hasAllPermissions = (permissions: Permission[]) => {
    if (!user || !user.permissions) return false;
    return permissions.every(p => user.permissions!.includes(p));
  };

  return {
    permissions: user?.permissions || [],
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canManageChallenges: user?.permissions?.includes(PERMISSIONS.MANAGE_CHALLENGES) || false,
    canManageSubmissions: user?.permissions?.includes(PERMISSIONS.MANAGE_SUBMISSIONS) || false,
    canViewAnalytics: user?.permissions?.includes(PERMISSIONS.VIEW_ANALYTICS) || false,
    canManageTeam: user?.permissions?.includes(PERMISSIONS.MANAGE_TEAM) || false,
    canManageOrganization: user?.permissions?.includes(PERMISSIONS.MANAGE_ORGANIZATION) || false,
  };
};
