/**
 * Midnight Task: Send Challenge Submission Reminders
 *
 * This task runs nightly and sends reminder notifications to users and teams
 * who have joined a challenge but have not submitted, and the deadline is in 3 days.
 */

import * as admin from "firebase-admin";
import { logger } from "firebase-functions/v2";
import { MidnightTask } from "./types";
import { addNotification } from "../../notifications";

const db = admin.firestore();

function getRwandaDatePlusDays(days: number): Date {
  const now = new Date();
  // Rwanda is UTC+2
  const rwandaTime = new Date(now.getTime() + (2 * 60 * 60 * 1000));
  rwandaTime.setHours(0, 0, 0, 0);
  rwandaTime.setDate(rwandaTime.getDate() + days);
  return rwandaTime;
}

async function run(): Promise<void> {
  logger.info("Running challenge submission reminders...");

  // Find all active challenges with deadline in 3 days
  const targetDate = getRwandaDatePlusDays(3);
  const challengesSnapshot = await db.collection("challenges")
    .where("status", "==", "active")
    .get();

  for (const challengeDoc of challengesSnapshot.docs) {
    const challengeData = challengeDoc.data();
    if (!challengeData.deadline) continue;
    const deadlineDate = new Date(challengeData.deadline);
    deadlineDate.setHours(0, 0, 0, 0);
    if (deadlineDate.getTime() !== targetDate.getTime()) continue;

    const challengeId = challengeDoc.id;
    const challengeTitle = challengeData.title || "Challenge";

    // Remind users who joined but haven't submitted
    const userChallengesSnapshot = await db.collectionGroup("challenges")
      .where("challengeId", "==", challengeId)
      .where("status", "==", "in-progress")
      .get();

    for (const userChallengeDoc of userChallengesSnapshot.docs) {
      const pathParts = userChallengeDoc.ref.path.split("/");
      const userId = pathParts[1];

      try {
        await addNotification(userId, {
          type: "warning",
          title: "Challenge Submission Reminder",
          message: `Only 3 days left to submit for "${challengeTitle}"! Don't miss your chance to participate.`,
          link: "/dashboard?tab=challenges",
          metadata: { challengeId, challengeTitle }
        });
      } catch (error) {
        logger.error(`Failed to send reminder to user ${userId} for challenge ${challengeId}`, { error });
      }
    }

    // Remind teams who haven't submitted
    const teamsSnapshot = await db.collection("teams")
      .where("challengeId", "==", challengeId)
      .where("status", "==", "active")
      .where("hasSubmitted", "==", false)
      .get();

    for (const teamDoc of teamsSnapshot.docs) {
      const teamData = teamDoc.data();
      const teamName = teamData.name || "Team";
      // Notify all team members
      const membersSnapshot = await teamDoc.ref.collection("members")
        .where("status", "==", "active")
        .get();
      for (const memberDoc of membersSnapshot.docs) {
        const memberData = memberDoc.data();
        const memberId = memberData.userId;

        try {
          await addNotification(memberId, {
            type: "warning",
            title: "Team Submission Reminder",
            message: `Only 3 days left for your team "${teamName}" to submit for "${challengeTitle}"! Encourage your team to participate.`,
            link: "/dashboard?tab=teams",
            metadata: { teamId: teamDoc.id, teamName, challengeId, challengeTitle }
          });
        } catch (error) {
          logger.error(`Failed to send reminder to team member ${memberId} for team ${teamDoc.id}`, { error });
        }
      }
    }
  }

  logger.info("Challenge submission reminders sent.");
}

export const sendRemindersTask: MidnightTask = {
  name: "sendReminders",
  description: "Sends reminder notifications to users and teams 3 days before challenge deadline if not submitted",
  enabled: true,
  run
};
