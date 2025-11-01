/**
 * Configuration and Constants
 */

export const config = {
  // Region configuration - South Africa
  region: "africa-south1" as const,
  
  // Firestore collections
  collections: {
    users: "users",
    profiles: "profiles",
    organizations: "organizations",
    challenges: "challenges",
    teams: "teams",
    submissions: "submissions",
  },
};

