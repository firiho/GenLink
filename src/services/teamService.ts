import { 
  collection, 
  doc, 
  addDoc, 
  setDoc,
  updateDoc, 
  deleteDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  increment,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import { db, functions } from '@/lib/firebase';
import { httpsCallable } from 'firebase/functions';
import { Team, TeamMember, TeamInvitation, TeamApplication, TeamChallenge, CreateTeamData } from '@/types/team';

// Backend function reference
const teamFunction = httpsCallable(functions, 'team');

export class TeamService {
  // Create a new team (participants only)
  static async createTeam(teamData: CreateTeamData & { createdBy: string }): Promise<string> {
    const teamRef = await addDoc(collection(db, 'teams'), {
      name: teamData.name,
      description: teamData.description,
      challengeId: teamData.challengeId,
      challengeTitle: teamData.challengeTitle,
      maxMembers: teamData.maxMembers,
      currentMembers: 0,
      status: 'active',
      visibility: teamData.visibility,
      createdBy: teamData.createdBy,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastActivity: new Date(),
      hasSubmitted: false,
      tags: teamData.tags || [],
      admins: [teamData.createdBy]
      // Permissions are now implicit - no longer stored
    } as any);
    
    // Add creator as owner
    await this.addTeamMember(teamRef.id, teamData.createdBy, 'owner');
    
    // Add initial members if provided
    if (teamData.initialMembers && teamData.initialMembers.length > 0) {
      for (const memberId of teamData.initialMembers) {
        if (memberId !== teamData.createdBy) {
          await this.inviteFromPublicProfile(teamRef.id, memberId, teamData.createdBy, 'You have been invited to join the team');
        }
      }
    }
    
    return teamRef.id;
  }
  
  
  // Get team by ID
  static async getTeam(teamId: string): Promise<Team | null> {
    const teamDoc = await getDoc(doc(db, 'teams', teamId));
    return teamDoc.exists() ? { id: teamDoc.id, ...teamDoc.data() } as Team : null;
  }
  
  // Get team member
  static async getTeamMember(teamId: string, userId: string): Promise<TeamMember | null> {
    const memberDoc = await getDoc(doc(db, 'teams', teamId, 'members', userId));
    return memberDoc.exists() ? { id: memberDoc.id, ...memberDoc.data() } as TeamMember : null;
  }
  
  // Get all team members
  static async getTeamMembers(teamId: string): Promise<TeamMember[]> {
    try {
      const membersQuery = query(collection(db, 'teams', teamId, 'members'));
      const membersSnap = await getDocs(membersQuery);
      
      return membersSnap.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          userId: data.userId,
          role: data.role,
          joinedAt: data.joinedAt?.toDate ? data.joinedAt.toDate() : new Date(data.joinedAt),
          status: data.status,
          skills: data.skills || [],
          contribution: data.contribution || 0,
          lastActive: data.lastActive?.toDate ? data.lastActive.toDate() : new Date(data.lastActive)
        } as TeamMember;
      });
    } catch (error) {
      console.error('Error fetching team members:', error);
      return [];
    }
  }
  
  // Get team members with profile data
  static async getTeamMembersWithProfiles(teamId: string): Promise<Array<TeamMember & { name: string; email: string; photo: string; username?: string }>> {
    try {
      const members = await this.getTeamMembers(teamId);
      const membersWithProfiles = await Promise.all(
        members.map(async (member) => {
          try {
            // Try profiles collection first
            let profileDoc = await getDoc(doc(db, 'profiles', member.userId));
            let profileData = profileDoc.exists() ? profileDoc.data() : null;
            
            // If not found in profiles, try users collection
            if (!profileData) {
              profileDoc = await getDoc(doc(db, 'users', member.userId));
              profileData = profileDoc.exists() ? profileDoc.data() : null;
            }
            
            if (profileData) {
              return {
                ...member,
                name: profileData.name || 
                      profileData.displayName || 
                      `${profileData.firstName || ''} ${profileData.lastName || ''}`.trim() || 
                      'Unknown User',
                email: profileData.email || '',
                photo: profileData.photo || profileData.avatar || '/placeholder-user.svg',
                username: profileData.username || undefined
              };
            }
          } catch (error) {
            console.warn(`Could not fetch profile for ${member.userId}`, error);
          }
          
          return {
            ...member,
            name: 'Unknown User',
            email: '',
            photo: '/placeholder-user.svg',
            username: undefined
          };
        })
      );
      
      return membersWithProfiles;
    } catch (error) {
      console.error('Error fetching team members with profiles:', error);
      return [];
    }
  }
  
  // Get user's teams
  static async getUserTeams(userId: string): Promise<Team[]> {
    try {
      // Get user's team references from profile
      const userTeamsQuery = query(
        collection(db, 'users', userId, 'teams'),
        where('status', '==', 'active'),
        orderBy('joinedAt', 'desc')
      );
      
      const userTeamsSnap = await getDocs(userTeamsQuery);
      const teamIds = userTeamsSnap.docs.map(doc => doc.id);
      
      if (teamIds.length === 0) return [];
      
      // Fetch team details for each team ID with individual error handling
      const teams: Team[] = [];
      for (const teamId of teamIds) {
        try {
          const teamDoc = await getDoc(doc(db, 'teams', teamId));
          if (teamDoc.exists() && teamDoc.data().status === 'active') {
            const data = teamDoc.data();
            
            // Convert Firestore timestamps to Date objects
            const createdAt = data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt);
            const updatedAt = data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt);
            const lastActivity = data.lastActivity?.toDate ? data.lastActivity.toDate() : new Date(data.lastActivity);
            const submittedAt = data.submittedAt?.toDate ? data.submittedAt.toDate() : (data.submittedAt ? new Date(data.submittedAt) : undefined);
            
            teams.push({ 
              id: teamDoc.id, 
              ...data,
              createdAt,
              updatedAt,
              lastActivity,
              submittedAt
            } as Team);
          }
        } catch (error) {
          // Skip teams that fail permission check or don't exist
          console.warn(`Unable to fetch team ${teamId}:`, error);
          // Optionally clean up invalid team reference from user profile
          try {
            await deleteDoc(doc(db, 'users', userId, 'teams', teamId));
          } catch (cleanupError) {
            console.warn(`Could not clean up invalid team reference ${teamId}`);
          }
        }
      }
      
      return teams;
    } catch (error) {
      console.error('Error fetching user teams:', error);
      return [];
    }
  }
  
  // Get user's invitations
  static async getUserInvitations(userId: string): Promise<TeamInvitation[]> {
    try {
      // Get invitations from user's profile
      const invitationsQuery = query(
        collection(db, 'users', userId, 'invitations'),
        where('status', '==', 'pending'),
        orderBy('createdAt', 'desc')
      );
      
      const invitationsSnap = await getDocs(invitationsQuery);
      const invitations: TeamInvitation[] = [];
      
      for (const invDoc of invitationsSnap.docs) {
        const invData = invDoc.data();
        
        // Convert Firestore timestamps to Date objects
        const createdAt = invData.createdAt?.toDate ? invData.createdAt.toDate() : new Date(invData.createdAt);
        const expiresAt = invData.expiresAt?.toDate ? invData.expiresAt.toDate() : new Date(invData.expiresAt);
        
        // Fetch team name
        let teamName = 'Unknown Team';
        try {
          const teamDoc = await getDoc(doc(db, 'teams', invData.teamId));
          if (teamDoc.exists()) {
            teamName = teamDoc.data().name;
          }
        } catch (error) {
          console.warn(`Could not fetch team name for ${invData.teamId}`);
        }
        
        // Fetch inviter name
        let invitedByName = 'Unknown User';
        try {
          const profileDoc = await getDoc(doc(db, 'profiles', invData.invitedBy));
          if (profileDoc.exists()) {
            invitedByName = profileDoc.data().name || profileDoc.data().displayName || 'Unknown User';
          }
        } catch (error) {
          console.warn(`Could not fetch profile for ${invData.invitedBy}`);
        }
        
        invitations.push({
          id: invDoc.id,
          ...invData,
          createdAt,
          expiresAt,
          teamName,
          invitedByName
        } as TeamInvitation);
      }
      
      return invitations;
    } catch (error) {
      console.error('Error fetching user invitations:', error);
      return [];
    }
  }
  
  // Discover teams (public only)
  static async discoverTeams(filters: {
    challengeId?: string;
    maxMembers?: number;
  }): Promise<Team[]> {
    let teamsQuery = query(
      collection(db, 'teams'),
      where('status', '==', 'active'),
      where('visibility', '==', 'public'),
      orderBy('lastActivity', 'desc'),
      limit(20)
    );
    
    const teamsSnap = await getDocs(teamsQuery);
    let teams = teamsSnap.docs.map(doc => {
      const data = doc.data();
      // Convert Firestore timestamps
      const createdAt = data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt);
      const updatedAt = data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt);
      const lastActivity = data.lastActivity?.toDate ? data.lastActivity.toDate() : new Date(data.lastActivity);
      const submittedAt = data.submittedAt?.toDate ? data.submittedAt.toDate() : (data.submittedAt ? new Date(data.submittedAt) : undefined);
      
      return { 
        id: doc.id, 
        ...data,
        createdAt,
        updatedAt,
        lastActivity,
        submittedAt
      } as Team;
    });
    
    // Apply filters
    if (filters.challengeId) {
      teams = teams.filter(team => team.challengeId === filters.challengeId);
    }
    
    if (filters.maxMembers) {
      teams = teams.filter(team => team.maxMembers <= filters.maxMembers);
    }
    
    return teams;
  }
  
  // Get teams for a specific challenge
  static async getTeamsForChallenge(challengeId: string): Promise<Team[]> {
    const teamsQuery = query(
      collection(db, 'teams'),
      where('challengeId', '==', challengeId),
      where('status', '==', 'active'),
      orderBy('createdAt', 'desc')
    );
    
    const teamsSnap = await getDocs(teamsQuery);
    return teamsSnap.docs.map(doc => {
      const data = doc.data();
      // Convert Firestore timestamps
      const createdAt = data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt);
      const updatedAt = data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt);
      const lastActivity = data.lastActivity?.toDate ? data.lastActivity.toDate() : new Date(data.lastActivity);
      const submittedAt = data.submittedAt?.toDate ? data.submittedAt.toDate() : (data.submittedAt ? new Date(data.submittedAt) : undefined);
      
      return { 
        id: doc.id, 
        ...data,
        createdAt,
        updatedAt,
        lastActivity,
        submittedAt
      } as Team;
    });
  }
  
  // Add team member
  static async addTeamMember(teamId: string, userId: string, role: 'owner' | 'admin' | 'member'): Promise<void> {
    try {
      // Get team details
      const teamDoc = await getDoc(doc(db, 'teams', teamId));
      if (!teamDoc.exists()) {
        throw new Error('Team not found');
      }
      
      const teamData = teamDoc.data();
      
      // Check if team is at capacity (unless adding owner during creation)
      if (role !== 'owner' && teamData.currentMembers >= teamData.maxMembers) {
        throw new Error('Team is at maximum capacity');
      }
      
      // Check if member already exists to prevent duplicates
      const memberDoc = await getDoc(doc(db, 'teams', teamId, 'members', userId));
      
      if (!memberDoc.exists()) {
        // Add member to team
        await setDoc(doc(db, 'teams', teamId, 'members', userId), {
          userId,
          role,
          joinedAt: new Date(),
          status: 'active',
          skills: [],
          contribution: 0,
          lastActive: new Date()
        });
        
        // Add team reference to user's profile
        await setDoc(doc(db, 'users', userId, 'teams', teamId), {
          teamId,
          role,
          joinedAt: new Date(),
          status: 'active'
        }, { merge: true });

        // Update user's stats in stats collection - stats/{userId}
        await setDoc(doc(db, 'stats', userId), {
          'activeTeams.activeTeamIds': arrayUnion(teamId)
        }, { merge: true });
        
        // Update team member count and add to admins if owner/admin role
        const teamRef = doc(db, 'teams', teamId);
        const updateData: any = {
          currentMembers: increment(1),
          lastActivity: new Date()
        };
        
        if (role === 'owner' || role === 'admin') {
          updateData.admins = arrayUnion(userId);
        }
        
        await updateDoc(teamRef, updateData);
        
        console.log(`Successfully added user ${userId} to team ${teamId} as ${role}`);
      } else {
        console.log(`User ${userId} is already a member of team ${teamId}`);
      }
    } catch (error) {
      console.error('Error adding team member:', error);
      throw error;
    }
  }
  
  // Remove team member
  // Remove team member - now using backend
  static async removeTeamMember(teamId: string, userId: string): Promise<void> {
    try {
      const result = await teamFunction({
        action: 'removeMember',
        teamId,
        memberUserId: userId
      });
      
      const data = result.data as any;
      if (!data.success) {
        throw new Error(data.message || 'Failed to remove team member');
      }
    } catch (error: any) {
      console.error('Error removing team member:', error);
      throw new Error(error.message || 'Failed to remove team member');
    }
  }

  // Leave team - now using backend (user leaving themselves)
  static async leaveTeam(teamId: string, userId: string): Promise<void> {
    try {
      const result = await teamFunction({
        action: 'leaveTeam',
        teamId
      });
      
      const data = result.data as any;
      if (!data.success) {
        throw new Error(data.message || 'Failed to leave team');
      }
    } catch (error: any) {
      console.error('Error leaving team:', error);
      throw new Error(error.message || 'Failed to leave team');
    }
  }
  
  // Create team application - now using backend (applicantId comes from authenticated user)
  static async createTeamApplication(teamId: string, applicantId: string, message: string): Promise<string> {
    try {
      // Note: applicantId parameter kept for compatibility but backend uses authenticated user
      const result = await teamFunction({
        action: 'requestToJoin',
        teamId,
        message
      });
      
      const data = result.data as any;
      if (data.success) {
        return data.applicationId;
      } else {
        throw new Error(data.message || 'Failed to create application');
      }
    } catch (error: any) {
      console.error('Error creating application:', error);
      throw new Error(error.message || 'Failed to create application');
    }
  }

  // Get team applications
  static async getTeamApplications(teamId: string, status?: 'pending' | 'accepted' | 'declined'): Promise<Array<TeamApplication & { applicantName?: string; applicantEmail?: string; applicantPhoto?: string }>> {
    try {
      let applicationsQuery;
      if (status) {
        // For filtered queries with orderBy, we need to use a composite index
        // If the index doesn't exist, fall back to client-side sorting
        try {
          applicationsQuery = query(
            collection(db, 'teams', teamId, 'applications'),
            where('status', '==', status),
            orderBy('createdAt', 'desc')
          );
        } catch (error: any) {
          // If composite index error, fall back to client-side sorting
          if (error?.code === 'failed-precondition') {
            applicationsQuery = query(
              collection(db, 'teams', teamId, 'applications'),
              where('status', '==', status)
            );
          } else {
            throw error;
          }
        }
      } else {
        applicationsQuery = query(
          collection(db, 'teams', teamId, 'applications'),
          orderBy('createdAt', 'desc')
        );
      }
      
      const applicationsSnap = await getDocs(applicationsQuery);
      let applicationsData = applicationsSnap.docs.map(docSnapshot => {
        const data = docSnapshot.data() as any;
        return {
          id: docSnapshot.id,
          applicantId: data.applicantId,
          status: data.status,
          message: data.message,
          skills: data.skills || [],
          createdAt: data.createdAt,
          reviewedAt: data.reviewedAt,
          reviewedBy: data.reviewedBy
        };
      });
      
      // If we couldn't use orderBy in the query (due to missing index), sort client-side
      if (status) {
        applicationsData = applicationsData.sort((a, b) => {
          const aDate = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : new Date(a.createdAt || 0).getTime();
          const bDate = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : new Date(b.createdAt || 0).getTime();
          return bDate - aDate; // Descending order
        });
      }
      
      const applications = await Promise.all(
        applicationsData.map(async (appData: any) => {
          // Fetch applicant profile
          let applicantName = 'Unknown User';
          let applicantEmail = '';
          let applicantPhoto = '/placeholder-user.svg';
          
          try {
            // Try profiles collection first
            let profileDoc = await getDoc(doc(db, 'profiles', appData.applicantId));
            let profileData = profileDoc.exists() ? profileDoc.data() : null;
            
            // If not found in profiles, try users collection
            if (!profileData) {
              profileDoc = await getDoc(doc(db, 'users', appData.applicantId));
              profileData = profileDoc.exists() ? profileDoc.data() : null;
            }
            
            if (profileData) {
              applicantName = profileData.name || 
                             profileData.displayName || 
                             `${profileData.firstName || ''} ${profileData.lastName || ''}`.trim() || 
                             profileData.username || 
                             'Unknown User';
              applicantEmail = profileData.email || '';
              applicantPhoto = profileData.photo || profileData.avatar || '/placeholder-user.svg';
            }
          } catch (error) {
            console.warn(`Could not fetch profile for ${appData.applicantId}`, error);
          }
          
          return {
            id: appData.id,
            applicantId: appData.applicantId,
            status: appData.status,
            message: appData.message,
            skills: appData.skills || [],
            createdAt: appData.createdAt?.toDate ? appData.createdAt.toDate() : new Date(appData.createdAt),
            reviewedAt: appData.reviewedAt?.toDate ? appData.reviewedAt.toDate() : (appData.reviewedAt ? new Date(appData.reviewedAt) : undefined),
            reviewedBy: appData.reviewedBy,
            applicantName,
            applicantEmail,
            applicantPhoto
          };
        })
      );
      
      return applications;
    } catch (error) {
      console.error('Error fetching team applications:', error);
      return [];
    }
  }

  // Approve team application - now using backend
  static async approveTeamApplication(teamId: string, applicationId: string, reviewedBy: string): Promise<void> {
    try {
      const result = await teamFunction({
        action: 'approveApplication',
        teamId,
        applicationId
      });
      
      const data = result.data as any;
      if (!data.success) {
        throw new Error(data.message || 'Failed to approve application');
      }
    } catch (error: any) {
      console.error('Error approving application:', error);
      throw new Error(error.message || 'Failed to approve application');
    }
  }

  // Decline team application
  static async declineTeamApplication(teamId: string, applicationId: string, reviewedBy: string): Promise<void> {
    const applicationRef = doc(db, 'teams', teamId, 'applications', applicationId);
    const applicationDoc = await getDoc(applicationRef);
    
    if (!applicationDoc.exists()) {
      throw new Error('Application not found');
    }
    
    const applicationData = applicationDoc.data();
    
    if (applicationData.status !== 'pending') {
      throw new Error('Application has already been reviewed');
    }
    
    // Update application status in team's applications subcollection
    await updateDoc(applicationRef, {
      status: 'declined',
      reviewedAt: new Date(),
      reviewedBy
    });
    
    // Try to update application in user's profile (may not have permission, that's okay)
    try {
      const userApplicationRef = doc(db, 'users', applicationData.applicantId, 'applications', applicationId);
      await updateDoc(userApplicationRef, {
        status: 'declined',
        reviewedAt: new Date(),
        reviewedBy
      });
    } catch (error) {
      // If we can't update the user's copy, that's okay - the team copy is the source of truth
      console.warn('Could not update user application copy:', error);
    }
  }
  
  // Invite user from public profile - now using backend
  static async inviteFromPublicProfile(teamId: string, invitedUserId: string, invitedBy: string, message?: string): Promise<string> {
    try {
      const result = await teamFunction({
        action: 'invite',
        teamId,
        invitedUserId,
        message: message || ''
      });
      
      const data = result.data as any;
      if (data.success) {
        return data.invitationId;
      } else {
        throw new Error(data.message || 'Failed to create invitation');
      }
    } catch (error: any) {
      console.error('Error creating invitation:', error);
      throw new Error(error.message || 'Failed to create invitation');
    }
  }
  
  // Respond to invitation - now using backend
  static async respondToInvitation(invitationId: string, status: 'accepted' | 'declined', responseMessage?: string): Promise<void> {
    try {
      const action = status === 'accepted' ? 'acceptInvite' : 'declineInvite';
      const result = await teamFunction({
        action,
        invitationId,
        responseMessage: responseMessage || ''
      });
      
      const data = result.data as any;
      if (!data.success) {
        throw new Error(data.message || 'Failed to respond to invitation');
      }
    } catch (error: any) {
      console.error('Error responding to invitation:', error);
      throw new Error(error.message || 'Failed to respond to invitation');
    }
  }
  
  // Join challenge as team
  static async joinChallengeAsTeam(teamId: string, challengeId: string): Promise<void> {
    // Get team members to update their stats
    const teamRef = doc(db, 'teams', teamId);
    const teamSnap = await getDoc(teamRef);
    const teamData = teamSnap.data();
    const memberIds = teamData?.memberIds || [];
    
    // Get challenge to find organization
    const challengeRef = doc(db, 'challenges', challengeId);
    const challengeSnap = await getDoc(challengeRef);
    const challengeData = challengeSnap.data();
    const organizationId = challengeData?.organizationId;
    
    await setDoc(doc(db, 'teams', teamId, 'challenges', challengeId), {
      challengeId,
      status: 'active',
      joinedAt: new Date(),
      progress: 0,
      members: []
    });
    
    // Update team last activity
    await updateDoc(teamRef, {
      lastActivity: new Date()
    });
    
    // Update each team member's stats in stats collection - stats/{userId}
    for (const memberId of memberIds) {
      const memberStatsRef = doc(db, 'stats', memberId);
      await setDoc(memberStatsRef, {
        'activeChallenges.activeChallengeIds': arrayUnion(challengeId)
      }, { merge: true });
    }
    
    // Update organization stats in stats collection - stats/org_{orgId}
    if (organizationId && memberIds.length > 0) {
      const orgStatsRef = doc(db, 'stats', `org_${organizationId}`);
      for (const memberId of memberIds) {
        await setDoc(orgStatsRef, {
          'totalParticipants.participantIds': arrayUnion(memberId)
        }, { merge: true });
      }
    }
  }
  
  // Update team
  static async updateTeam(teamId: string, updates: Partial<Team>): Promise<void> {
    const teamRef = doc(db, 'teams', teamId);
    await updateDoc(teamRef, {
      ...updates,
      updatedAt: new Date()
    });
  }
  
  // Delete team
  static async deleteTeam(teamId: string): Promise<void> {
    // Delete team members subcollection
    const membersQuery = query(collection(db, 'teams', teamId, 'members'));
    const membersSnap = await getDocs(membersQuery);
    membersSnap.docs.forEach(doc => deleteDoc(doc.ref));
    
    // Delete team invitations subcollection
    const invitationsQuery = query(collection(db, 'teams', teamId, 'invitations'));
    const invitationsSnap = await getDocs(invitationsQuery);
    invitationsSnap.docs.forEach(doc => deleteDoc(doc.ref));
    
    // Delete team applications subcollection
    const applicationsQuery = query(collection(db, 'teams', teamId, 'applications'));
    const applicationsSnap = await getDocs(applicationsQuery);
    applicationsSnap.docs.forEach(doc => deleteDoc(doc.ref));
    
    // Delete team challenges subcollection
    const challengesQuery = query(collection(db, 'teams', teamId, 'challenges'));
    const challengesSnap = await getDocs(challengesQuery);
    challengesSnap.docs.forEach(doc => deleteDoc(doc.ref));
    
    // Delete team
    await deleteDoc(doc(db, 'teams', teamId));
  }
}

