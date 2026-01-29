/**
 * Process Challenge Deadlines
 * 
 * This task checks all active challenges to see if their deadline has passed.
 * When a challenge deadline passes:
 * 1. The challenge status is set to 'judging' (waiting for partner to review and release scores)
 * 2. Participants who submitted have their status updated to 'completed'
 * 3. Participants who didn't submit have their status updated to 'expired'
 * 4. Teams tied to the challenge are disabled (status set to 'closed')
 * 5. Notifications are sent to all affected users
 * 6. Participant stats are updated (removed from activeChallenges)
 * 
 * The challenge will move to 'completed' status after the partner releases scores
 * and the processReleasedScores task distributes prizes and sends final notifications.
 */

import * as admin from "firebase-admin";
import { logger } from "firebase-functions/v2";
import { MidnightTask } from "./types";
import { addNotification } from "../../notifications";

const db = admin.firestore();

/**
 * Get today's date at midnight Rwanda time (for comparison)
 */
function getTodayRwandaTime(): Date {
  const now = new Date();
  // Adjust for Rwanda time (UTC+2)
  const rwandaTime = new Date(now.getTime() + (2 * 60 * 60 * 1000));
  // Set to start of day
  rwandaTime.setHours(0, 0, 0, 0);
  return rwandaTime;
}

/**
 * Check if a deadline date has passed
 */
function hasDeadlinePassed(deadline: string | Date | null): boolean {
  if (!deadline) return false;
  
  const today = getTodayRwandaTime();
  const deadlineDate = new Date(deadline);
  deadlineDate.setHours(0, 0, 0, 0);
  
  // Deadline has passed if it's before today
  return deadlineDate < today;
}

/**
 * Process a single expired challenge
 */
async function processExpiredChallenge(challengeDoc: admin.firestore.DocumentSnapshot): Promise<{
  challengeId: string;
  participantsCompleted: number;
  participantsExpired: number;
  teamsDisabled: number;
}> {
  const challengeId = challengeDoc.id;
  const challengeData = challengeDoc.data()!;
  const challengeTitle = challengeData.title || "Challenge";
  
  logger.info(`Processing expired challenge: ${challengeTitle}`, { challengeId });

  // 2. Process users who submitted (mark as completed)
  const submittedUsersSnapshot = await db.collectionGroup("challenges")
    .where("challengeId", "==", challengeId)
    .where("status", "==", "submitted")
    .get();

  let participantsCompleted = 0;

  for (const userChallengeDoc of submittedUsersSnapshot.docs) {
    try {
      const pathParts = userChallengeDoc.ref.path.split("/");
      const userId = pathParts[1];

      // Update status to 'completed'
      await userChallengeDoc.ref.update({
        status: "completed",
        completedAt: admin.firestore.FieldValue.serverTimestamp(),
        completedReason: "deadline_passed"
      });

      // Update participant stats - remove from active challenges
      const userStatsRef = db.collection("stats").doc(userId);
      await userStatsRef.set({
        "activeChallenges.activeChallengeIds": admin.firestore.FieldValue.arrayRemove(challengeId)
      }, { merge: true });

      // Send notification
      await addNotification(userId, {
        type: "success",
        title: "Challenge Completed!",
        message: `The challenge "${challengeTitle}" has ended. Your submission has been recorded successfully!`,
        link: "/dashboard?tab=challenges",
        metadata: { challengeId, challengeTitle }
      });

      participantsCompleted++;
    } catch (error) {
      logger.error(`Failed to update submitted participant for challenge ${challengeId}`, { error });
    }
  }

  // 3. Process users who didn't submit (mark as expired)
  const inProgressUsersSnapshot = await db.collectionGroup("challenges")
    .where("challengeId", "==", challengeId)
    .where("status", "==", "in-progress")
    .get();

  let participantsExpired = 0;

  for (const userChallengeDoc of inProgressUsersSnapshot.docs) {
    try {
      const pathParts = userChallengeDoc.ref.path.split("/");
      const userId = pathParts[1];

      // Update status to 'expired' (deadline passed without submission)
      await userChallengeDoc.ref.update({
        status: "expired",
        expiredAt: admin.firestore.FieldValue.serverTimestamp(),
        expiredReason: "deadline_passed"
      });

      // Update participant stats - remove from active challenges
      const userStatsRef = db.collection("stats").doc(userId);
      await userStatsRef.set({
        "activeChallenges.activeChallengeIds": admin.firestore.FieldValue.arrayRemove(challengeId)
      }, { merge: true });

      // Send notification
      await addNotification(userId, {
        type: "warning",
        title: "Challenge Expired",
        message: `The challenge "${challengeTitle}" has ended. Unfortunately, you did not submit before the deadline.`,
        link: "/dashboard?tab=challenges",
        metadata: { challengeId, challengeTitle }
      });

      participantsExpired++;
    } catch (error) {
      logger.error(`Failed to update in-progress participant for challenge ${challengeId}`, { error });
    }
  }

  // 4. Disable all teams tied to this challenge
  const teamsSnapshot = await db.collection("teams")
    .where("challengeId", "==", challengeId)
    .where("status", "==", "active")
    .get();

  let teamsDisabled = 0;
  let teamsSubmitted = 0;

  for (const teamDoc of teamsSnapshot.docs) {
    try {
      const teamData = teamDoc.data();
      const teamName = teamData.name || "Team";

      // Track if team submitted
      if (teamData.hasSubmitted) {
        teamsSubmitted++;
      }

      // Update team status to 'closed'
      await teamDoc.ref.update({
        status: "closed",
        closedAt: admin.firestore.FieldValue.serverTimestamp(),
        closedReason: "challenge_ended"
      });

      // Get all team members to notify them
      const membersSnapshot = await teamDoc.ref.collection("members")
        .where("status", "==", "active")
        .get();

      for (const memberDoc of membersSnapshot.docs) {
        try {
          const memberData = memberDoc.data();
          const memberId = memberData.userId;

          // Update member stats - remove from active teams
          const memberStatsRef = db.collection("stats").doc(memberId);
          await memberStatsRef.set({
            "activeTeams.activeTeamIds": admin.firestore.FieldValue.arrayRemove(teamDoc.id)
          }, { merge: true });

          // Send notification to team member
          await addNotification(memberId, {
            type: "info",
            title: "Team Closed",
            message: `Your team "${teamName}" has been closed because the challenge "${challengeTitle}" has ended.`,
            link: "/dashboard?tab=teams",
            metadata: { teamId: teamDoc.id, teamName, challengeId, challengeTitle }
          });
        } catch (error) {
          logger.error(`Failed to notify team member for team ${teamDoc.id}`, { error });
        }
      }

      teamsDisabled++;
    } catch (error) {
      logger.error(`Failed to disable team ${teamDoc.id} for challenge ${challengeId}`, { error });
    }
  }

  // 5. Calculate completion stats for the partner dashboard
  const totalParticipants = participantsCompleted + participantsExpired;
  const completionRate = totalParticipants > 0 
    ? Math.round((participantsCompleted / totalParticipants) * 100) 
    : 0;
  const teamCompletionRate = teamsDisabled > 0
    ? Math.round((teamsSubmitted / teamsDisabled) * 100)
    : 0;

  // 1. Update challenge status to 'judging' (waiting for partner to release scores)
  await challengeDoc.ref.update({
    status: "judging",
    judgingStartedAt: admin.firestore.FieldValue.serverTimestamp(),
    statusReason: "deadline_passed",
    // Completion stats for partner dashboard
    completionStats: {
      totalParticipants,
      submittedCount: participantsCompleted,
      expiredCount: participantsExpired,
      completionRate,
      totalTeams: teamsDisabled,
      teamsSubmitted,
      teamCompletionRate,
      calculatedAt: admin.firestore.FieldValue.serverTimestamp()
    }
  });

  // 6. Update organization stats - remove from active challenges and update completion rate
  if (challengeData.organizationId) {
    const orgId = challengeData.organizationId;
    const orgStatsRef = db.collection("stats").doc(`org_${orgId}`);
    
    // Get current stats to calculate new completion rate
    const orgStatsDoc = await orgStatsRef.get();
    const orgStatsData = orgStatsDoc.data() || {};
    
    // Get current completion rate data
    const currentCompletionRate = orgStatsData.completionRate || { value: 0, prev: 0 };
    const currentTotalParticipants = orgStatsData._completionTracking?.totalParticipants || 0;
    const currentTotalSubmissions = orgStatsData._completionTracking?.totalSubmissions || 0;
    
    // Add this challenge's stats
    const newTotalParticipants = currentTotalParticipants + totalParticipants;
    const newTotalSubmissions = currentTotalSubmissions + participantsCompleted;
    
    // Calculate new overall completion rate
    const newCompletionRate = newTotalParticipants > 0
      ? Math.round((newTotalSubmissions / newTotalParticipants) * 100)
      : 0;

    await orgStatsRef.set({
      "activeChallenges.activeChallengeIds": admin.firestore.FieldValue.arrayRemove(challengeId),
      // completionRate follows { value, prev } format like other stats
      "completionRate.value": newCompletionRate,
      "completionRate.prev": currentCompletionRate.value, // Previous becomes the old value
      // Internal tracking for weighted average calculation
      "_completionTracking.totalParticipants": newTotalParticipants,
      "_completionTracking.totalSubmissions": newTotalSubmissions,
      "_completionTracking.updatedAt": admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    logger.info(`Updated org ${orgId} completion rate: ${newCompletionRate}%`, {
      totalParticipants: newTotalParticipants,
      totalSubmissions: newTotalSubmissions
    });
  }

  return { challengeId, participantsCompleted, participantsExpired, teamsDisabled };
}

/**
 * The task implementation
 */
async function run(): Promise<void> {
  logger.info("Checking for expired challenge deadlines...");

  // Find all active challenges
  const activeChallengesSnapshot = await db.collection("challenges")
    .where("status", "==", "active")
    .get();

  logger.info(`Found ${activeChallengesSnapshot.size} active challenges to check`);

  let expiredCount = 0;
  let totalParticipantsCompleted = 0;
  let totalParticipantsExpired = 0;
  let totalTeamsDisabled = 0;
  const expiredChallenges: string[] = [];

  for (const challengeDoc of activeChallengesSnapshot.docs) {
    const data = challengeDoc.data();
    
    // Check if deadline has passed
    if (hasDeadlinePassed(data.deadline)) {
      try {
        const result = await processExpiredChallenge(challengeDoc);
        expiredCount++;
        totalParticipantsCompleted += result.participantsCompleted;
        totalParticipantsExpired += result.participantsExpired;
        totalTeamsDisabled += result.teamsDisabled;
        expiredChallenges.push(result.challengeId);
      } catch (error) {
        logger.error(`Failed to process expired challenge ${challengeDoc.id}`, { error });
      }
    }
  }

  logger.info("Deadline processing complete", {
    checkedChallenges: activeChallengesSnapshot.size,
    expiredChallenges: expiredCount,
    participantsCompleted: totalParticipantsCompleted,
    participantsExpired: totalParticipantsExpired,
    teamsDisabled: totalTeamsDisabled,
    challengeIds: expiredChallenges
  });
}

export const processDeadlinesTask: MidnightTask = {
  name: "processDeadlines",
  description: "Checks active challenges for passed deadlines, marks them as 'judging', updates participant statuses, disables teams, and sends notifications",
  enabled: true,
  run
};
