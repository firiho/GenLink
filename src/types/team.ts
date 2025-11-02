export interface Team {
  id: string;
  name: string;
  description: string;
  avatar?: string;
  
  // Challenge-specific
  challengeId: string; // Required: team is tied to a challenge
  challengeTitle: string;
  maxMembers: number; // From challenge
  
  currentMembers: number;
  status: 'active' | 'archived' | 'closed';
  visibility: 'public' | 'invite-only'; // Only two options
  joinableLink?: string;
  joinableCode?: string;
  joinableEnabled: boolean; // Only for public teams
  autoApprove: boolean;
  
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  lastActivity: Date;
  
  // Submission tracking
  hasSubmitted: boolean;
  submissionUrl?: string;
  submittedAt?: Date;
  
  tags: string[];
  admins: string[];
  // Permissions are now implicit - no longer stored
  // Admin (in admins array): can see, edit, and submit projects
  // Team members: can see, chat, and edit projects (but NOT submit)
}

export interface TeamMember {
  id: string;
  userId: string;
  role: 'owner' | 'admin' | 'member';
  joinedAt: Date;
  status: 'active' | 'inactive' | 'pending';
  skills: string[];
  contribution: number;
  lastActive: Date;
}

export interface TeamInvitation {
  id: string;
  teamId: string;
  teamName?: string; // For display purposes
  invitedUserId: string;
  invitedBy: string;
  invitedByName?: string; // For display purposes
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  message?: string;
  createdAt: Date;
  expiresAt: Date;
  invitationType: 'direct' | 'public_profile' | 'joinable_link';
  responseMessage?: string;
}

export interface TeamApplication {
  id: string;
  applicantId: string;
  status: 'pending' | 'accepted' | 'declined';
  message: string;
  skills: string[];
  createdAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
}

export interface TeamChallenge {
  id: string;
  challengeId: string;
  status: 'active' | 'completed' | 'withdrawn';
  joinedAt: Date;
  submissionUrl?: string;
  progress: number;
  members: string[];
  teamSubmission?: {
    url: string;
    note: string;
    submittedAt: Date;
    submittedBy: string;
  };
}

export interface CreateTeamData {
  name: string;
  description: string;
  
  // Challenge info (required)
  challengeId: string;
  challengeTitle: string;
  maxMembers: number; // From challenge
  
  visibility: 'public' | 'invite-only'; // Only two options
  
  // Initial team members to invite
  initialMembers?: string[]; // Array of user IDs
  
  tags: string[];
  // Permissions are now implicit - not required during creation
}
