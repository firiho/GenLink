/**
 * Routing utilities for deep linking in dashboard applications
 * Handles URL-to-state mapping and state-to-URL mapping
 */

export type DashboardTab = 'overview' | 'challenges' | 'challenge' | 'projects' | 'create-project' | 'project' | 'edit-project' | 'events' | 'create-event' | 'event' | 'edit-event' | 'teams' | 'teams-discover' | 'teams-invitations' | 'team-manage' | 'profile' | 'settings';
export type PartnerTab = 'overview' | 'challenges' | 'submissions' | 'events' | 'create-event' | 'event' | 'edit-event' | 'settings' | 'create-challenge' | 'preview-challenge';
export type AdminTab = 'overview' | 'partners' | 'communities' | 'support' | 'analytics' | 'settings';

/**
 * Parse URL pathname to determine which tab should be active for regular dashboard
 */
export const getDashboardTabFromPath = (pathname: string): DashboardTab => {
  // Check for challenge detail route first (before general challenges route)
  if (pathname.match(/\/challenges\/[^/]+$/)) return 'challenge';
  if (pathname.includes('/projects/create')) return 'create-project';
  if (pathname.match(/\/projects\/[^/]+\/edit$/)) return 'edit-project';
  if (pathname.match(/\/projects\/[^/]+$/)) return 'project';
  if (pathname.includes('/projects')) return 'projects';
  if (pathname.includes('/events/create')) return 'create-event';
  if (pathname.match(/\/events\/[^/]+\/edit$/)) return 'edit-event';
  if (pathname.match(/\/events\/[^/]+$/)) return 'event';
  if (pathname.includes('/events')) return 'events';
  if (pathname.includes('/challenges')) return 'challenges';
  if (pathname.includes('/teams/discover')) return 'teams-discover';
  if (pathname.includes('/teams/invitations')) return 'teams-invitations';
  // Match /dashboard/teams/:id pattern (team management) - check for specific ID pattern
  if (pathname.match(/\/teams\/[^/]+$/) && !pathname.includes('/teams/discover') && !pathname.includes('/teams/invitations')) {
    return 'team-manage';
  }
  if (pathname.includes('/teams')) return 'teams';
  if (pathname.includes('/profile')) return 'profile';
  if (pathname.includes('/settings')) return 'settings';
  return 'overview'; // default
};

/**
 * Parse URL pathname to determine which tab should be active for partner dashboard
 */
export const getPartnerTabFromPath = (pathname: string): PartnerTab => {
  if (pathname.includes('/challenges')) return 'challenges';
  if (pathname.includes('/submissions')) return 'submissions';
  if (pathname.includes('/settings')) return 'settings';
  if (pathname.includes('/create-challenge')) return 'create-challenge';
  if (pathname.includes('/preview-challenge')) return 'preview-challenge';
  if (pathname.includes('/events/create')) return 'create-event';
  if (pathname.match(/\/events\/[^/]+\/edit$/)) return 'edit-event';
  if (pathname.match(/\/events\/[^/]+$/)) return 'event';
  if (pathname.includes('/events')) return 'events';
  return 'overview'; // default
};

/**
 * Parse URL pathname to determine which tab should be active for admin dashboard
 */
export const getAdminTabFromPath = (pathname: string): AdminTab => {
  if (pathname.includes('/partners')) return 'partners';
  if (pathname.includes('/communities')) return 'communities';
  if (pathname.includes('/support')) return 'support';
  if (pathname.includes('/analytics')) return 'analytics';
  if (pathname.includes('/settings')) return 'settings';
  return 'overview'; // default
};

/**
 * Map dashboard tab IDs to their routes
 */
export const getDashboardRouteFromTab = (tab: DashboardTab): string => {
  const routes: Record<DashboardTab, string> = {
    overview: '/dashboard',
    challenges: '/dashboard/challenges',
    challenge: '/dashboard/challenges', // This will be overridden with actual challenge ID
    projects: '/dashboard/projects',
    'create-project': '/dashboard/projects/create',
    project: '/dashboard/projects', // This will be overridden with actual project ID
    'edit-project': '/dashboard/projects', // This will be overridden with actual project ID
    events: '/dashboard/events',
    'create-event': '/dashboard/events/create',
    event: '/dashboard/events', // This will be overridden with actual event ID
    'edit-event': '/dashboard/events', // This will be overridden with actual event ID
    teams: '/dashboard/teams',
    'teams-discover': '/dashboard/teams/discover',
    'teams-invitations': '/dashboard/teams/invitations',
    'team-manage': '/dashboard/teams', // This will be overridden with actual team ID
    profile: '/dashboard/profile',
    settings: '/dashboard/settings',
  };
  return routes[tab] || '/dashboard';
};

/**
 * Map partner tab IDs to their routes
 */
export const getPartnerRouteFromTab = (tab: PartnerTab): string => {
  const routes: Record<PartnerTab, string> = {
    overview: '/partner/dashboard',
    challenges: '/partner/dashboard/challenges',
    submissions: '/partner/dashboard/submissions',
    events: '/partner/dashboard/events',
    'create-event': '/partner/dashboard/events/create',
    event: '/partner/dashboard/events', // This will be overridden with actual event ID
    'edit-event': '/partner/dashboard/events', // This will be overridden with actual event ID
    settings: '/partner/dashboard/settings',
    'create-challenge': '/partner/dashboard/create-challenge',
    'preview-challenge': '/partner/dashboard/preview-challenge',
  };
  return routes[tab] || '/partner/dashboard';
};

/**
 * Map admin tab IDs to their routes
 */
export const getAdminRouteFromTab = (tab: AdminTab): string => {
  const routes: Record<AdminTab, string> = {
    overview: '/admin/dashboard',
    partners: '/admin/dashboard/partners',
    communities: '/admin/dashboard/communities',
    support: '/admin/dashboard/support',
    analytics: '/admin/dashboard/analytics',
    settings: '/admin/dashboard/settings',
  };
  return routes[tab] || '/admin/dashboard';
};

/**
 * Get sub-route from URL (for nested navigation)
 */
export const getSubRouteFromPath = (pathname: string): string | null => {
  if (pathname.includes('/settings/profile')) return 'profile';
  if (pathname.includes('/settings/security')) return 'security';
  if (pathname.includes('/settings/billing')) return 'billing';
  return null;
};

/**
 * Check if a path matches a specific tab
 */
export const isActiveTab = (pathname: string, tab: string, basePath: string): boolean => {
  if (tab === 'overview') {
    return pathname === basePath || pathname === `${basePath}/`;
  }
  return pathname.includes(`/${tab}`);
};
