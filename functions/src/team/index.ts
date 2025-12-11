import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import { config } from "../config/index";

const db = admin.firestore();

/**
 * Centralized team operations function
 * Handles: invite, accept invite, request to join, approve application
 */
export const team = onCall({ region: config.region }, async (request) => {
  // Verify authentication
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "User must be authenticated");
  }

  const userId = request.auth.uid;
  const requestData = request.data as {
    action: "invite" | "acceptInvite" | "declineInvite" | "requestToJoin" | "approveApplication" | "removeMember" | "leaveTeam";
    [key: string]: any;
  };

  const { action, ...params } = requestData;

  switch (action) {
    case "invite":
      return await handleInvite(userId, params as { teamId: string; invitedUserId: string; message?: string });
    case "acceptInvite":
      return await handleAcceptInvite(userId, params as { invitationId: string; responseMessage?: string });
    case "declineInvite":
      return await handleDeclineInvite(userId, params as { invitationId: string; responseMessage?: string });
    case "requestToJoin":
      return await handleRequestToJoin(userId, params as { teamId: string; message: string });
    case "approveApplication":
      return await handleApproveApplication(userId, params as { teamId: string; applicationId: string });
    case "removeMember":
      return await handleRemoveMember(userId, params as { teamId: string; memberUserId: string });
    case "leaveTeam":
      return await handleLeaveTeam(userId, params as { teamId: string });
    default:
      throw new HttpsError("invalid-argument", `Unknown action: ${action}`);
  }
});

/**
 * Invite a user to join a team
 */
async function handleInvite(
  userId: string,
  params: {
    teamId: string;
    invitedUserId: string;
    message?: string;
  }
) {
  const { teamId, invitedUserId, message } = params;

  if (!teamId || !invitedUserId) {
    throw new HttpsError("invalid-argument", "teamId and invitedUserId are required");
  }

  // Verify user is a team admin
  const teamDoc = await db.collection("teams").doc(teamId).get();
  if (!teamDoc.exists) {
    throw new HttpsError("not-found", "Team not found");
  }

  const teamData = teamDoc.data()!;
  const admins = teamData.admins || [];

  if (!admins.includes(userId)) {
    throw new HttpsError("permission-denied", "Only team admins can invite members");
  }

  // Check if team is at capacity
  if (teamData.currentMembers >= teamData.maxMembers) {
    throw new HttpsError("failed-precondition", "Team is at full capacity");
  }

  // Check if user is already a member
  const memberDoc = await db
    .collection("teams")
    .doc(teamId)
    .collection("members")
    .doc(invitedUserId)
    .get();

  if (memberDoc.exists) {
    throw new HttpsError("already-exists", "User is already a member of this team");
  }

  // Check if invitation already exists
  const existingInvites = await db
    .collection("teams")
    .doc(teamId)
    .collection("invitations")
    .where("invitedUserId", "==", invitedUserId)
    .where("status", "==", "pending")
    .get();

  if (!existingInvites.empty) {
    throw new HttpsError("already-exists", "Invitation already sent to this user");
  }

  // Create invitation
  const invitationRef = db
    .collection("teams")
    .doc(teamId)
    .collection("invitations")
    .doc();

  const invitationData = {
    invitedUserId,
    invitedBy: userId,
    status: "pending",
    message: message || "",
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    expiresAt: admin.firestore.Timestamp.fromDate(
      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    ), // 7 days
    invitationType: "public_profile",
  };

  // Create invitation in team collection
  await invitationRef.set(invitationData);

  // Add invitation to user's profile
  await db
    .collection("users")
    .doc(invitedUserId)
    .collection("invitations")
    .doc(invitationRef.id)
    .set({
      teamId,
      invitedBy: userId,
      status: "pending",
      message: message || "",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      expiresAt: admin.firestore.Timestamp.fromDate(
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      ),
      invitationType: "public_profile",
    }, { merge: true });

  return { success: true, invitationId: invitationRef.id };
}

/**
 * Accept an invitation to join a team
 */
async function handleAcceptInvite(
  userId: string,
  params: {
    invitationId: string;
    responseMessage?: string;
  }
) {
  const { invitationId, responseMessage } = params;

  if (!invitationId) {
    throw new HttpsError("invalid-argument", "invitationId is required");
  }

  // Find the invitation across all teams
  const teamsSnapshot = await db.collection("teams").get();
  
  let invitationDoc: admin.firestore.DocumentSnapshot | null = null;
  let teamId: string | null = null;

  for (const teamDoc of teamsSnapshot.docs) {
    const inviteDoc = await db
      .collection("teams")
      .doc(teamDoc.id)
      .collection("invitations")
      .doc(invitationId)
      .get();

    if (inviteDoc.exists) {
      invitationDoc = inviteDoc;
      teamId = teamDoc.id;
      break;
    }
  }

  if (!invitationDoc || !invitationDoc.exists || !teamId) {
    throw new HttpsError("not-found", "Invitation not found");
  }

  const invitationData = invitationDoc.data()!;

  // Verify the invitation is for this user
  if (invitationData.invitedUserId !== userId) {
    throw new HttpsError("permission-denied", "This invitation is not for you");
  }

  // Verify invitation is still pending
  if (invitationData.status !== "pending") {
    throw new HttpsError("failed-precondition", "Invitation has already been processed");
  }

  // Check if invitation has expired
  const expiresAt = invitationData.expiresAt?.toDate();
  if (expiresAt && expiresAt < new Date()) {
    throw new HttpsError("deadline-exceeded", "Invitation has expired");
  }

  // Get team data
  const teamDoc = await db.collection("teams").doc(teamId).get();
  if (!teamDoc.exists) {
    throw new HttpsError("not-found", "Team not found");
  }

  const teamData = teamDoc.data()!;

  // Check if team is at capacity
  if (teamData.currentMembers >= teamData.maxMembers) {
    throw new HttpsError("failed-precondition", "Team is at full capacity");
  }

  // Check if user is already a member
  const memberDoc = await db
    .collection("teams")
    .doc(teamId)
    .collection("members")
    .doc(userId)
    .get();

  if (memberDoc.exists) {
    throw new HttpsError("already-exists", "You are already a member of this team");
  }

  // Update invitation status
  const updateData: any = {
    status: "accepted",
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  if (responseMessage) {
    updateData.responseMessage = responseMessage;
  }

  await invitationDoc.ref.update(updateData);

  // Update invitation in user's profile
  await db
    .collection("users")
    .doc(userId)
    .collection("invitations")
    .doc(invitationId)
    .update(updateData);

  // Add user as team member
  await db
    .collection("teams")
    .doc(teamId)
    .collection("members")
    .doc(userId)
    .set({
      userId,
      role: "member",
      joinedAt: admin.firestore.FieldValue.serverTimestamp(),
      status: "active",
      skills: [],
      contribution: 0,
      lastActive: admin.firestore.FieldValue.serverTimestamp(),
    });

  // Add team reference to user's profile
  await db
    .collection("users")
    .doc(userId)
    .collection("teams")
    .doc(teamId)
    .set({
      teamId,
      role: "member",
      joinedAt: admin.firestore.FieldValue.serverTimestamp(),
      status: "active",
    }, { merge: true });

  // Update user's stats in stats collection - stats/{userId}
  await db
    .collection("stats")
    .doc(userId)
    .set({
      "activeTeams.activeTeamIds": admin.firestore.FieldValue.arrayUnion(teamId),
    }, { merge: true });

  // Update team member count and last activity
  await db.collection("teams").doc(teamId).update({
    currentMembers: admin.firestore.FieldValue.increment(1),
    lastActivity: admin.firestore.FieldValue.serverTimestamp(),
  });

  return { success: true, teamId };
}

/**
 * Decline an invitation
 */
async function handleDeclineInvite(
  userId: string,
  params: {
    invitationId: string;
    responseMessage?: string;
  }
) {
  const { invitationId, responseMessage } = params;

  if (!invitationId) {
    throw new HttpsError("invalid-argument", "invitationId is required");
  }

  // Find the invitation across all teams
  const teamsSnapshot = await db.collection("teams").get();
  
  let invitationDoc: admin.firestore.DocumentSnapshot | null = null;
  let teamId: string | null = null;

  for (const teamDoc of teamsSnapshot.docs) {
    const inviteDoc = await db
      .collection("teams")
      .doc(teamDoc.id)
      .collection("invitations")
      .doc(invitationId)
      .get();

    if (inviteDoc.exists) {
      invitationDoc = inviteDoc;
      teamId = teamDoc.id;
      break;
    }
  }

  if (!invitationDoc || !invitationDoc.exists || !teamId) {
    throw new HttpsError("not-found", "Invitation not found");
  }

  const invitationData = invitationDoc.data()!;

  // Verify the invitation is for this user
  if (invitationData.invitedUserId !== userId) {
    throw new HttpsError("permission-denied", "This invitation is not for you");
  }

  // Verify invitation is still pending
  if (invitationData.status !== "pending") {
    throw new HttpsError("failed-precondition", "Invitation has already been processed");
  }

  // Update invitation status
  const updateData: any = {
    status: "declined",
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  if (responseMessage) {
    updateData.responseMessage = responseMessage;
  }

  await invitationDoc.ref.update(updateData);

  // Update invitation in user's profile
  await db
    .collection("users")
    .doc(userId)
    .collection("invitations")
    .doc(invitationId)
    .update(updateData);

  return { success: true };
}

/**
 * Request to join a public team
 */
async function handleRequestToJoin(
  userId: string,
  params: {
    teamId: string;
    message: string;
  }
) {
  const { teamId, message } = params;

  if (!teamId || !message) {
    throw new HttpsError("invalid-argument", "teamId and message are required");
  }

  // Get team data
  const teamDoc = await db.collection("teams").doc(teamId).get();
  if (!teamDoc.exists) {
    throw new HttpsError("not-found", "Team not found");
  }

  const teamData = teamDoc.data()!;

  // Verify team is public
  if (teamData.visibility !== "public") {
    throw new HttpsError("permission-denied", "Team is not public");
  }

  // Check if team is at capacity
  if (teamData.currentMembers >= teamData.maxMembers) {
    throw new HttpsError("failed-precondition", "Team is at full capacity");
  }

  // Check if user is already a member
  const memberDoc = await db
    .collection("teams")
    .doc(teamId)
    .collection("members")
    .doc(userId)
    .get();

  if (memberDoc.exists) {
    throw new HttpsError("already-exists", "You are already a member of this team");
  }

  // Check if user already has a pending application
  const existingApps = await db
    .collection("teams")
    .doc(teamId)
    .collection("applications")
    .where("applicantId", "==", userId)
    .where("status", "==", "pending")
    .get();

  if (!existingApps.empty) {
    throw new HttpsError("already-exists", "You already have a pending application for this team");
  }

  // Create application
  const applicationRef = db
    .collection("teams")
    .doc(teamId)
    .collection("applications")
    .doc();

  const applicationData = {
    applicantId: userId,
    status: "pending",
    message,
    skills: [],
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  await applicationRef.set(applicationData);

  // Add application reference to user's profile
  await db
    .collection("users")
    .doc(userId)
    .collection("applications")
    .doc(applicationRef.id)
    .set({
      teamId,
      status: "pending",
      message,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

  return { success: true, applicationId: applicationRef.id };
}

/**
 * Approve a team application (admin only)
 */
async function handleApproveApplication(
  userId: string,
  params: {
    teamId: string;
    applicationId: string;
  }
) {
  const { teamId, applicationId } = params;

  if (!teamId || !applicationId) {
    throw new HttpsError("invalid-argument", "teamId and applicationId are required");
  }

  // Verify user is a team admin
  const teamDoc = await db.collection("teams").doc(teamId).get();
  if (!teamDoc.exists) {
    throw new HttpsError("not-found", "Team not found");
  }

  const teamData = teamDoc.data()!;
  const admins = teamData.admins || [];

  if (!admins.includes(userId)) {
    throw new HttpsError("permission-denied", "Only team admins can approve applications");
  }

  // Get application
  const applicationDoc = await db
    .collection("teams")
    .doc(teamId)
    .collection("applications")
    .doc(applicationId)
    .get();

  if (!applicationDoc.exists) {
    throw new HttpsError("not-found", "Application not found");
  }

  const applicationData = applicationDoc.data()!;

  // Verify application is pending
  if (applicationData.status !== "pending") {
    throw new HttpsError("failed-precondition", "Application has already been reviewed");
  }

  // Check if team is at capacity
  if (teamData.currentMembers >= teamData.maxMembers) {
    throw new HttpsError("failed-precondition", "Team is at full capacity");
  }

  // Check if user is already a member
  const memberDoc = await db
    .collection("teams")
    .doc(teamId)
    .collection("members")
    .doc(applicationData.applicantId)
    .get();

  if (memberDoc.exists) {
    throw new HttpsError("already-exists", "User is already a member of this team");
  }

  // Update application status
  await applicationDoc.ref.update({
    status: "accepted",
    reviewedAt: admin.firestore.FieldValue.serverTimestamp(),
    reviewedBy: userId,
  });

  // Try to update application in user's profile (may fail due to permissions, that's okay)
  try {
    await db
      .collection("users")
      .doc(applicationData.applicantId)
      .collection("applications")
      .doc(applicationId)
      .update({
        status: "accepted",
        reviewedAt: admin.firestore.FieldValue.serverTimestamp(),
        reviewedBy: userId,
      });
  } catch (error) {
    // User's copy update may fail, but that's okay - team copy is source of truth
    console.warn("Could not update user application copy:", error);
  }

  // Create invitation and auto-accept it
  const invitationRef = db
    .collection("teams")
    .doc(teamId)
    .collection("invitations")
    .doc();

  const invitationData = {
    invitedUserId: applicationData.applicantId,
    invitedBy: userId,
    status: "accepted",
    message: "Your application to join this team has been approved!",
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    expiresAt: admin.firestore.Timestamp.fromDate(
      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    ),
    invitationType: "application_approval",
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  await invitationRef.set(invitationData);

  // Add invitation to user's profile
  await db
    .collection("users")
    .doc(applicationData.applicantId)
    .collection("invitations")
    .doc(invitationRef.id)
    .set(invitationData, { merge: true });

  // Add user as team member
  await db
    .collection("teams")
    .doc(teamId)
    .collection("members")
    .doc(applicationData.applicantId)
    .set({
      userId: applicationData.applicantId,
      role: "member",
      joinedAt: admin.firestore.FieldValue.serverTimestamp(),
      status: "active",
      skills: [],
      contribution: 0,
      lastActive: admin.firestore.FieldValue.serverTimestamp(),
    });

  // Add team reference to user's profile
  await db
    .collection("users")
    .doc(applicationData.applicantId)
    .collection("teams")
    .doc(teamId)
    .set({
      teamId,
      role: "member",
      joinedAt: admin.firestore.FieldValue.serverTimestamp(),
      status: "active",
    }, { merge: true });

  // Update user's stats in stats collection - stats/{userId}
  await db
    .collection("stats")
    .doc(applicationData.applicantId)
    .set({
      "activeTeams.activeTeamIds": admin.firestore.FieldValue.arrayUnion(teamId),
    }, { merge: true });

  // Update team member count and last activity
  await db.collection("teams").doc(teamId).update({
    currentMembers: admin.firestore.FieldValue.increment(1),
    lastActivity: admin.firestore.FieldValue.serverTimestamp(),
  });

  return { success: true, teamId };
}

/**
 * Remove a member from a team (admin only, or user removing themselves)
 */
async function handleRemoveMember(
  userId: string,
  params: {
    teamId: string;
    memberUserId: string;
  }
) {
  const { teamId, memberUserId } = params;

  if (!teamId || !memberUserId) {
    throw new HttpsError("invalid-argument", "teamId and memberUserId are required");
  }

  // Get team data
  const teamDoc = await db.collection("teams").doc(teamId).get();
  if (!teamDoc.exists) {
    throw new HttpsError("not-found", "Team not found");
  }

  const teamData = teamDoc.data()!;
  const admins = teamData.admins || [];

  // Verify user is either an admin or removing themselves
  if (memberUserId !== userId && !admins.includes(userId)) {
    throw new HttpsError("permission-denied", "Only team admins can remove other members, or you can remove yourself");
  }

  // Get member data
  const memberDoc = await db
    .collection("teams")
    .doc(teamId)
    .collection("members")
    .doc(memberUserId)
    .get();

  if (!memberDoc.exists) {
    throw new HttpsError("not-found", "Member not found in team");
  }

  const memberData = memberDoc.data()!;
  
  // Prevent removing owners
  if (memberData.role === "owner") {
    throw new HttpsError("permission-denied", "Cannot remove team owner");
  }

  // Prevent owner from removing themselves
  if (memberUserId === userId && memberData.role === "owner") {
    throw new HttpsError("permission-denied", "Team owner cannot remove themselves. Transfer ownership first or delete the team.");
  }

  // Remove member from team
  await db
    .collection("teams")
    .doc(teamId)
    .collection("members")
    .doc(memberUserId)
    .delete();

  // Remove team reference from user's profile
  await db
    .collection("users")
    .doc(memberUserId)
    .collection("teams")
    .doc(teamId)
    .delete();

  // Update user's stats in stats collection - stats/{userId}
  await db
    .collection("stats")
    .doc(memberUserId)
    .set({
      "activeTeams.activeTeamIds": admin.firestore.FieldValue.arrayRemove(teamId),
    }, { merge: true });

  // If member was an admin, remove from admins array
  if (admins.includes(memberUserId)) {
    await db.collection("teams").doc(teamId).update({
      admins: admin.firestore.FieldValue.arrayRemove(memberUserId),
    });
  }

  // Update team member count and last activity
  await db.collection("teams").doc(teamId).update({
    currentMembers: admin.firestore.FieldValue.increment(-1),
    lastActivity: admin.firestore.FieldValue.serverTimestamp(),
  });

  return { success: true };
}

/**
 * Leave a team (member removing themselves)
 */
async function handleLeaveTeam(
  userId: string,
  params: {
    teamId: string;
  }
) {
  const { teamId } = params;

  if (!teamId) {
    throw new HttpsError("invalid-argument", "teamId is required");
  }

  // Get team data
  const teamDoc = await db.collection("teams").doc(teamId).get();
  if (!teamDoc.exists) {
    throw new HttpsError("not-found", "Team not found");
  }

  // Get member data
  const memberDoc = await db
    .collection("teams")
    .doc(teamId)
    .collection("members")
    .doc(userId)
    .get();

  if (!memberDoc.exists) {
    throw new HttpsError("not-found", "You are not a member of this team");
  }

  const memberData = memberDoc.data()!;

  // Prevent owners from leaving (they must transfer ownership or delete team)
  if (memberData.role === "owner") {
    throw new HttpsError("permission-denied", "Team owner cannot leave. Please transfer ownership first or delete the team.");
  }

  const teamData = teamDoc.data()!;
  const admins = teamData.admins || [];

  // Remove member from team
  await db
    .collection("teams")
    .doc(teamId)
    .collection("members")
    .doc(userId)
    .delete();

  // Remove team reference from user's profile
  await db
    .collection("users")
    .doc(userId)
    .collection("teams")
    .doc(teamId)
    .delete();

  // Update user's stats in stats collection - stats/{userId}
  await db
    .collection("stats")
    .doc(userId)
    .set({
      "activeTeams.activeTeamIds": admin.firestore.FieldValue.arrayRemove(teamId),
    }, { merge: true });

  // If member was an admin, remove from admins array
  if (admins.includes(userId)) {
    await db.collection("teams").doc(teamId).update({
      admins: admin.firestore.FieldValue.arrayRemove(userId),
    });
  }

  // Update team member count and last activity
  await db.collection("teams").doc(teamId).update({
    currentMembers: admin.firestore.FieldValue.increment(-1),
    lastActivity: admin.firestore.FieldValue.serverTimestamp(),
  });

  return { success: true };
}

