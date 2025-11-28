export const PERMISSIONS = {
  MANAGE_CHALLENGES: 'manage_challenges',
  MANAGE_EVENTS: 'manage_events',
  MANAGE_SUBMISSIONS: 'manage_submissions',
  VIEW_ANALYTICS: 'view_analytics',
  MANAGE_TEAM: 'manage_team',
  MANAGE_ORGANIZATION: 'manage_organization',
} as const;

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];

export const ALL_PERMISSIONS = Object.values(PERMISSIONS);

export const PERMISSION_LABELS: Record<Permission, string> = {
  [PERMISSIONS.MANAGE_CHALLENGES]: 'Manage Challenges',
  [PERMISSIONS.MANAGE_EVENTS]: 'Manage Events',
  [PERMISSIONS.MANAGE_SUBMISSIONS]: 'Manage Submissions',
  [PERMISSIONS.VIEW_ANALYTICS]: 'View Analytics',
  [PERMISSIONS.MANAGE_TEAM]: 'Manage Team',
  [PERMISSIONS.MANAGE_ORGANIZATION]: 'Manage Organization',
};
