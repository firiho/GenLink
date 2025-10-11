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
import { db } from '@/lib/firebase';
import { Team, TeamMember, TeamInvitation, TeamApplication, TeamChallenge, CreateTeamData } from '@/types/team';

export class TeamService {
  // Create a new team (participants only)
  static async createTeam(teamData: CreateTeamData & { createdBy: string }): Promise<string> {
    const joinableCode = teamData.joinableEnabled && teamData.visibility === 'public' 
      ? this.generateLinkCode() 
      : null;
    
    const teamRef = await addDoc(collection(db, 'teams'), {
      name: teamData.name,
      description: teamData.description,
      challengeId: teamData.challengeId,
      challengeTitle: teamData.challengeTitle,
      maxMembers: teamData.maxMembers,
      currentMembers: 0,
      status: 'active',
      visibility: teamData.visibility,
      joinableEnabled: teamData.joinableEnabled && teamData.visibility === 'public',
      joinableLink: joinableCode ? `${window.location.origin}/teams/join/${joinableCode}` : null,
      joinableCode: joinableCode,
      autoApprove: teamData.autoApprove,
      createdBy: teamData.createdBy,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastActivity: new Date(),
      hasSubmitted: false,
      tags: teamData.tags || [],
      admins: [teamData.createdBy],
      permissions: teamData.permissions
    });
    
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
  
  // Generate joinable link for team
  static async generateJoinableLink(teamId: string, createdBy: string): Promise<string> {
    const linkCode = this.generateLinkCode();
    
    // Update team with joinable link
    const teamRef = doc(db, 'teams', teamId);
    await updateDoc(teamRef, {
      joinableLink: `${window.location.origin}/teams/join/${linkCode}`,
      joinableCode: linkCode,
      updatedAt: new Date()
    });
    
    return linkCode;
  }
  
  // Generate unique 8-character link code
  private static generateLinkCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
  
  // Join team by link code
  static async joinTeamByLink(linkCode: string, userId: string): Promise<{ success: boolean; message: string }> {
    try {
      // Find the team with this joinable code
      const teamQuery = query(
        collection(db, 'teams'),
        where('joinableCode', '==', linkCode),
        where('joinableEnabled', '==', true)
      );
      
      const teamSnap = await getDocs(teamQuery);
      if (teamSnap.empty) {
        return { success: false, message: 'Invalid or expired link' };
      }
      
      const teamDoc = teamSnap.docs[0];
      const teamId = teamDoc.id;
      const team = teamDoc.data() as Team;
      
      // Check if user is already a member
      const existingMember = await this.getTeamMember(teamId, userId);
      if (existingMember) {
        return { success: false, message: 'You are already a member of this team' };
      }
      
      // Check team capacity
      if (team.currentMembers >= team.maxMembers) {
        return { success: false, message: 'Team is full' };
      }
      
      // Add member
      if (team.autoApprove) {
        await this.addTeamMember(teamId, userId, 'member');
        return { success: true, message: 'Successfully joined the team!' };
      } else {
        // Create application for review
        await this.createTeamApplication(teamId, userId, 'Joined via link');
        return { success: true, message: 'Application submitted for review' };
      }
    } catch (error) {
      console.error('Error joining team by link:', error);
      return { success: false, message: 'An error occurred while joining the team' };
    }
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
  static async getTeamMembersWithProfiles(teamId: string): Promise<Array<TeamMember & { name: string; email: string; photo: string }>> {
    try {
      const members = await this.getTeamMembers(teamId);
      const membersWithProfiles = await Promise.all(
        members.map(async (member) => {
          try {
            const profileDoc = await getDoc(doc(db, 'public_profiles', member.userId));
            if (profileDoc.exists()) {
              const profileData = profileDoc.data();
              return {
                ...member,
                name: profileData.name || profileData.displayName || 'Unknown User',
                email: profileData.email || '',
                photo: profileData.photo || '/placeholder-user.svg'
              };
            }
          } catch (error) {
            console.warn(`Could not fetch profile for ${member.userId}`);
          }
          
          return {
            ...member,
            name: 'Unknown User',
            email: '',
            photo: '/placeholder-user.svg'
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
        collection(db, 'profiles', userId, 'teams'),
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
            await deleteDoc(doc(db, 'profiles', userId, 'teams', teamId));
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
        collection(db, 'profiles', userId, 'invitations'),
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
          const profileDoc = await getDoc(doc(db, 'public_profiles', invData.invitedBy));
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
        await setDoc(doc(db, 'profiles', userId, 'teams', teamId), {
          teamId,
          role,
          joinedAt: new Date(),
          status: 'active'
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
  static async removeTeamMember(teamId: string, userId: string): Promise<void> {
    await deleteDoc(doc(db, 'teams', teamId, 'members', userId));
    
    // Remove team reference from user's profile
    await deleteDoc(doc(db, 'profiles', userId, 'teams', teamId));
    
    // Update team member count
    const teamRef = doc(db, 'teams', teamId);
    await updateDoc(teamRef, {
      currentMembers: increment(-1),
      lastActivity: new Date()
    });
  }
  
  // Create team application
  static async createTeamApplication(teamId: string, applicantId: string, message: string): Promise<string> {
    const applicationRef = await addDoc(collection(db, 'teams', teamId, 'applications'), {
      applicantId,
      status: 'pending',
      message,
      skills: [],
      createdAt: new Date()
    });
    
    // Add application reference to user's profile
    await setDoc(doc(db, 'profiles', applicantId, 'applications', applicationRef.id), {
      teamId,
      status: 'pending',
      message,
      createdAt: new Date()
    });
    
    return applicationRef.id;
  }
  
  // Invite user from public profile
  static async inviteFromPublicProfile(teamId: string, invitedUserId: string, invitedBy: string, message?: string): Promise<string> {
    try {
      const invitationRef = await addDoc(collection(db, 'teams', teamId, 'invitations'), {
        invitedUserId,
        invitedBy,
        status: 'pending',
        message,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        invitationType: 'public_profile'
      });
      
      // Add invitation reference to user's profile with merge to prevent overwriting
      await setDoc(doc(db, 'profiles', invitedUserId, 'invitations', invitationRef.id), {
        teamId,
        invitedBy,
        status: 'pending',
        message,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        invitationType: 'public_profile'
      }, { merge: true });
      
      return invitationRef.id;
    } catch (error) {
      console.error('Error creating invitation:', error);
      throw error;
    }
  }
  
  // Respond to invitation
  static async respondToInvitation(invitationId: string, status: 'accepted' | 'declined', responseMessage?: string): Promise<void> {
    try {
      // Find the invitation across all teams
      const teamsQuery = query(collection(db, 'teams'));
      const teamsSnap = await getDocs(teamsQuery);
      
      for (const teamDoc of teamsSnap.docs) {
        const invitationRef = doc(db, 'teams', teamDoc.id, 'invitations', invitationId);
        const invitationDoc = await getDoc(invitationRef);
        
        if (invitationDoc.exists()) {
          const invitationData = invitationDoc.data();
          
          // Build update object, only include responseMessage if it's provided
          const updateData: any = {
            status,
            updatedAt: new Date()
          };
          
          if (responseMessage !== undefined && responseMessage.trim() !== '') {
            updateData.responseMessage = responseMessage;
          }
          
          // Update invitation in team's collection
          await updateDoc(invitationRef, updateData);
          
          // Update the invitation in user's profile
          const userInvitationRef = doc(db, 'profiles', invitationData.invitedUserId, 'invitations', invitationId);
          await updateDoc(userInvitationRef, updateData);
          
          // If accepted, add user as team member
          if (status === 'accepted') {
            console.log(`Adding user ${invitationData.invitedUserId} to team ${teamDoc.id}`);
            await this.addTeamMember(teamDoc.id, invitationData.invitedUserId, 'member');
          }
          break;
        }
      }
    } catch (error) {
      console.error('Error responding to invitation:', error);
      throw error;
    }
  }
  
  // Join challenge as team
  static async joinChallengeAsTeam(teamId: string, challengeId: string): Promise<void> {
    await setDoc(doc(db, 'teams', teamId, 'challenges', challengeId), {
      challengeId,
      status: 'active',
      joinedAt: new Date(),
      progress: 0,
      members: []
    });
    
    // Update team active challenges count
    const teamRef = doc(db, 'teams', teamId);
    await updateDoc(teamRef, {
      activeChallenges: increment(1),
      lastActivity: new Date()
    });
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
